import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { bayiAPI, BayiDetail } from '../../src/services/api';

const formatNumber = (value?: number): string => {
  if (value === undefined || value === null || value === 0) return '-';
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const calculateGrowth = (current: number, previous: number): number | null => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const GrowthBadge: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return <Text style={styles.growthNull}>-</Text>;
  
  const isPositive = value >= 0;
  const color = isPositive ? '#4CAF50' : '#f44336';
  
  return (
    <View style={[styles.growthBadge, { backgroundColor: color + '20' }]}>
      <Ionicons 
        name={isPositive ? 'trending-up' : 'trending-down'} 
        size={14} 
        color={color} 
      />
      <Text style={[styles.growthText, { color }]}>
        {isPositive ? '+' : ''}{formatNumber(value)}%
      </Text>
    </View>
  );
};

export default function SatisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bayi, setBayi] = useState<BayiDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await bayiAPI.getDetail(id);
        setBayi(data);
      } catch (error) {
        console.error('Error fetching bayi data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

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

  const months = [
    { name: 'Ocak', key_2024: 'ocak_2024', key_2025: 'ocak_2025', key_2026: 'ocak_2026' },
    { name: 'Şubat', key_2024: 'subat_2024', key_2025: 'subat_2025', key_2026: 'subat_2026' },
    { name: 'Mart', key_2024: 'mart_2024', key_2025: 'mart_2025', key_2026: 'mart_2026' },
    { name: 'Nisan', key_2024: 'nisan_2024', key_2025: 'nisan_2025', key_2026: 'nisan_2026' },
    { name: 'Mayıs', key_2024: 'mayis_2024', key_2025: 'mayis_2025', key_2026: 'mayis_2026' },
    { name: 'Haziran', key_2024: 'haziran_2024', key_2025: 'haziran_2025', key_2026: 'haziran_2026' },
    { name: 'Temmuz', key_2024: 'temmuz_2024', key_2025: 'temmuz_2025', key_2026: 'temmuz_2026' },
    { name: 'Ağustos', key_2024: 'agustos_2024', key_2025: 'agustos_2025', key_2026: 'agustos_2026' },
    { name: 'Eylül', key_2024: 'eylul_2024', key_2025: 'eylul_2025', key_2026: 'eylul_2026' },
    { name: 'Ekim', key_2024: 'ekim_2024', key_2025: 'ekim_2025', key_2026: 'ekim_2026' },
    { name: 'Kasım', key_2024: 'kasim_2024', key_2025: 'kasim_2025', key_2026: 'kasim_2026' },
    { name: 'Aralık', key_2024: 'aralik_2024', key_2025: 'aralik_2025', key_2026: 'aralik_2026' },
  ];

  const getValue = (key: string): number => {
    return (bayi as any)[key] || 0;
  };

  // Calculate growths
  const growth_2024_2025 = calculateGrowth(bayi.toplam_satis_2025 || 0, bayi.toplam_satis_2024 || 0);
  const growth_2025_2026 = calculateGrowth(bayi.toplam_2026 || 0, bayi.toplam_satis_2025 || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />

      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Satış Detayları</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
          <Text style={styles.bayiUnvan} numberOfLines={2}>{bayi.bayi_unvani}</Text>
        </View>

        {/* Yıllık Gelişim Kartları */}
        <View style={styles.yearlyGrowthContainer}>
          <View style={styles.yearlyGrowthCard}>
            <Text style={styles.yearlyGrowthTitle}>2024 → 2025</Text>
            <View style={styles.yearlyGrowthRow}>
              <Text style={styles.yearlyGrowthLabel}>{formatNumber(bayi.toplam_satis_2024)}</Text>
              <Ionicons name="arrow-forward" size={14} color="#666" />
              <Text style={styles.yearlyGrowthLabel}>{formatNumber(bayi.toplam_satis_2025)}</Text>
            </View>
            <View style={[styles.yearlyGrowthBadge, { backgroundColor: getGelisimColor(growth_2024_2025) + '20' }]}>
              <Ionicons
                name={(growth_2024_2025 || 0) >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={getGelisimColor(growth_2024_2025)}
              />
              <Text style={[styles.yearlyGrowthPercent, { color: getGelisimColor(growth_2024_2025) }]}>
                {growth_2024_2025 !== null ? `${growth_2024_2025 >= 0 ? '+' : ''}${formatNumber(growth_2024_2025)}%` : '-'}
              </Text>
            </View>
          </View>

          <View style={styles.yearlyGrowthCard}>
            <Text style={styles.yearlyGrowthTitle}>2025 → 2026</Text>
            <View style={styles.yearlyGrowthRow}>
              <Text style={styles.yearlyGrowthLabel}>{formatNumber(bayi.toplam_satis_2025)}</Text>
              <Ionicons name="arrow-forward" size={14} color="#666" />
              <Text style={styles.yearlyGrowthLabel}>{formatNumber(bayi.toplam_2026)}</Text>
            </View>
            <View style={[styles.yearlyGrowthBadge, { backgroundColor: getGelisimColor(growth_2025_2026) + '20' }]}>
              <Ionicons
                name={(growth_2025_2026 || 0) >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={getGelisimColor(growth_2025_2026)}
              />
              <Text style={[styles.yearlyGrowthPercent, { color: getGelisimColor(growth_2025_2026) }]}>
                {growth_2025_2026 !== null ? `${growth_2025_2026 >= 0 ? '+' : ''}${formatNumber(growth_2025_2026)}%` : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tablo */}
        <View style={styles.tableContainer}>
          {/* Tablo Başlıkları */}
          <View style={styles.tableHeader}>
            <View style={styles.monthColumn}>
              <Text style={styles.headerText}>Ay</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.headerText}>2024</Text>
            </View>
            <View style={styles.growthColumn}>
              <Text style={styles.headerTextSmall}>24→25</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.headerText}>2025</Text>
            </View>
            <View style={styles.growthColumn}>
              <Text style={styles.headerTextSmall}>25→26</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.headerText}>2026</Text>
            </View>
          </View>

          {/* Aylık Veriler */}
          {months.map((month, index) => {
            const val2024 = getValue(month.key_2024);
            const val2025 = getValue(month.key_2025);
            const val2026 = getValue(month.key_2026);
            const growth24_25 = calculateGrowth(val2025, val2024);
            const growth25_26 = calculateGrowth(val2026, val2025);

            return (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <View style={styles.monthColumn}>
                  <Text style={styles.monthText}>{month.name}</Text>
                </View>
                <View style={styles.yearColumn}>
                  <Text style={styles.valueText}>{formatNumber(val2024)}</Text>
                </View>
                <View style={styles.growthColumn}>
                  <GrowthBadge value={growth24_25} />
                </View>
                <View style={styles.yearColumn}>
                  <Text style={styles.valueText}>{formatNumber(val2025)}</Text>
                </View>
                <View style={styles.growthColumn}>
                  <GrowthBadge value={growth25_26} />
                </View>
                <View style={styles.yearColumn}>
                  <Text style={styles.valueText}>{formatNumber(val2026)}</Text>
                </View>
              </View>
            );
          })}

          {/* Toplam Satırı */}
          <View style={styles.totalRow}>
            <View style={styles.monthColumn}>
              <Text style={styles.totalLabel}>TOPLAM</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_satis_2024)}</Text>
            </View>
            <View style={styles.growthColumn}>
              <GrowthBadge value={growth_2024_2025} />
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_satis_2025)}</Text>
            </View>
            <View style={styles.growthColumn}>
              <GrowthBadge value={growth_2025_2026} />
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_2026)}</Text>
            </View>
          </View>

          {/* Ortalama Satırı */}
          <View style={styles.avgRow}>
            <View style={styles.monthColumn}>
              <Text style={styles.avgLabel}>ORT.</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.avgValue}>{formatNumber(bayi.ortalama_2024)}</Text>
            </View>
            <View style={styles.growthColumn}>
              <Text style={styles.growthNull}>-</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.avgValue}>{formatNumber(bayi.ortalama_2025)}</Text>
            </View>
            <View style={styles.growthColumn}>
              <Text style={styles.growthNull}>-</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.avgValue}>{formatNumber(bayi.ortalama_2026)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  bayiKodu: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  bayiUnvan: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yearlyGrowthContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  yearlyGrowthCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  yearlyGrowthTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  yearlyGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  yearlyGrowthLabel: {
    color: '#888',
    fontSize: 10,
  },
  yearlyGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  yearlyGrowthPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  headerText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTextSmall: {
    color: '#0a0a0a',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  monthColumn: {
    width: 60,
    justifyContent: 'center',
  },
  yearColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthColumn: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  valueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
  },
  growthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  growthNull: {
    color: '#666',
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#2a4a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  totalLabel: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
  },
  avgRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#4a2a2e',
  },
  avgLabel: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: 'bold',
  },
  avgValue: {
    color: '#FFC107',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
