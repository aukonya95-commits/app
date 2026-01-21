import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';

interface KanalMusteri {
  bayi_kodu: string;
  unvan?: string;
  bayi_unvani?: string;
  dst?: string;
  dsm?: string;
  musteri_bakiyesi?: number;
  kanal?: string;
  tip?: string;
  bayi_durumu?: string;
}

const kanalAdlari: { [key: string]: string } = {
  'piyasa': 'Piyasa',
  'yerel-zincir': 'Yerel Zincir',
  'askeriye': 'Askeriye + Cezaevi',
  'benzinlik': 'Benzinlik',
  'geleneksel': 'Geleneksel',
};

export default function KanalMusterileriScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const kanal = params.kanal as string;
  
  const [musteriler, setMusteriler] = useState<KanalMusteri[]>([]);
  const [filteredMusteriler, setFilteredMusteriler] = useState<KanalMusteri[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const kanalAdi = kanalAdlari[kanal] || kanal;

  const fetchData = async () => {
    try {
      const response = await api.get(`/kanal-musterileri/${encodeURIComponent(kanal)}`);
      setMusteriler(response.data);
      setFilteredMusteriler(response.data);
    } catch (error) {
      console.error('Error fetching kanal musterileri:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kanal]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = musteriler.filter(m =>
        (m.unvan || m.bayi_unvani || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bayi_kodu?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMusteriler(filtered);
    } else {
      setFilteredMusteriler(musteriler);
    }
  }, [searchQuery, musteriler]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{kanalAdi}</Text>
          <Text style={styles.headerSubtitle}>{filteredMusteriler.length} müşteri</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Müşteri ara..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {filteredMusteriler.map((musteri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.musteriCard}
            onPress={() => router.push(`/bayi/${musteri.bayi_kodu}`)}
          >
            <View style={styles.musteriInfo}>
              <Text style={styles.musteriKodu}>{musteri.bayi_kodu}</Text>
              <Text style={styles.musteriUnvan}>{musteri.unvan || musteri.bayi_unvani}</Text>
              <View style={styles.musteriMeta}>
                {musteri.dst && <Text style={styles.metaText}>DST: {musteri.dst}</Text>}
                {musteri.tip && <Text style={styles.metaText}>Tip: {musteri.tip}</Text>}
              </View>
            </View>
            <View style={styles.musteriRight}>
              {musteri.bayi_durumu && (
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: musteri.bayi_durumu === 'AKTİF' ? '#4CAF5020' : '#FFC10720' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: musteri.bayi_durumu === 'AKTİF' ? '#4CAF50' : '#FFC107' }
                  ]}>
                    {musteri.bayi_durumu}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
            </View>
          </TouchableOpacity>
        ))}

        {filteredMusteriler.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>Müşteri bulunamadı</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: 16, fontSize: 16, color: '#888' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 0 },
  musteriCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  musteriInfo: { flex: 1 },
  musteriKodu: { fontSize: 12, color: '#2196F3', marginBottom: 4 },
  musteriUnvan: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  musteriMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: { fontSize: 12, color: '#888' },
  musteriRight: { alignItems: 'flex-end', gap: 4 },
  bakiyeText: { fontSize: 14, fontWeight: 'bold', color: '#FF5722' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { color: '#666', fontSize: 16, marginTop: 16 },
  bottomPadding: { height: 40 },
});
