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
      const [totalsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/distributor-totals`),
        fetch(`${API_BASE}/dashboard/stats`)
      ]);
      
      if (!totalsRes.ok || !statsRes.ok) {
        throw new Error(`HTTP Error: totals=${totalsRes.status}, stats=${statsRes.status}`);
      }
      
      const totalsData = await totalsRes.json();
      const statsData = await statsRes.json();
      
      setTotals(totalsData);
      setStats(statsData);
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
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' ₺';
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(1);
  };

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
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Aydın Ünlüer-Konya Semih</Text>
            <Text style={styles.headerSubtitle}>Distribütör Dashboard</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bayi Bilgileri</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Bayi Sayısı" value={formatNumber(toplamBayiSayisi)} />
          <StatCard label="Aktif Bayi" value={formatNumber(aktifBayiSayisi)} color="#4CAF50" />
          <StatCard label="Pasif Bayi" value={formatNumber(pasifBayiSayisi)} color="#FFC107" onPress={() => router.push('/pasif-bayiler')} />
        </View>

        <Text style={styles.sectionTitle}>Ay Satış Hedefleri</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Ay Hedef" value={formatNumber(totals?.aralik_hedef, 1)} />
          <StatCard label="Ay Satış" value={formatNumber(totals?.aralik_satis, 1)} color="#4CAF50" />
          <StatCard label="Kalan Satış" value={formatNumber(totals?.kalan_satis, 1)} color="#FF5722" />
          <StatCard label="Hedef Başarı" value={formatPercent(totals?.hedef_basari_orani)} color="#2196F3" />
        </View>

        <Text style={styles.sectionTitle}>Cari Bilgileri</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Carili Bayi" value={formatNumber(totals?.carili_bayi_sayisi)} color="#FF5722" onPress={() => router.push('/cari-tumu/toplam')} />
          <StatCard label="Cari Toplam" value={formatCurrency(totals?.cari_toplam)} color="#D4AF37" onPress={() => router.push('/cari-tumu/toplam')} />
        </View>

        <Text style={styles.sectionTitle}>Stand Bilgileri</Text>
        <View style={styles.statsGrid}>
          <StatCard label="JTI" value={formatNumber(totals?.jti)} color="#2196F3" subValue={calculateStandRatio(totals?.jti)} />
          <StatCard label="PMI" value={formatNumber(totals?.pmi)} color="#9C27B0" subValue={calculateStandRatio(totals?.pmi)} />
          <StatCard label="BAT" value={formatNumber(totals?.bat)} color="#FF9800" subValue={calculateStandRatio(totals?.bat)} />
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingVertical: 8 },
  logoSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#D4AF37', marginRight: 12 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#333' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  statCard: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 10, margin: 4, minWidth: '30%', flex: 1, borderLeftWidth: 3 },
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