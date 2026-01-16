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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';

interface CariBayi {
  bayi_kodu: string;
  unvan: string;
  dst: string;
  dsm: string;
  tip?: string;
  sinif?: string;
  musteri_bakiyesi?: number;
  gun_deger?: number;
}

export default function CariBayilerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dst = params.dst as string;
  const gun = params.gun as string || 'toplam';
  
  const [bayiler, setBayiler] = useState<CariBayi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const gunLabels: { [key: string]: string } = {
    '0': '0 Gün',
    '1': '1 Gün',
    '2': '2 Gün',
    '3': '3 Gün',
    '4': '4 Gün',
    '5': '5 Gün',
    '6': '6 Gün',
    '7': '7 Gün',
    '8': '8 Gün',
    '9': '9 Gün',
    '10': '10 Gün',
    '11': '11 Gün',
    '12': '12 Gün',
    '13': '13 Gün',
    '14_uzeri': '14+ Gün',
    'toplam': 'Toplam Bakiye',
  };

  const fetchCariBayiler = async () => {
    try {
      const dstDecoded = decodeURIComponent(dst);
      const response = await api.get(`/cari-bayiler/${encodeURIComponent(dstDecoded)}?gun=${gun}`);
      setBayiler(response.data);
    } catch (error) {
      console.error('Error fetching cari bayiler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCariBayiler();
  }, [dst, gun]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCariBayiler();
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' ₺';
  };

  const renderBayiItem = ({ item }: { item: CariBayi }) => (
    <TouchableOpacity
      style={styles.bayiCard}
      onPress={() => router.push(`/bayi/${item.bayi_kodu}`)}
      activeOpacity={0.7}
    >
      <View style={styles.bayiHeader}>
        <View style={styles.bayiKoduContainer}>
          <Text style={styles.bayiKodu}>{item.bayi_kodu}</Text>
        </View>
        <View style={styles.sinifBadge}>
          <Text style={styles.sinifText}>{item.sinif || '-'}</Text>
        </View>
      </View>
      
      <Text style={styles.bayiUnvani} numberOfLines={2}>{item.unvan}</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Tip</Text>
          <Text style={styles.infoValue}>{item.tip || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DSM</Text>
          <Text style={styles.infoValue}>{item.dsm || '-'}</Text>
        </View>
      </View>
      
      <View style={styles.bakiyeRow}>
        <View style={styles.bakiyeItem}>
          <Text style={styles.bakiyeLabel}>Müşteri Bakiyesi</Text>
          <Text style={styles.bakiyeValue}>{formatCurrency(item.musteri_bakiyesi)}</Text>
        </View>
        <View style={styles.bakiyeItem}>
          <Text style={styles.bakiyeLabel}>{gunLabels[gun]}</Text>
          <Text style={[styles.bakiyeValue, styles.highlightValue]}>{formatCurrency(item.gun_deger)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalBakiye = bayiler.reduce((sum, b) => sum + (b.gun_deger || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{decodeURIComponent(dst)}</Text>
          <Text style={styles.headerSubtitle}>{gunLabels[gun]} - Carili Bayiler</Text>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{bayiler.length}</Text>
          <Text style={styles.summaryLabel}>Bayi Sayısı</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, styles.highlightValue]}>{formatCurrency(totalBakiye)}</Text>
          <Text style={styles.summaryLabel}>Toplam {gunLabels[gun]}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
        </View>
      ) : bayiler.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Bu kategoride carili bayi bulunmamaktadır</Text>
        </View>
      ) : (
        <FlatList
          data={bayiler}
          renderItem={renderBayiItem}
          keyExtractor={(item) => item.bayi_kodu}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  bayiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  bayiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bayiKoduContainer: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bayiKodu: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  sinifBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sinifText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  bayiUnvani: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  bakiyeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bakiyeItem: {
    alignItems: 'center',
  },
  bakiyeLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  bakiyeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  highlightValue: {
    color: '#D4AF37',
  },
  separator: {
    height: 12,
  },
});
