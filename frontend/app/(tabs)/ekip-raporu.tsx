import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface EkipRaporuRecord {
  _id: string;
  ay: string;
  tarih: number;
  toplam: number;
  [key: string]: any;
}

interface YilToplam {
  yil_toplam_karton: { [key: string]: number };
  yil_toplam_kasa: { [key: string]: number };
}

const skuLabels: { [key: string]: string } = {
  skt_camel_yellow_100: 'SKT Camel Yellow 100',
  camel_brown: 'Camel Brown',
  camel_black: 'Camel Black',
  camel_white: 'Camel White',
  camel_yellow_sp: 'Camel Yellow Sp',
  camel_yellow: 'Camel Yellow',
  camel_deep_blue_long: 'Camel Deep Blue Long',
  camel_deep_blue: 'Camel Deep Blue',
  camel_yellow_long: 'Camel Yellow Long',
  camel_slender_blue: 'Camel Slender Blue',
  dp_camel_slender_blueline: 'DP Camel Slender BlueLine',
  camel_slender_gray: 'Camel Slender Gray',
  dp_camel_slender_grayline: 'DP Camel Slender GrayLine',
  winston_red_long: 'Winston Red Long',
  winston_red: 'Winston Red',
  winston_blue_long: 'Winston Blue Long',
  winston_blue: 'Winston Blue',
  winston_gray: 'Winston Gray',
  winston_slims_blue: 'Winston Slims Blue',
  winston_slims_gray: 'Winston Slims Gray',
  winston_slims_q_line: 'Winston Slims Q Line',
  winston_xsence_black: 'Winston Xsence Black',
  winston_xsence_gray: 'Winston Xsence Gray',
  winston_dark_blue_long: 'Winston Dark Blue Long',
  winston_dark_blue: 'Winston Dark Blue',
  winston_deep_blue: 'Winston Deep Blue',
  winston_slender_blue_long: 'Winston Slender Blue Long',
  winston_slender_blue: 'Winston Slender Blue',
  winston_slender_gray: 'Winston Slender Gray',
  winston_slender_dark_blue: 'Winston Slender Dark Blue',
  winston_slender_q_line: 'Winston Slender Q Line',
  monte_carlo_red: 'Monte Carlo Red',
  monte_carlo_dark_blue_long: 'Monte Carlo Dark Blue Long',
  monte_carlo_dark_blue: 'Monte Carlo Dark Blue',
  monte_carlo_slender_dark_blue: 'Monte Carlo Slender Dark Blue',
  ld_slims: 'LD Slims',
  ld_blue_long: 'LD Blue Long',
  ld_blue: 'LD Blue',
  toplam: 'TOPLAM',
};

export default function EkipRaporuScreen() {
  const [aylar, setAylar] = useState<string[]>([]);
  const [selectedAy, setSelectedAy] = useState<string>('');
  const [gunler, setGunler] = useState<EkipRaporuRecord[]>([]);
  const [selectedGun, setSelectedGun] = useState<EkipRaporuRecord | null>(null);
  const [yilToplam, setYilToplam] = useState<YilToplam | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAylar = async () => {
    try {
      const [aylarRes, toplamRes] = await Promise.all([
        api.get('/ekip-raporu/aylar'),
        api.get('/ekip-raporu-toplam')
      ]);
      setAylar(aylarRes.data);
      setYilToplam(toplamRes.data);
      if (aylarRes.data.length > 0 && !selectedAy) {
        setSelectedAy(aylarRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching aylar:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGunler = async (ay: string) => {
    try {
      const response = await api.get(`/ekip-raporu/${ay}`);
      setGunler(response.data);
      setSelectedGun(null);
    } catch (error) {
      console.error('Error fetching gunler:', error);
    }
  };

  useEffect(() => {
    fetchAylar();
  }, []);

  useEffect(() => {
    if (selectedAy) {
      fetchGunler(selectedAy);
    }
  }, [selectedAy]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAylar();
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const formatDate = (excelDate: number) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const ayToplam = gunler.reduce((sum, g) => sum + (g.toplam || 0), 0);
  const ayKasa = ayToplam / 24;

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
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="calendar" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Günlük Ekip Raporu</Text>
        </View>

        {/* Ay Seçici */}
        <Text style={styles.sectionTitle}>Ay Seç</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ayContainer}>
          {aylar.map((ay) => (
            <TouchableOpacity
              key={ay}
              style={[styles.ayButton, selectedAy === ay && styles.ayButtonActive]}
              onPress={() => setSelectedAy(ay)}
            >
              <Text style={[styles.ayText, selectedAy === ay && styles.ayTextActive]}>{ay}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ay Toplam */}
        <View style={styles.toplamCard}>
          <Text style={styles.toplamLabel}>{selectedAy} Toplam</Text>
          <View style={styles.toplamRow}>
            <View>
              <Text style={styles.toplamSubLabel}>Karton</Text>
              <Text style={styles.toplamValue}>{formatNumber(ayToplam)}</Text>
            </View>
            <View>
              <Text style={styles.toplamSubLabel}>Kasa</Text>
              <Text style={styles.toplamValue}>{formatNumber(ayKasa)}</Text>
            </View>
          </View>
        </View>

        {/* Günler Listesi */}
        <Text style={styles.sectionTitle}>Günler ({gunler.length} gün)</Text>
        {gunler.map((gun) => (
          <TouchableOpacity
            key={gun._id}
            style={[styles.gunCard, selectedGun?._id === gun._id && styles.gunCardActive]}
            onPress={() => setSelectedGun(selectedGun?._id === gun._id ? null : gun)}
          >
            <View style={styles.gunHeader}>
              <Text style={styles.gunDate}>{formatDate(gun.tarih)}</Text>
              <Text style={styles.gunToplam}>{formatNumber(gun.toplam)}</Text>
              <Ionicons
                name={selectedGun?._id === gun._id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#D4AF37"
              />
            </View>
            
            {selectedGun?._id === gun._id && (
              <View style={styles.gunDetail}>
                {Object.keys(skuLabels).map((key) => {
                  const value = gun[key];
                  if (key === 'toplam' || value === 0 || value === undefined) return null;
                  return (
                    <View key={key} style={styles.skuRow}>
                      <Text style={styles.skuLabel}>{skuLabels[key]}</Text>
                      <Text style={styles.skuValue}>{formatNumber(value)}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Yıl Toplam */}
        {yilToplam && (
          <View style={styles.yilToplamCard}>
            <Text style={styles.yilToplamTitle}>Yıl Toplam</Text>
            <View style={styles.toplamRow}>
              <View>
                <Text style={styles.toplamSubLabel}>Karton</Text>
                <Text style={styles.yilToplamValue}>
                  {formatNumber(yilToplam.yil_toplam_karton?.toplam)}
                </Text>
              </View>
              <View>
                <Text style={styles.toplamSubLabel}>Kasa</Text>
                <Text style={styles.yilToplamValue}>
                  {formatNumber(yilToplam.yil_toplam_kasa?.toplam)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 16,
    marginBottom: 8,
  },
  ayContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    marginRight: 8,
  },
  ayButtonActive: {
    backgroundColor: '#D4AF37',
  },
  ayText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  ayTextActive: {
    color: '#0a0a0a',
  },
  toplamCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  toplamLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  toplamRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toplamSubLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  toplamValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  gunCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  gunCardActive: {
    borderLeftColor: '#4CAF50',
  },
  gunHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gunDate: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  gunToplam: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  gunDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  skuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  skuLabel: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  skuValue: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  yilToplamCard: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  yilToplamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 12,
  },
  yilToplamValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
