import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

interface DSTData {
  dst: string;
  bayi_sayisi?: number;
  aktif_bayi_sayisi?: number;
  pasif_bayi_sayisi?: number;
  aralik_hedef?: number;
  aralik_satis?: number;
  hedef_basari_orani?: number;
  cari_toplam?: number;
}

export default function HaritaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDst, setSelectedDst] = useState<string | null>(null);
  const [dstVerileri, setDstVerileri] = useState<DSTData[]>([]);
  const [toplamVeriler, setToplamVeriler] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [dstRes, totalsRes, statsRes] = await Promise.all([
        api.get('/dst-data'),
        api.get('/distributor-totals'),
        api.get('/dashboard/stats'),
      ]);
      
      setDstVerileri(dstRes.data || []);
      setToplamVeriler({
        ...totalsRes.data,
        ...statsRes.data,
      });
    } catch (error) {
      console.error('Error fetching harita data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getColor = (oran?: number) => {
    if (!oran) return '#333';
    if (oran >= 80) return '#4CAF50';
    if (oran >= 60) return '#8BC34A';
    if (oran >= 40) return '#FFC107';
    if (oran >= 20) return '#FF9800';
    return '#f44336';
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('tr-TR');
  };

  const formatCurrency = (num?: number) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
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

  const selectedData = selectedDst ? dstVerileri.find(d => d.dst === selectedDst) : null;

  // DST'leri satış performansına göre sırala
  const sortedDst = [...dstVerileri].sort((a, b) => (b.hedef_basari_orani || 0) - (a.hedef_basari_orani || 0));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="map" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Konya Satış Haritası</Text>
          <Text style={styles.headerSubtitle}>DST Bazlı Performans Görünümü</Text>
        </View>

        {/* Genel Özet */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={20} color="#4CAF50" />
              <Text style={styles.summaryValue}>{formatNumber((toplamVeriler?.aktif_bayi || 0) + (toplamVeriler?.pasif_bayi || 0))}</Text>
              <Text style={styles.summaryLabel}>Toplam Bayi</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{formatNumber(toplamVeriler?.aktif_bayi)}</Text>
              <Text style={styles.summaryLabel}>Aktif</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={20} color="#D4AF37" />
              <Text style={[styles.summaryValue, { color: '#D4AF37' }]}>%{toplamVeriler?.hedef_basari_orani?.toFixed(1) || '-'}</Text>
              <Text style={styles.summaryLabel}>Başarı</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cart" size={20} color="#2196F3" />
              <Text style={[styles.summaryValue, { color: '#2196F3' }]}>{formatNumber(toplamVeriler?.aralik_satis)}</Text>
              <Text style={styles.summaryLabel}>Satış (KRT)</Text>
            </View>
          </View>
        </View>

        {/* Renk Açıklaması */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Performans Renkleri</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendItem, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>%80+</Text>
            <View style={[styles.legendItem, { backgroundColor: '#8BC34A' }]} />
            <Text style={styles.legendText}>%60-80</Text>
            <View style={[styles.legendItem, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>%40-60</Text>
            <View style={[styles.legendItem, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>%20-40</Text>
            <View style={[styles.legendItem, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>%0-20</Text>
          </View>
        </View>

        {/* Seçili DST Detayları - DST Grid'den önce göster */}
        {selectedData && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="person" size={24} color="#D4AF37" />
              <Text style={styles.detailTitle}>{selectedData.dst}</Text>
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => router.push(`/dst/${encodeURIComponent(selectedData.dst)}`)}
              >
                <Text style={styles.detailButtonText}>Detaya Git</Text>
                <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bayi Sayısı</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.bayi_sayisi)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Aktif / Pasif</Text>
                <Text style={styles.detailValue}>
                  <Text style={{ color: '#4CAF50' }}>{selectedData.aktif_bayi_sayisi || 0}</Text>
                  {' / '}
                  <Text style={{ color: '#f44336' }}>{selectedData.pasif_bayi_sayisi || 0}</Text>
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ay Satış</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.aralik_satis)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hedef</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.aralik_hedef)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Başarı Oranı</Text>
                <Text style={[styles.detailValue, { color: getColor(selectedData.hedef_basari_orani) }]}>
                  %{selectedData.hedef_basari_orani?.toFixed(1) || 0}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cari Toplam</Text>
                <Text style={[styles.detailValue, { color: '#FF5722' }]}>{formatCurrency(selectedData.cari_toplam)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* DST Grid */}
        <Text style={styles.sectionTitle}>DST Performans Tablosu {selectedData ? `(${selectedData.dst} seçili)` : ''}</Text>
        <View style={styles.dstGrid}>
          {sortedDst.map((dst, index) => (
            <TouchableOpacity
              key={dst.dst}
              style={[
                styles.dstCard,
                { borderLeftColor: getColor(dst.hedef_basari_orani) },
                selectedDst === dst.dst && styles.dstCardSelected
              ]}
              onPress={() => setSelectedDst(selectedDst === dst.dst ? null : dst.dst)}
              activeOpacity={0.7}
            >
              <View style={styles.dstHeader}>
                <Text style={styles.dstRank}>#{index + 1}</Text>
                <View style={[styles.dstIndicator, { backgroundColor: getColor(dst.hedef_basari_orani) }]} />
              </View>
              <Text style={styles.dstName} numberOfLines={1}>{dst.dst}</Text>
              <View style={styles.dstStats}>
                <Text style={styles.dstStat}>
                  <Text style={{ color: '#4CAF50' }}>{dst.aktif_bayi_sayisi || 0}</Text>
                  <Text style={{ color: '#666' }}> bayi</Text>
                </Text>
                <Text style={[styles.dstPercent, { color: getColor(dst.hedef_basari_orani) }]}>
                  %{dst.hedef_basari_orani?.toFixed(0) || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seçili DST Detayları */}
        {selectedData && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="person" size={24} color="#D4AF37" />
              <Text style={styles.detailTitle}>{selectedData.dst}</Text>
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => router.push(`/dst/${encodeURIComponent(selectedData.dst)}`)}
              >
                <Text style={styles.detailButtonText}>Detaya Git</Text>
                <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bayi Sayısı</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.bayi_sayisi)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Aktif / Pasif</Text>
                <Text style={styles.detailValue}>
                  <Text style={{ color: '#4CAF50' }}>{selectedData.aktif_bayi_sayisi || 0}</Text>
                  {' / '}
                  <Text style={{ color: '#f44336' }}>{selectedData.pasif_bayi_sayisi || 0}</Text>
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ay Satış</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.aralik_satis)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hedef</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.aralik_hedef)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Başarı Oranı</Text>
                <Text style={[styles.detailValue, { color: getColor(selectedData.hedef_basari_orani) }]}>
                  %{selectedData.hedef_basari_orani?.toFixed(1) || 0}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cari Toplam</Text>
                <Text style={[styles.detailValue, { color: '#FF5722' }]}>{formatCurrency(selectedData.cari_toplam)}</Text>
              </View>
            </View>
          </View>
        )}

        {!selectedData && (
          <View style={styles.hintCard}>
            <Ionicons name="hand-left-outline" size={32} color="#888" />
            <Text style={styles.hintText}>Detay görmek için bir DST seçin</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  legendContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  legendItem: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginLeft: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dstGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  dstCard: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    margin: '1%',
    borderLeftWidth: 4,
  },
  dstCardSelected: {
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dstHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dstRank: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  dstIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dstName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  dstStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dstStat: {
    fontSize: 11,
    color: '#888',
  },
  dstPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hintCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },
  bottomPadding: { height: 40 },
});
