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
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

interface DSTData {
  dst: string;
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
  // SKU ve diğer alanlar
  [key: string]: any;
}

export default function DSTDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const dstName = params.id as string;
  
  const [data, setData] = useState<DSTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const isDST = user?.role === 'dst';

  const fetchDSTData = async () => {
    try {
      const response = await api.get('/dst-data');
      const allData = response.data as DSTData[];
      const found = allData.find(d => d.dst === decodeURIComponent(dstName));
      setData(found || null);
    } catch (error) {
      console.error('Error fetching DST data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDSTData();
  }, [dstName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDSTData();
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
    return '%' + value.toFixed(2);
  };

  // Drop Rate için ayrı format (yüzde değil, normal sayı)
  const formatDropRate = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toFixed(2);
  };

  const renderInfoRow = (label: string, value: string, highlight?: boolean) => (
    <View style={[styles.infoRow, highlight && styles.highlightRow]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );

  const renderClickableInfoRow = (label: string, value: string, gun: string, highlight?: boolean) => (
    <TouchableOpacity 
      style={[styles.infoRow, highlight && styles.highlightRow]}
      onPress={() => router.push(`/cari/${encodeURIComponent(dstName)}?gun=${gun}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.clickableValueContainer}>
        <Text style={[styles.infoValue, highlight && styles.highlightValue]}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color="#D4AF37" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

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

  if (!data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DST Bulunamadı</Text>
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
          <Text style={styles.headerTitle}>{data.dst}</Text>
          <Text style={styles.headerSubtitle}>DST Detay Raporu</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {/* Bayi Bilgileri */}
        {renderSection('Bayi Bilgileri', <>
          {renderInfoRow('Bayi Sayısı', formatNumber(data.bayi_sayisi))}
          {renderInfoRow('Aktif Bayi Sayısı', formatNumber(data.aktif_bayi_sayisi))}
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => router.push(`/pasif-bayiler-dst/${encodeURIComponent(dstName)}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.infoLabel}>Pasif Bayi Sayısı</Text>
            <View style={styles.clickableValueContainer}>
              <Text style={styles.infoValue}>{formatNumber(data.pasif_bayi_sayisi)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D4AF37" style={styles.chevron} />
            </View>
          </TouchableOpacity>
        </>)}

        {/* Satış Bilgileri */}
        {renderSection('Satış Bilgileri', <>
          {renderInfoRow('Ay Hedef', formatNumber(data.aralik_hedef, 1))}
          {renderInfoRow('Ay Satış', formatNumber(data.aralik_satis, 1), true)}
          {renderInfoRow('Kalan Satış', formatNumber(data.kalan_satis, 1))}
          {renderInfoRow('Hedef/Başarı Oranı', formatPercent(data.hedef_basari_orani), true)}
        </>)}

        {/* Tahsilat Bilgileri */}
        {renderSection('Tahsilat Bilgileri', <>
          {renderInfoRow('Tahsilat Hedef', formatCurrency(data.tahsilat_hedef))}
          {renderInfoRow('Tahsilat Tutarı', formatCurrency(data.tahsilat_tutari), true)}
        </>)}

        {/* Ziyaret Bilgileri */}
        {renderSection('Ziyaret Bilgileri', <>
          {renderInfoRow('Ay Hedef Ziyaret', formatNumber(data.ay_hedef_ziyaret))}
          {renderInfoRow('Ziyaret Gerçekleşen', formatNumber(data.ziyaret_gerceklesen))}
          {renderInfoRow('Drop Rate', formatDropRate(data.drop_rate))}
          {renderInfoRow('Başarılı Satış', formatNumber(data.basarili_satis))}
          {renderInfoRow('Başarılı Satış %', formatPercent(data.basarili_satis_yuzde), true)}
          {renderInfoRow('Frekans Ortalaması', formatNumber(data.frekans_ort, 2), true)}
        </>)}

        {/* Cari Bilgileri */}
        {renderSection('Cari Bilgileri', <>
          {renderInfoRow('Carili Bayi Sayısı', formatNumber(data.carili_bayi_sayisi))}
          {renderClickableInfoRow('0 Gün', formatCurrency(data.gun_0), '0')}
          {renderClickableInfoRow('1 Gün', formatCurrency(data.gun_1), '1')}
          {renderClickableInfoRow('2 Gün', formatCurrency(data.gun_2), '2')}
          {renderClickableInfoRow('3 Gün', formatCurrency(data.gun_3), '3')}
          {renderClickableInfoRow('4 Gün', formatCurrency(data.gun_4), '4')}
          {renderClickableInfoRow('5 Gün', formatCurrency(data.gun_5), '5')}
          {renderClickableInfoRow('6 Gün', formatCurrency(data.gun_6), '6')}
          {renderClickableInfoRow('7 Gün', formatCurrency(data.gun_7), '7')}
          {renderClickableInfoRow('8 Gün', formatCurrency(data.gun_8), '8')}
          {renderClickableInfoRow('9 Gün', formatCurrency(data.gun_9), '9')}
          {renderClickableInfoRow('10 Gün', formatCurrency(data.gun_10), '10')}
          {renderClickableInfoRow('11 Gün', formatCurrency(data.gun_11), '11')}
          {renderClickableInfoRow('12 Gün', formatCurrency(data.gun_12), '12')}
          {renderClickableInfoRow('13 Gün', formatCurrency(data.gun_13), '13')}
          {renderClickableInfoRow('14+ Gün', formatCurrency(data.gun_14_uzeri), '14_uzeri')}
          {renderClickableInfoRow('Cari Toplam', formatCurrency(data.cari_toplam), 'toplam', true)}
        </>)}

        {/* Loyalty Bilgileri - DST kullanıcıları göremez */}
        {!isDST && renderSection('Loyalty Bilgileri', <>
          {renderInfoRow('Loy. Verilen Bayi Sayısı', formatNumber(data.loy_verilen_bayi_sayisi))}
          {renderInfoRow('Loy. Bayi Mahsuplaşma', formatCurrency(data.loy_bayi_mahsuplasma_tutari))}
        </>)}

        {/* Hedef Marka Toplamları */}
        {renderSection('Hedef Marka Toplamları', <>
          {renderInfoRow('Camel', formatNumber(data.camel_toplam, 1))}
          {renderInfoRow('Winston', formatNumber(data.winston_toplam, 1))}
          {renderInfoRow('M.Carlo', formatNumber(data.mcarlo_toplam, 1))}
          {renderInfoRow('MYO Camel', formatNumber(data.myo_camel, 1))}
          {renderInfoRow('LD', formatNumber(data.ld_toplam, 1))}
          {renderInfoRow('Toplam', formatNumber(data.toplam, 1), true)}
          {renderInfoRow('Kasa', formatNumber(data.kasa, 2))}
          {renderInfoRow('Hedef DAS', formatNumber(data.hedef_das, 2))}
        </>)}

        {/* Gerçekleşen Marka Toplamları */}
        {renderSection('Gerçekleşen Marka Toplamları', <>
          {renderInfoRow('Camel', formatNumber(data.camel_gerc, 1))}
          {renderInfoRow('Winston', formatNumber(data.winston_gerc, 1))}
          {renderInfoRow('M.Carlo', formatNumber(data.mcarlo_gerc, 1))}
          {renderInfoRow('MYO Camel', formatNumber(data.myo_camel_gerc, 1))}
          {renderInfoRow('LD', formatNumber(data.ld_gerc, 1))}
          {renderInfoRow('Toplam', formatNumber(data.toplam_gerc, 1), true)}
          {renderInfoRow('Kasa', formatNumber(data.kasa_gerc, 2))}
          {renderInfoRow('Gerç. DAS', formatNumber(data.gerc_das, 2))}
        </>)}

        {/* Kanal Bazlı */}
        {renderSection("Müşteri Toplamı / Kanal Bazlı Kırılım" />, <>
          {renderInfoRow('01 BAK', formatNumber(data.bak_01))}
          {renderInfoRow('02 MAR', formatNumber(data.mar_02))}
          {renderInfoRow('03 BFE', formatNumber(data.bfe_03))}
          {renderInfoRow('04 KYE', formatNumber(data.kye_04))}
          {renderInfoRow('05 TEK', formatNumber(data.tek_05))}
          {renderInfoRow('07 BEN', formatNumber(data.ben_07))}
          {renderInfoRow('08 ASK', formatNumber(data.ask_08))}
          {renderInfoRow('11 CZV', formatNumber(data.czv_11))}
          {renderInfoRow('12 YZNC', formatNumber(data.yznc_12))}
          {renderInfoRow('14 TUT', formatNumber(data.tut_14))}
          {renderInfoRow('15 TUS', formatNumber(data.tus_15))}
        </>)}

        {/* Stand ve Ziyaret Bilgileri */}
        {renderSection('Stand ve Ziyaret Bilgileri', <>
          {renderInfoRow('JTI', formatNumber(data.jti))}
          {renderInfoRow('JTI Oranı', formatPercent(data.aktif_bayi_sayisi && data.jti ? (data.jti / data.aktif_bayi_sayisi) * 100 : 0))}
          {renderInfoRow('PMI', formatNumber(data.pmi))}
          {renderInfoRow('PMI Oranı', formatPercent(data.aktif_bayi_sayisi && data.pmi ? (data.pmi / data.aktif_bayi_sayisi) * 100 : 0))}
          {renderInfoRow('BAT', formatNumber(data.bat))}
          {renderInfoRow('BAT Oranı', formatPercent(data.aktif_bayi_sayisi && data.bat ? (data.bat / data.aktif_bayi_sayisi) * 100 : 0))}
          {renderInfoRow('Haftalık Toplam Ziyaret Sayısı', formatNumber(data.rut_say))}
        </>)}

        {/* Yıllık SKU Satışları */}
        {renderSection('2026 Yıllık SKU Satışları', <>
          {renderInfoRow('W. Dark Blue Ks', formatNumber(data.w_dark_blue_ks))}
          {renderInfoRow('W. Slender Blue Ks', formatNumber(data.w_slender_blue_ks))}
          {renderInfoRow('W. Dark Blue Long', formatNumber(data.w_dark_blue_long))}
          {renderInfoRow('M.Carlo Slender Dark Blue', formatNumber(data.mcarlo_slender_dark_blue_yil))}
          {renderInfoRow('W. Slim Blue', formatNumber(data.w_slim_blue))}
          {renderInfoRow('W. Blue Ks', formatNumber(data.w_blue_ks))}
          {renderInfoRow('W. Slender Blue Long', formatNumber(data.w_slender_blue_long))}
          {renderInfoRow('Camel Slender Blue', formatNumber(data.camel_slender_blue_yil))}
          {renderInfoRow('M.Carlo Dark Blue Ks', formatNumber(data.mcarlo_dark_blue_ks))}
          {renderInfoRow('M.Carlo Dark Blue Long', formatNumber(data.mcarlo_dark_blue_long_yil, 1))}
          {renderInfoRow('2025 W.Slender Q Line', formatNumber(data.w_slender_q_line_2025, 1))}
          {renderInfoRow('2026 W.Slender Q Line', formatNumber(data.w_slender_q_line_2026, 1), true)}
        </>)}

      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  sectionContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  highlightRow: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'right',
  },
  highlightValue: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  clickableValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
  },
});
