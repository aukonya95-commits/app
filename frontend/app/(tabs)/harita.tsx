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
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

interface IlceData {
  ilce: string;
  bayi_sayisi: number;
  aktif_bayi: number;
  pasif_bayi: number;
  toplam_satis: number;
  hedef: number;
  basari_orani: number;
}

// Konya ilçeleri koordinatları (basitleştirilmiş)
const konyaIlceleri = [
  { id: 'selcuklu', name: 'Selçuklu', x: 180, y: 150 },
  { id: 'meram', name: 'Meram', x: 150, y: 200 },
  { id: 'karatay', name: 'Karatay', x: 220, y: 180 },
  { id: 'aksehir', name: 'Akşehir', x: 50, y: 80 },
  { id: 'beysehir', name: 'Beyşehir', x: 80, y: 280 },
  { id: 'seydisehir', name: 'Seydişehir', x: 140, y: 320 },
  { id: 'cihanbeyli', name: 'Cihanbeyli', x: 280, y: 60 },
  { id: 'cumra', name: 'Çumra', x: 250, y: 250 },
  { id: 'eregli', name: 'Ereğli', x: 350, y: 220 },
  { id: 'ilgin', name: 'Ilgın', x: 100, y: 100 },
  { id: 'kadinhani', name: 'Kadınhanı', x: 120, y: 140 },
  { id: 'karapinar', name: 'Karapınar', x: 330, y: 280 },
  { id: 'kulu', name: 'Kulu', x: 300, y: 30 },
  { id: 'sarayonu', name: 'Sarayönü', x: 200, y: 100 },
  { id: 'bozkir', name: 'Bozkır', x: 200, y: 350 },
  { id: 'hadim', name: 'Hadim', x: 250, y: 380 },
];

export default function HaritaScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIlce, setSelectedIlce] = useState<string | null>(null);
  const [ilceVerileri, setIlceVerileri] = useState<{ [key: string]: IlceData }>({});
  const [toplamVeriler, setToplamVeriler] = useState<any>(null);

  const fetchData = async () => {
    try {
      // Genel verileri al
      const [totalsRes, statsRes] = await Promise.all([
        api.get('/distributor-totals'),
        api.get('/dashboard/stats'),
      ]);
      
      setToplamVeriler({
        ...totalsRes.data,
        ...statsRes.data,
      });

      // İlçe bazlı veriler için simüle edilmiş data
      // Gerçek uygulamada backend'den ilçe bazlı veri gelecek
      const ilceData: { [key: string]: IlceData } = {};
      konyaIlceleri.forEach(ilce => {
        ilceData[ilce.id] = {
          ilce: ilce.name,
          bayi_sayisi: Math.floor(Math.random() * 200) + 50,
          aktif_bayi: Math.floor(Math.random() * 180) + 40,
          pasif_bayi: Math.floor(Math.random() * 20),
          toplam_satis: Math.floor(Math.random() * 50000) + 10000,
          hedef: Math.floor(Math.random() * 60000) + 15000,
          basari_orani: Math.floor(Math.random() * 40) + 50,
        };
      });
      setIlceVerileri(ilceData);
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

  const getIlceColor = (ilceId: string) => {
    const data = ilceVerileri[ilceId];
    if (!data) return '#333';
    
    const oran = data.basari_orani;
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
          <Text style={styles.loaderText}>Harita yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedData = selectedIlce ? ilceVerileri[selectedIlce] : null;

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
          <Text style={styles.headerTitle}>Konya İlçe Haritası</Text>
          <Text style={styles.headerSubtitle}>Satış performansı görünümü</Text>
        </View>

        {/* Harita */}
        <View style={styles.mapContainer}>
          <Svg width={width - 40} height={420} viewBox="0 0 400 420">
            {/* Konya sınırları (basitleştirilmiş) */}
            <Path
              d="M50 50 L350 30 L380 150 L370 300 L300 400 L150 410 L50 350 L30 200 Z"
              fill="#1a1a2e"
              stroke="#333"
              strokeWidth="2"
            />
            
            {/* İlçe noktaları */}
            {konyaIlceleri.map(ilce => (
              <G key={ilce.id}>
                <TouchableOpacity onPress={() => setSelectedIlce(ilce.id)}>
                  <Path
                    d={`M${ilce.x - 15} ${ilce.y} L${ilce.x} ${ilce.y - 20} L${ilce.x + 15} ${ilce.y} L${ilce.x} ${ilce.y + 10} Z`}
                    fill={selectedIlce === ilce.id ? '#D4AF37' : getIlceColor(ilce.id)}
                    stroke={selectedIlce === ilce.id ? '#fff' : '#555'}
                    strokeWidth={selectedIlce === ilce.id ? 2 : 1}
                  />
                </TouchableOpacity>
                <SvgText
                  x={ilce.x}
                  y={ilce.y + 25}
                  fill="#888"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {ilce.name}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>

        {/* Renk Açıklaması */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Başarı Oranı</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendItem, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>80%+</Text>
            <View style={[styles.legendItem, { backgroundColor: '#8BC34A' }]} />
            <Text style={styles.legendText}>60-80%</Text>
            <View style={[styles.legendItem, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>40-60%</Text>
            <View style={[styles.legendItem, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>20-40%</Text>
            <View style={[styles.legendItem, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>0-20%</Text>
          </View>
        </View>

        {/* Seçili İlçe Detayları */}
        {selectedData ? (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="location" size={24} color="#D4AF37" />
              <Text style={styles.detailTitle}>{selectedData.ilce}</Text>
            </View>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bayi Sayısı</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.bayi_sayisi)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Aktif / Pasif</Text>
                <Text style={styles.detailValue}>
                  <Text style={{ color: '#4CAF50' }}>{selectedData.aktif_bayi}</Text>
                  {' / '}
                  <Text style={{ color: '#f44336' }}>{selectedData.pasif_bayi}</Text>
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Toplam Satış</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.toplam_satis)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hedef</Text>
                <Text style={styles.detailValue}>{formatNumber(selectedData.hedef)} KRT</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Başarı Oranı</Text>
                <Text style={[styles.detailValue, { color: getIlceColor(selectedIlce!) }]}>
                  %{selectedData.basari_orani}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.hintCard}>
            <Ionicons name="hand-left-outline" size={32} color="#888" />
            <Text style={styles.hintText}>Detay görmek için haritada bir ilçeye tıklayın</Text>
          </View>
        )}

        {/* Genel Özet */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Konya Genel Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Toplam Bayi</Text>
              <Text style={styles.summaryValue}>{formatNumber(toplamVeriler?.aktif_bayi + toplamVeriler?.pasif_bayi)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Aktif Bayi</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{formatNumber(toplamVeriler?.aktif_bayi)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ay Satış</Text>
              <Text style={styles.summaryValue}>{formatNumber(toplamVeriler?.aralik_satis)} KRT</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Başarı</Text>
              <Text style={[styles.summaryValue, { color: '#D4AF37' }]}>
                %{toplamVeriler?.hedef_basari_orani?.toFixed(1) || '-'}
              </Text>
            </View>
          </View>
        </View>

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
  scrollContent: { padding: 16 },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  mapContainer: {
    backgroundColor: '#0f0f1a',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPadding: { height: 40 },
});
