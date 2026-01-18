import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

interface DistributorTotals {
  bayi_sayisi?: number;
  aktif_bayi_sayisi?: number;
  pasif_bayi_sayisi?: number;
  aralik_hedef?: number;
  aralik_satis?: number;
  kalan_satis?: number;
  hedef_basari_orani?: number;
  tahsilat_hedef?: number;
  tahsilat_tutari?: number;
  ay_hedef_ziyaret?: number;
  ziyaret_gerceklesen?: number;
  drop_rate?: number;
  basarili_satis?: number;
  basarili_satis_yuzde?: number;
  carili_bayi_sayisi?: number;
  gun_0?: number;
  gun_1?: number;
  gun_2?: number;
  gun_3?: number;
  gun_4?: number;
  gun_5?: number;
  gun_6?: number;
  gun_7?: number;
  gun_8?: number;
  gun_9?: number;
  gun_10?: number;
  gun_11?: number;
  gun_12?: number;
  gun_13?: number;
  gun_14_uzeri?: number;
  cari_toplam?: number;
  loy_verilen_bayi_sayisi?: number;
  loy_bayi_mahsuplasma_tutari?: number;
  camel_hedef?: number;
  winston_hedef?: number;
  mcarlo_hedef?: number;
  myo_camel_hedef?: number;
  ld_hedef?: number;
  toplam_hedef?: number;
  kasa_hedef?: number;
  hedef_das?: number;
  camel_satis?: number;
  winston_satis?: number;
  mcarlo_satis?: number;
  myo_camel_satis?: number;
  ld_satis?: number;
  toplam_satis?: number;
  kasa_satis?: number;
  gerc_das?: number;
  bak_01?: number;
  mar_02?: number;
  bfe_03?: number;
  kye_04?: number;
  tek_05?: number;
  ben_07?: number;
  ask_08?: number;
  czv_11?: number;
  yznc_12?: number;
  tut_14?: number;
  tus_15?: number;
  jti?: number;
  pmi?: number;
  bat?: number;
  rut_say?: number;
  qline_2026_satis?: number;
  frekans_ort?: number;
}

interface DashboardStats {
  aktif_bayi: number;
  pasif_bayi: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [totals, setTotals] = useState<DistributorTotals | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const { user } = useAuth();
  
  const isDST = user?.role === 'dst';

  const fetchData = async () => {
    
    const API_BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL || 'https://dstroute-system.preview.emergentagent.com'}/api`;
    setApiUrl(API_BASE);
    setError(null);
    
    try {
      console.log('Fetching from:', API_BASE);
      
      // Use native fetch for better mobile compatibility
      const [totalsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/distributor-totals`),
        fetch(`${API_BASE}/dashboard/stats`)
      ]);
      
      if (!totalsRes.ok || !statsRes.ok) {
        throw new Error(`HTTP Error: totals=${totalsRes.status}, stats=${statsRes.status}`);
      }
      
      const totalsData = await totalsRes.json();
      const statsData = await statsRes.json();
      
      console.log('Totals received:', totalsData?.bayi_sayisi);
      console.log('Stats received:', statsData?.aktif_bayi);
      
      setTotals(totalsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Veri yüklenemedi');
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

  const formatNumber = (value?: number, decimals: number = 0) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' ₺';
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(1);
  };

  // Stand oranı hesapla - Stand sayısı / Aktif bayi sayısı * 100
  const calculateStandRatio = (standCount?: number) => {
    const aktifBayi = stats?.aktif_bayi || totals?.aktif_bayi_sayisi || 0;
    if (!standCount || aktifBayi === 0) return '-';
    const ratio = (standCount / aktifBayi) * 100;
    return '%' + ratio.toFixed(1);
  };

  const StatCard = ({ label, value, color = '#D4AF37', onPress, subValue }: { label: string; value: string; color?: string; onPress?: () => void; subValue?: string }) => {
    const content = (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={14} color={color} style={styles.cardChevron} />}
      </View>
    );
    
    if (onPress) {
      return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
    }
    return content;
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
          <Text style={styles.apiUrlText}>{apiUrl}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loaderContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF5722" />
          <Text style={styles.errorText}>Hata: {error}</Text>
          <Text style={styles.apiUrlText}>API: {apiUrl}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Pasif bayi sayısını stats'tan al (stand_raporu'dan geliyor - doğru değer)
  const pasifBayiSayisi = stats?.pasif_bayi || 0;
  const aktifBayiSayisi = stats?.aktif_bayi || 0;
  const toplamBayiSayisi = aktifBayiSayisi + pasifBayiSayisi;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {/* Debug info at top */}
        {(!totals || !stats) && (
          <View style={styles.debugCard}>
            <Text style={styles.debugText}>Veri yüklenemedi. Aşağı çekerek yenileyin.</Text>
            <Text style={styles.debugText}>API: {apiUrl}</Text>
          </View>
        )}
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Aydın Ünlüer Konya</Text>
            <Text style={styles.headerSubtitle}>Distribütör Dashboard</Text>
          </View>
        </View>

        {/* Bayi Sayıları */}
        <SectionTitle title="Bayi Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard label="Bayi Sayısı" value={formatNumber(toplamBayiSayisi)} />
          <StatCard label="Aktif Bayi" value={formatNumber(aktifBayiSayisi)} color="#4CAF50" />
          <StatCard 
            label="Pasif Bayi" 
            value={formatNumber(pasifBayiSayisi)} 
            color="#FFC107" 
            onPress={() => router.push('/pasif-bayiler')}
          />
        </View>

        {/* Satış Hedef */}
        <SectionTitle title="Ay Satış Hedefleri" />
        <View style={styles.statsGrid}>
          <StatCard label="Ay Hedef" value={formatNumber(totals?.aralik_hedef, 1)} />
          <StatCard label="Ay Satış" value={formatNumber(totals?.aralik_satis, 1)} color="#4CAF50" />
          <StatCard label="Kalan Satış" value={formatNumber(totals?.kalan_satis, 1)} color="#FF5722" />
          <StatCard label="Hedef Başarı" value={formatPercent(totals?.hedef_basari_orani)} color="#2196F3" />
        </View>

        {/* Tahsilat */}
        <SectionTitle title="Tahsilat Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard label="Tahsilat Hedef" value={formatCurrency(totals?.tahsilat_hedef)} />
          <StatCard label="Tahsilat Tutarı" value={formatCurrency(totals?.tahsilat_tutari)} color="#4CAF50" />
        </View>

        {/* Ziyaret */}
        <SectionTitle title="Ziyaret Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard label="Ay Hedef Ziyaret" value={formatNumber(totals?.ay_hedef_ziyaret)} />
          <StatCard label="Ziyaret Gerçekleşen" value={formatNumber(totals?.ziyaret_gerceklesen)} color="#4CAF50" />
          <StatCard label="Drop Rate" value={formatNumber(totals?.drop_rate, 1)} />
          <StatCard label="Başarılı Satış" value={formatNumber(totals?.basarili_satis)} />
          <StatCard label="Başarılı Satış %" value={formatPercent(totals?.basarili_satis_yuzde)} color="#4CAF50" />
          <StatCard label="Frekans Ort" value={formatNumber(totals?.frekans_ort, 2)} color="#2196F3" />
        </View>

        {/* Cari Bilgileri - Tıklanabilir */}
        <SectionTitle title="Cari Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="Carili Bayi" 
            value={formatNumber(totals?.carili_bayi_sayisi)} 
            color="#FF5722" 
            onPress={() => router.push('/cari-tumu/toplam')}
          />
          <StatCard 
            label="0 Gün" 
            value={formatCurrency(totals?.gun_0)} 
            onPress={() => router.push('/cari-tumu/0')}
          />
          <StatCard 
            label="1 Gün" 
            value={formatCurrency(totals?.gun_1)} 
            onPress={() => router.push('/cari-tumu/1')}
          />
          <StatCard 
            label="2 Gün" 
            value={formatCurrency(totals?.gun_2)} 
            onPress={() => router.push('/cari-tumu/2')}
          />
          <StatCard 
            label="3 Gün" 
            value={formatCurrency(totals?.gun_3)} 
            onPress={() => router.push('/cari-tumu/3')}
          />
          <StatCard 
            label="4 Gün" 
            value={formatCurrency(totals?.gun_4)} 
            onPress={() => router.push('/cari-tumu/4')}
          />
          <StatCard 
            label="5 Gün" 
            value={formatCurrency(totals?.gun_5)} 
            onPress={() => router.push('/cari-tumu/5')}
          />
          <StatCard 
            label="6 Gün" 
            value={formatCurrency(totals?.gun_6)} 
            onPress={() => router.push('/cari-tumu/6')}
          />
          <StatCard 
            label="7 Gün" 
            value={formatCurrency(totals?.gun_7)} 
            onPress={() => router.push('/cari-tumu/7')}
          />
          <StatCard 
            label="8 Gün" 
            value={formatCurrency(totals?.gun_8)} 
            onPress={() => router.push('/cari-tumu/8')}
          />
          <StatCard 
            label="9 Gün" 
            value={formatCurrency(totals?.gun_9)} 
            onPress={() => router.push('/cari-tumu/9')}
          />
          <StatCard 
            label="10 Gün" 
            value={formatCurrency(totals?.gun_10)} 
            onPress={() => router.push('/cari-tumu/10')}
          />
          <StatCard 
            label="11 Gün" 
            value={formatCurrency(totals?.gun_11)} 
            onPress={() => router.push('/cari-tumu/11')}
          />
          <StatCard 
            label="12 Gün" 
            value={formatCurrency(totals?.gun_12)} 
            onPress={() => router.push('/cari-tumu/12')}
          />
          <StatCard 
            label="13 Gün" 
            value={formatCurrency(totals?.gun_13)} 
            onPress={() => router.push('/cari-tumu/13')}
          />
          <StatCard 
            label="14+ Gün" 
            value={formatCurrency(totals?.gun_14_uzeri)} 
            color="#FF5722" 
            onPress={() => router.push('/cari-tumu/14_uzeri')}
          />
          <StatCard 
            label="Cari Toplam" 
            value={formatCurrency(totals?.cari_toplam)} 
            color="#D4AF37" 
            onPress={() => router.push('/cari-tumu/toplam')}
          />
        </View>

        {/* Loyalty - DST kullanıcıları göremez */}
        {!isDST && (
          <>
            <SectionTitle title="Loyalty Bilgileri" />
            <View style={styles.statsGrid}>
              <StatCard label="Loy. Verilen Bayi" value={formatNumber(totals?.loy_verilen_bayi_sayisi)} />
              <StatCard label="Loy. Mahsuplaşma" value={formatCurrency(totals?.loy_bayi_mahsuplasma_tutari)} color="#4CAF50" />
            </View>
          </>
        )}

        {/* Marka Hedefleri */}
        <SectionTitle title="Marka Hedefleri" />
        <View style={styles.statsGrid}>
          <StatCard label="Camel" value={formatNumber(totals?.camel_hedef, 1)} />
          <StatCard label="Winston" value={formatNumber(totals?.winston_hedef, 1)} />
          <StatCard label="M.Carlo" value={formatNumber(totals?.mcarlo_hedef, 1)} />
          <StatCard label="MYO Camel" value={formatNumber(totals?.myo_camel_hedef, 1)} />
          <StatCard label="LD" value={formatNumber(totals?.ld_hedef, 1)} />
          <StatCard label="Toplam" value={formatNumber(totals?.toplam_hedef, 1)} color="#D4AF37" />
          <StatCard label="Kasa" value={formatNumber(totals?.kasa_hedef, 2)} />
          <StatCard label="Hedef DAS" value={formatNumber(totals?.hedef_das, 2)} />
        </View>

        {/* Marka Satışları */}
        <SectionTitle title="Marka Satışları" />
        <View style={styles.statsGrid}>
          <StatCard label="Camel" value={formatNumber(totals?.camel_satis, 1)} color="#4CAF50" />
          <StatCard label="Winston" value={formatNumber(totals?.winston_satis, 1)} color="#4CAF50" />
          <StatCard label="M.Carlo" value={formatNumber(totals?.mcarlo_satis, 1)} color="#4CAF50" />
          <StatCard label="MYO Camel" value={formatNumber(totals?.myo_camel_satis, 1)} color="#4CAF50" />
          <StatCard label="LD" value={formatNumber(totals?.ld_satis, 1)} color="#4CAF50" />
          <StatCard label="Toplam" value={formatNumber(totals?.toplam_satis, 1)} color="#D4AF37" />
          <StatCard label="Kasa" value={formatNumber(totals?.kasa_satis, 2)} color="#4CAF50" />
          <StatCard label="Gerç. DAS" value={formatNumber(totals?.gerc_das, 2)} color="#4CAF50" />
        </View>

        {/* Kanal Bazlı */}
        <SectionTitle title="Toplam Müşteri / Kanal Bazlı Kırılım" />
        <View style={styles.statsGrid}>
          <StatCard label="01 BAK" value={formatNumber(totals?.bak_01)} />
          <StatCard label="02 MAR" value={formatNumber(totals?.mar_02)} />
          <StatCard label="03 BFE" value={formatNumber(totals?.bfe_03)} />
          <StatCard label="04 KYE" value={formatNumber(totals?.kye_04)} />
          <StatCard label="05 TEK" value={formatNumber(totals?.tek_05)} />
          <StatCard label="07 BEN" value={formatNumber(totals?.ben_07)} />
          <StatCard label="08 ASK" value={formatNumber(totals?.ask_08)} />
          <StatCard label="11 CZV" value={formatNumber(totals?.czv_11)} />
          <StatCard label="12 YZNC" value={formatNumber(totals?.yznc_12)} />
          <StatCard label="14 TUT" value={formatNumber(totals?.tut_14)} />
          <StatCard label="15 TUS" value={formatNumber(totals?.tus_15)} />
        </View>

        {/* Stand Bilgileri - Oranlarla birlikte */}
        <SectionTitle title="Stand ve Rut Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="JTI" 
            value={formatNumber(totals?.jti)} 
            color="#2196F3" 
            subValue={calculateStandRatio(totals?.jti)}
          />
          <StatCard 
            label="PMI" 
            value={formatNumber(totals?.pmi)} 
            color="#9C27B0" 
            subValue={calculateStandRatio(totals?.pmi)}
          />
          <StatCard 
            label="BAT" 
            value={formatNumber(totals?.bat)} 
            color="#FF9800" 
            subValue={calculateStandRatio(totals?.bat)}
          />
          <StatCard label="Haftalık Toplam Ziyaret Sayısı" value={formatNumber(totals?.rut_say)} />
        </View>

        {/* Q Line */}
        <SectionTitle title="Ay Toplam W.Slender Q Line Satış" />
        <View style={styles.statsGrid}>
          <StatCard label="2026 Son Ay" value={formatNumber(totals?.qline_2026_satis, 1)} color="#4CAF50" />
        </View>

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
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    minWidth: '30%',
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
  },
  statSubValue: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
  },
  cardChevron: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  bottomPadding: {
    height: 40,
  },
  apiUrlText: {
    marginTop: 8,
    fontSize: 10,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#FF5722',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  debugCard: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  debugText: {
    fontSize: 11,
    color: '#FFC107',
  },
});
