import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

interface Bayi {
  bayi_kodu: string;
  bayi_unvani: string;
  sinif: string;
  bayi_durumu: string;
}

export default function DSTSinifBayilerScreen() {
  const { dst, sinif } = useLocalSearchParams<{ dst: string; sinif: string }>();
  const router = useRouter();
  const [bayiler, setBayiler] = useState<Bayi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBayiler = async () => {
    try {
      const response = await api.get(`/dst-sinif-bayiler/${encodeURIComponent(dst)}/${encodeURIComponent(sinif)}`);
      setBayiler(response.data);
    } catch (error) {
      console.error('Error fetching bayiler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (dst && sinif) {
      fetchBayiler();
    }
  }, [dst, sinif]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBayiler();
  };

  const renderBayi = ({ item }: { item: Bayi }) => (
    <TouchableOpacity
      style={styles.bayiCard}
      onPress={() => router.push(`/bayi/${item.bayi_kodu}`)}
      activeOpacity={0.7}
    >
      <View style={styles.bayiInfo}>
        <Text style={styles.bayiUnvan} numberOfLines={2}>{item.bayi_unvani}</Text>
        <View style={styles.bayiMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="barcode-outline" size={14} color="#888" />
            <Text style={styles.metaText}>{item.bayi_kodu?.replace('.0', '')}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.bayi_durumu === 'Aktif' ? styles.aktiveBadge : styles.pasifBadge
        ]}>
          <Text style={styles.statusText}>{item.bayi_durumu}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
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
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{sinif} Sınıfı Bayiler</Text>
          <Text style={styles.headerSubtitle}>{decodeURIComponent(dst)} - {bayiler.length} Bayi</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="storefront" size={24} color="#D4AF37" />
          <Text style={styles.summaryValue}>{bayiler.length}</Text>
          <Text style={styles.summaryLabel}>Toplam Bayi</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {bayiler.filter(b => b.bayi_durumu === 'Aktif').length}
          </Text>
          <Text style={styles.summaryLabel}>Aktif</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="close-circle" size={24} color="#FFC107" />
          <Text style={[styles.summaryValue, { color: '#FFC107' }]}>
            {bayiler.filter(b => b.bayi_durumu !== 'Aktif').length}
          </Text>
          <Text style={styles.summaryLabel}>Pasif</Text>
        </View>
      </View>

      {/* Bayi List */}
      <FlatList
        data={bayiler}
        keyExtractor={(item) => item.bayi_kodu}
        renderItem={renderBayi}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Bu sınıfta bayi bulunamadı</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  bayiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  bayiInfo: {
    flex: 1,
  },
  bayiUnvan: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  bayiMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  aktiveBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  pasifBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
