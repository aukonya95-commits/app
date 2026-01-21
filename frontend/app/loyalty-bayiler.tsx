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
import { useRouter } from 'expo-router';
import api from '../src/services/api';

interface LoyaltyBayi {
  bayi_kodu: string;
  bayi_adi: string;
  tte_adi?: string;
  dst_adi?: string;
  dsm?: string;
  tutar?: number;
}

export default function LoyaltyBayilerScreen() {
  const router = useRouter();
  const [bayiler, setBayiler] = useState<LoyaltyBayi[]>([]);
  const [filteredBayiler, setFilteredBayiler] = useState<LoyaltyBayi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const response = await api.get('/loyalty-bayiler');
      setBayiler(response.data);
      setFilteredBayiler(response.data);
    } catch (error) {
      console.error('Error fetching loyalty bayiler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = bayiler.filter(b =>
        b.bayi_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bayi_kodu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.dst_adi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBayiler(filtered);
    } else {
      setFilteredBayiler(bayiler);
    }
  }, [searchQuery, bayiler]);

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
          <Text style={styles.headerTitle}>Loyalty Bayiler</Text>
          <Text style={styles.headerSubtitle}>{filteredBayiler.length} bayi</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Bayi ara..."
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
        {filteredBayiler.map((bayi, index) => (
          <TouchableOpacity
            key={index}
            style={styles.bayiCard}
            onPress={() => router.push(`/bayi/${bayi.bayi_kodu}`)}
          >
            <View style={styles.bayiInfo}>
              <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
              <Text style={styles.bayiAdi}>{bayi.bayi_adi}</Text>
              <View style={styles.bayiMeta}>
                {bayi.dst_adi && <Text style={styles.metaText}>DST: {bayi.dst_adi}</Text>}
                {bayi.tte_adi && <Text style={styles.metaText}>TTE: {bayi.tte_adi}</Text>}
              </View>
            </View>
            <View style={styles.bayiRight}>
              {bayi.tutar !== undefined && (
                <Text style={styles.tutarText}>{formatCurrency(bayi.tutar)}</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
            </View>
          </TouchableOpacity>
        ))}

        {filteredBayiler.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>Loyalty bayi bulunamadı</Text>
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
  bayiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  bayiInfo: { flex: 1 },
  bayiKodu: { fontSize: 12, color: '#D4AF37', marginBottom: 4 },
  bayiAdi: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  bayiMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: { fontSize: 12, color: '#888' },
  bayiRight: { alignItems: 'flex-end', gap: 4 },
  tutarText: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { color: '#666', fontSize: 16, marginTop: 16 },
  bottomPadding: { height: 40 },
});
