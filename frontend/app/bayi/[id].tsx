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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { bayiAPI, BayiDetail, Fatura, Tahsilat } from '../../src/services/api';

const { width } = Dimensions.get('window');

const formatNumber = (value?: number): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '0,0 TL';
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' TL';
};

interface InfoBoxProps {
  label: string;
  value: string | number | undefined;
  color?: string;
  isCurrency?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ label, value, color = '#D4AF37', isCurrency = false }) => (
  <View style={[styles.infoBox, { borderLeftColor: color }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color }]}>
      {isCurrency ? formatCurrency(typeof value === 'number' ? value : 0) : (value || '-')}
    </Text>
  </View>
);

interface MonthlyDataProps {
  title: string;
  data: { month: string; value: number }[];
  total: number;
  average: number;
}

const MonthlyData: React.FC<MonthlyDataProps> = ({ title, data, total, average }) => (
  <View style={styles.monthlySection}>
    <Text style={styles.sectionSubTitle}>{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.monthlyRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.monthBox}>
            <Text style={styles.monthLabel}>{item.month}</Text>
            <Text style={styles.monthValue}>{formatNumber(item.value)}</Text>
          </View>
        ))}
        <View style={[styles.monthBox, styles.totalBox]}>
          <Text style={styles.monthLabel}>Toplam</Text>
          <Text style={[styles.monthValue, styles.totalValue]}>{formatNumber(total)}</Text>
        </View>
        <View style={[styles.monthBox, styles.avgBox]}>
          <Text style={styles.monthLabel}>Ortalama</Text>
          <Text style={[styles.monthValue, styles.avgValue]}>{formatNumber(average)}</Text>
        </View>
      </View>
    </ScrollView>
  </View>
);

export default function BayiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bayi, setBayi] = useState<BayiDetail | null>(null);
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [tahsilatlar, setTahsilatlar] = useState<Tahsilat[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'fatura' | 'tahsilat'>('info');

  const fetchData = async () => {
    try {
      const [bayiData, faturaData, tahsilatData] = await Promise.all([
        bayiAPI.getDetail(id),
        bayiAPI.getFaturalar(id),
        bayiAPI.getTahsilatlar(id),
      ]);
      setBayi(bayiData);
      setFaturalar(faturaData);
      setTahsilatlar(tahsilatData);
    } catch (error) {
      console.error('Error fetching bayi data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getGelisimColor = (value?: number) => {
    if (!value) return '#888';
    return value >= 0 ? '#4CAF50' : '#f44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!bayi) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <Text style={styles.errorText}>Bayi bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#D4AF37',
          headerTitle: 'Bayi Detay',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#D4AF37" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Bilgiler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fatura' && styles.activeTab]}
          onPress={() => setActiveTab('fatura')}
        >
          <Text style={[styles.tabText, activeTab === 'fatura' && styles.activeTabText]}>
            Faturalar ({faturalar.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tahsilat' && styles.activeTab]}
          onPress={() => setActiveTab('tahsilat')}
        >
          <Text style={[styles.tabText, activeTab === 'tahsilat' && styles.activeTabText]}>
            Tahsilatlar ({tahsilatlar.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {activeTab === 'info' && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
              <Text style={styles.bayiUnvan}>{bayi.bayi_unvani}</Text>
            </View>

            {/* Main Info Boxes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bayi Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoBox label="DST" value={bayi.dst} />
                <InfoBox label="TTE" value={bayi.tte} />
                <InfoBox label="DSM" value={bayi.dsm} />
                <InfoBox label="TİP" value={bayi.tip} />
                <InfoBox label="PANAROMA SINIF" value={bayi.panaroma_sinif} />
                <InfoBox label="KAPSAM DURUMU" value={bayi.kapsam_durumu} color={bayi.kapsam_durumu === 'Aktif' ? '#4CAF50' : '#FFC107'} />
              </View>
            </View>

            {/* Stand Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stant Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoBox label="JTI STANT" value={bayi.jti_stant} />
                <InfoBox label="ADET" value={bayi.jti_stant_adet} />
                <InfoBox label="CAMEL MYO STANT" value={bayi.camel_myo_stant} />
                <InfoBox label="ADET" value={bayi.camel_myo_adet} />
                <InfoBox label="PMI STANT" value={bayi.pmi_stant} />
                <InfoBox label="ADET" value={bayi.pmi_adet} />
                <InfoBox label="BAT STANT" value={bayi.bat_stant} />
                <InfoBox label="ADET" value={bayi.bat_adet} />
              </View>
            </View>

            {/* Loyalty & Debt */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loyalty & Borç</Text>
              <View style={styles.infoGrid}>
                <InfoBox label="2025 LOYALTY PLAN" value={bayi.loyalty_plan_2025} isCurrency />
                <InfoBox label="2025 ÖDENEN" value={bayi.odenen_2025} isCurrency />
                <InfoBox label="BORÇ DURUMU" value={bayi.borc_durumu} color={bayi.borc_durumu === 'Borcu yoktur' ? '#4CAF50' : '#f44336'} />
              </View>
            </View>

            {/* Development */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Satış Gelişimi (2024 vs 2025)</Text>
              <View style={styles.developmentCard}>
                <View style={styles.devItem}>
                  <Text style={styles.devLabel}>2024 Toplam</Text>
                  <Text style={styles.devValue}>{formatNumber(bayi.toplam_satis_2024)}</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#666" />
                <View style={styles.devItem}>
                  <Text style={styles.devLabel}>2025 Toplam</Text>
                  <Text style={styles.devValue}>{formatNumber(bayi.toplam_satis_2025)}</Text>
                </View>
                <View style={[styles.devPercent, { backgroundColor: getGelisimColor(bayi.gelisim_yuzdesi) + '20' }]}>
                  <Ionicons
                    name={(bayi.gelisim_yuzdesi || 0) >= 0 ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={getGelisimColor(bayi.gelisim_yuzdesi)}
                  />
                  <Text style={[styles.devPercentText, { color: getGelisimColor(bayi.gelisim_yuzdesi) }]}>
                    %{formatNumber(bayi.gelisim_yuzdesi)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Sales Detail Button */}
            <TouchableOpacity
              style={styles.salesDetailButton}
              onPress={() => router.push(`/satis/${bayi.bayi_kodu}`)}
            >
              <View style={styles.salesDetailContent}>
                <Ionicons name="bar-chart" size={24} color="#D4AF37" />
                <View style={styles.salesDetailText}>
                  <Text style={styles.salesDetailTitle}>Aylık Satış Detayları</Text>
                  <Text style={styles.salesDetailSubtitle}>2024 - 2025 - 2026 karşılaştırmalı tablo</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'fatura' && (
          <View style={styles.listSection}>
            {faturalar.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>Fatura bulunamadı</Text>
              </View>
            ) : (
              faturalar.map((fatura, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.listItem}
                  onPress={() => router.push(`/fatura/${fatura.matbu_no}`)}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{fatura.matbu_no}</Text>
                    <Text style={styles.listItemSubtitle}>{fatura.tarih}</Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemAmount}>{formatCurrency(fatura.net_tutar)}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'tahsilat' && (
          <View style={styles.listSection}>
            {tahsilatlar.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>Tahsilat bulunamadı</Text>
              </View>
            ) : (
              tahsilatlar.map((tahsilat, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{tahsilat.tahsilat_turu}</Text>
                    <Text style={styles.listItemSubtitle}>{tahsilat.islem_tarihi}</Text>
                  </View>
                  <Text style={styles.listItemAmount}>{formatCurrency(tahsilat.tutar)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0a0a0a',
  },
  header: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  bayiKodu: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bayiUnvan: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    minWidth: (width - 48) / 2 - 4,
    borderLeftWidth: 3,
  },
  infoLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  developmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  devItem: {
    alignItems: 'center',
  },
  devLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  devValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devPercent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  devPercentText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthlySection: {
    marginBottom: 16,
  },
  monthlyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    minWidth: 55,
  },
  totalBox: {
    backgroundColor: '#2a4a2e',
  },
  avgBox: {
    backgroundColor: '#4a2a2e',
  },
  monthLabel: {
    color: '#888',
    fontSize: 10,
    marginBottom: 4,
  },
  monthValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    color: '#4CAF50',
  },
  avgValue: {
    color: '#FFC107',
  },
  listSection: {
    paddingTop: 8,
  },
  listItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemSubtitle: {
    color: '#888',
    fontSize: 12,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemAmount: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  salesDetailButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
    marginBottom: 16,
  },
  salesDetailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  salesDetailText: {
    marginLeft: 12,
  },
  salesDetailTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  salesDetailSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
