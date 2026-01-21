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
  qline_hedef?: number;
  frekans_ort?: number;
}

interface CariliKanalToplamlari {
  PİYASA?: number;
  'YEREL ZİNCİR'?: number;
  'ASKERİYE+CEZAEVİ'?: number;
  BENZİNLİK?: number;
  GELENEKSEL?: number;
}

interface DashboardStats {
  aktif_bayi: number;
  pasif_bayi: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [totals, setTotals] = useState<DistributorTotals | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cariliKanal, setCariliKanal] = useState<CariliKanalToplamlari | null>(null);
  const [loyaltyCount, setLoyaltyCount] = useState<number>(0);
  const [sonGuncelleme, setSonGuncelleme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const isDST = user?.role === 'dst';

  const fetchData = async () => {
    const API_BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL || 'https://dstroute-system.preview.emergentagent.com'}/api`;
    setError(null);
    
    try {
      const [totalsRes, statsRes, cariliRes, loyaltyRes, guncellemeRes] = await Promise.all([
        fetch(`${API_BASE}/distributor-totals`),
        fetch(`${API_BASE}/dashboard/stats`),
        fetch(`${API_BASE}/carili-kanal-toplamlari`),
        fetch(`${API_BASE}/loyalty-bayi-sayisi`),
        fetch(`${API_BASE}/son-guncelleme`)
      ]);
      
      const totalsData = await totalsRes.json();
      const statsData = await statsRes.json();
      const cariliData = await cariliRes.json();
      const loyaltyData = await loyaltyRes.json();
      const guncellemeData = await guncellemeRes.json();
      
      setTotals(totalsData);
      setStats(statsData);
      setCariliKanal(cariliData);
      setLoyaltyCount(loyaltyData?.count || 0);
      setSonGuncelleme(guncellemeData?.son_guncelleme || '');
    } catch (err: any) {
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
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }) + ' TL';
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(1);
  };

  // Kasa hesaplama fonksiyonları
  const toKasa = (karton?: number, divider: number = 50) => {
    if (!karton) return 0;
    return karton / divider;
  };

  const formatKartonKasa = (karton?: number, divider: number = 50) => {
    if (!karton) return '- KRT / - Kasa';
    const kasa = karton / divider;
    return `${formatNumber(karton, 1)} KRT / ${formatNumber(kasa, 1)} Kasa`;
  };

  const calculateStandRatio = (standCount?: number) => {
    const aktifBayi = stats?.aktif_bayi || totals?.aktif_bayi_sayisi || 0;
    if (!standCount || aktifBayi === 0) return '-';
    const ratio = (standCount / aktifBayi) * 100;
    return '%' + ratio.toFixed(1);
  };

  // Q Line kalan hesaplama
  const qlineKalan = (totals?.qline_hedef || 0) - (totals?.qline_2026_satis || 0);

  // Son güncelleme formatı
  const formatGuncelleme = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const StatCard = ({ label, value, color = '#D4AF37', onPress, subValue }: { 
    label: string; 
    value: string; 
    color?: string; 
    onPress?: () => void; 
    subValue?: string 
  }) => {
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Aydın Ünlüer-Konya</Text>
            <Text style={styles.headerSubtitle}>Distribütör Dashboard</Text>
          </View>
          {sonGuncelleme && (
            <View style={styles.updateInfo}>
              <Ionicons name="time-outline" size={12} color="#888" />
              <Text style={styles.updateText}>{formatGuncelleme(sonGuncelleme)}</Text>
            </View>
          )}
        </View>

        {/* Bayi Bilgileri */}
        <SectionTitle title="Bayi Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard label="Bayi Sayısı" value={formatNumber(toplamBayiSayisi)} />
          <StatCard label="Aktif Bayi" value={formatNumber(aktifBayiSayisi)} color="#4CAF50" />
          <StatCard label="Pasif Bayi" value={formatNumber(pasifBayiSayisi)} color="#FFC107" onPress={() => router.push('/pasif-bayiler')} />
        </View>

        {/* Ay Satış Hedefleri */}
        <SectionTitle title="Ay Satış Hedefleri" />
        <View style={styles.statsGrid}>
          <StatCard label="Satış Hedef" value={formatNumber(totals?.aralik_hedef, 1)} subValue={`${formatNumber(toKasa(totals?.aralik_hedef), 1)} Kasa`} />
          <StatCard label="Satış" value={formatNumber(totals?.aralik_satis, 1)} color="#4CAF50" subValue={`${formatNumber(toKasa(totals?.aralik_satis), 1)} Kasa`} />
          <StatCard label="Kalan Satış" value={formatNumber(totals?.kalan_satis, 1)} color="#FF5722" subValue={`${formatNumber(toKasa(totals?.kalan_satis), 1)} Kasa`} />
          <StatCard label="Hedef Başarı" value={formatPercent(totals?.hedef_basari_orani)} color="#2196F3" />
        </View>

        {/* W.Slender Q Line */}
        <SectionTitle title="W.Slender Q Line" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="Q Line Hedef" 
            value={formatNumber(totals?.qline_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.qline_hedef), 1)} Kasa`}
          />
          <StatCard 
            label="Q Line Satış" 
            value={formatNumber(totals?.qline_2026_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.qline_2026_satis), 1)} Kasa`}
          />
          <StatCard 
            label="Q Line Kalan" 
            value={formatNumber(qlineKalan, 1)} 
            color="#FF5722"
            subValue={`${formatNumber(toKasa(qlineKalan), 1)} Kasa`}
          />
        </View>

        {/* Ziyaret Bilgileri */}
        <SectionTitle title="Ziyaret Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard label="Ay Hedef Ziyaret" value={formatNumber(totals?.ay_hedef_ziyaret)} />
          <StatCard label="Ziyaret Gerçekleşen" value={formatNumber(totals?.ziyaret_gerceklesen)} color="#4CAF50" />
          <StatCard label="Drop Rate" value={formatNumber(totals?.drop_rate, 2)} color="#FF9800" />
          <StatCard label="Başarılı Satış %" value={formatPercent(totals?.basarili_satis_yuzde)} color="#2196F3" />
          <StatCard label="Haftalık Ziyaret Sayısı" value={formatNumber(totals?.rut_say)} color="#9C27B0" />
          <StatCard label="Frekans Ort." value={formatNumber(totals?.frekans_ort, 2)} />
        </View>

        {/* Cari Bilgileri */}
        <SectionTitle title="Cari Bilgileri" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="Carili Bayi" 
            value={formatNumber(totals?.carili_bayi_sayisi)} 
            color="#FF5722" 
            onPress={() => router.push('/cari-tumu/toplam')} 
          />
          <StatCard 
            label="Cari Toplam" 
            value={formatCurrency(totals?.cari_toplam)} 
            color="#D4AF37" 
            onPress={() => router.push('/cari-tumu/toplam')} 
          />
        </View>
        
        {/* Carili Kanal Bazlı */}
        <View style={styles.statsGrid}>
          <StatCard 
            label="Piyasa" 
            value={formatCurrency(cariliKanal?.PİYASA)} 
            color="#2196F3"
            onPress={() => router.push('/kanal-musterileri/piyasa')}
          />
          <StatCard 
            label="Yerel Zincir" 
            value={formatCurrency(cariliKanal?.['YEREL ZİNCİR'])} 
            color="#9C27B0"
            onPress={() => router.push('/kanal-musterileri/yerel-zincir')}
          />
          <StatCard 
            label="Askeriye+Cezaevi" 
            value={formatCurrency(cariliKanal?.['ASKERİYE+CEZAEVİ'])} 
            color="#FF9800"
            onPress={() => router.push('/kanal-musterileri/askeriye')}
          />
          <StatCard 
            label="Benzinlik" 
            value={formatCurrency(cariliKanal?.BENZİNLİK)} 
            color="#4CAF50"
            onPress={() => router.push('/kanal-musterileri/benzinlik')}
          />
          <StatCard 
            label="Geleneksel" 
            value={formatCurrency(cariliKanal?.GELENEKSEL)} 
            color="#E91E63"
            onPress={() => router.push('/kanal-musterileri/geleneksel')}
          />
        </View>

        {/* Stand ve Oranları - DST göremez */}
        {!isDST && (
          <>
            <SectionTitle title="Stand ve Oranları" />
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
            </View>
          </>
        )}

        {/* Müşteri Sayısı Kanal Bazlı Kırılım */}
        <SectionTitle title="Müşteri Sayısı Kanal Bazlı Kırılım" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="01 BAK" 
            value={formatNumber(totals?.bak_01)} 
            onPress={() => router.push('/kanal-kırılım/01')}
          />
          <StatCard 
            label="02 MAR" 
            value={formatNumber(totals?.mar_02)} 
            onPress={() => router.push('/kanal-kırılım/02')}
          />
          <StatCard 
            label="03 BFE" 
            value={formatNumber(totals?.bfe_03)} 
            onPress={() => router.push('/kanal-kırılım/03')}
          />
          <StatCard 
            label="04 KYE" 
            value={formatNumber(totals?.kye_04)} 
            onPress={() => router.push('/kanal-kırılım/04')}
          />
          <StatCard 
            label="05 TEK" 
            value={formatNumber(totals?.tek_05)} 
            onPress={() => router.push('/kanal-kırılım/05')}
          />
          <StatCard 
            label="07 BEN" 
            value={formatNumber(totals?.ben_07)} 
            onPress={() => router.push('/kanal-kırılım/07')}
          />
          <StatCard 
            label="08 ASK" 
            value={formatNumber(totals?.ask_08)} 
            onPress={() => router.push('/kanal-kırılım/08')}
          />
          <StatCard 
            label="11 CZV" 
            value={formatNumber(totals?.czv_11)} 
            onPress={() => router.push('/kanal-kırılım/11')}
          />
          <StatCard 
            label="12 YZNC" 
            value={formatNumber(totals?.yznc_12)} 
            onPress={() => router.push('/kanal-kırılım/12')}
          />
        </View>

        {/* Loyalty - DST göremez */}
        {!isDST && (
          <>
            <SectionTitle title="Loyalty Bilgileri" />
            <View style={styles.statsGrid}>
              <StatCard 
                label="Loy. Bayi Sayısı" 
                value={formatNumber(loyaltyCount)} 
                onPress={() => router.push('/loyalty-bayiler')}
              />
              <StatCard 
                label="Loy. Mahsuplaşma" 
                value={formatCurrency(totals?.loy_bayi_mahsuplasma_tutari)} 
                color="#4CAF50" 
              />
            </View>
          </>
        )}

        {/* Marka Hedef ve Satışlar */}
        <SectionTitle title="Hedefler ve Satışlar" />
        <View style={styles.statsGrid}>
          <StatCard 
            label="Camel Hedef" 
            value={formatNumber(totals?.camel_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.camel_hedef), 1)} Kasa`}
          />
          <StatCard 
            label="Camel Satış" 
            value={formatNumber(totals?.camel_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.camel_satis), 1)} Kasa`}
          />
          <StatCard 
            label="Winston Hedef" 
            value={formatNumber(totals?.winston_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.winston_hedef), 1)} Kasa`}
          />
          <StatCard 
            label="Winston Satış" 
            value={formatNumber(totals?.winston_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.winston_satis), 1)} Kasa`}
          />
          <StatCard 
            label="M.Carlo Hedef" 
            value={formatNumber(totals?.mcarlo_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.mcarlo_hedef), 1)} Kasa`}
          />
          <StatCard 
            label="M.Carlo Satış" 
            value={formatNumber(totals?.mcarlo_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.mcarlo_satis), 1)} Kasa`}
          />
          <StatCard 
            label="MYO Camel Hedef" 
            value={formatNumber(totals?.myo_camel_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.myo_camel_hedef, 24), 1)} Kasa`}
          />
          <StatCard 
            label="MYO Camel Satış" 
            value={formatNumber(totals?.myo_camel_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.myo_camel_satis, 24), 1)} Kasa`}
          />
          <StatCard 
            label="LD Hedef" 
            value={formatNumber(totals?.ld_hedef, 1)} 
            subValue={`${formatNumber(toKasa(totals?.ld_hedef), 1)} Kasa`}
          />
          <StatCard 
            label="LD Satış" 
            value={formatNumber(totals?.ld_satis, 1)} 
            color="#4CAF50"
            subValue={`${formatNumber(toKasa(totals?.ld_satis), 1)} Kasa`}
          />
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
  scrollContent: { padding: 12 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16, 
    paddingVertical: 8,
    flexWrap: 'wrap'
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
    marginRight: 12 
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  updateInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a1a2e', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    gap: 4
  },
  updateText: { fontSize: 10, color: '#888' },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#D4AF37', 
    marginTop: 16, 
    marginBottom: 8, 
    paddingBottom: 4, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  statCard: { 
    backgroundColor: '#1a1a2e', 
    borderRadius: 8, 
    padding: 10, 
    margin: 4, 
    minWidth: '30%', 
    flex: 1, 
    borderLeftWidth: 3 
  },
  statLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  statValue: { 
    fontSize: 14, 
    fontWeight: '800', 
    textShadowColor: 'rgba(212, 175, 55, 0.8)', 
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 6 
  },
  statSubValue: { fontSize: 10, color: '#4CAF50', marginTop: 2 },
  cardChevron: { position: 'absolute', top: 4, right: 4 },
  bottomPadding: { height: 40 }
});
