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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#D4AF37',
          headerTitle: 'Satış Detayları',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#D4AF37" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
          <Text style={styles.bayiUnvan} numberOfLines={2}>{bayi.bayi_unvani}</Text>
        </View>

        {/* Gelişim Kartı */}
        <View style={styles.developmentCard}>
          <Text style={styles.developmentTitle}>2024 → 2025 Satış Gelişimi</Text>
          <View style={styles.developmentRow}>
            <View style={styles.devItem}>
              <Text style={styles.devLabel}>2024 Toplam</Text>
              <Text style={styles.devValue}>{formatNumber(bayi.toplam_satis_2024)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#666" />
            <View style={styles.devItem}>
              <Text style={styles.devLabel}>2025 Toplam</Text>
              <Text style={styles.devValue}>{formatNumber(bayi.toplam_satis_2025)}</Text>
            </View>
            <View style={[styles.devPercent, { backgroundColor: getGelisimColor(bayi.gelisim_yuzdesi) + '20' }]}>
              <Ionicons
                name={(bayi.gelisim_yuzdesi || 0) >= 0 ? 'trending-up' : 'trending-down'}
                size={18}
                color={getGelisimColor(bayi.gelisim_yuzdesi)}
              />
              <Text style={[styles.devPercentText, { color: getGelisimColor(bayi.gelisim_yuzdesi) }]}>
                %{formatNumber(bayi.gelisim_yuzdesi)}
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
            <View style={styles.yearColumn}>
              <Text style={styles.headerText}>2025</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.headerText}>2026</Text>
            </View>
          </View>

          {/* Aylık Veriler */}
          {months.map((month, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
              <View style={styles.monthColumn}>
                <Text style={styles.monthText}>{month.name}</Text>
              </View>
              <View style={styles.yearColumn}>
                <Text style={styles.valueText}>{formatNumber(getValue(month.key_2024))}</Text>
              </View>
              <View style={styles.yearColumn}>
                <Text style={styles.valueText}>{formatNumber(getValue(month.key_2025))}</Text>
              </View>
              <View style={styles.yearColumn}>
                <Text style={styles.valueText}>{formatNumber(getValue(month.key_2026))}</Text>
              </View>
            </View>
          ))}

          {/* Toplam Satırı */}
          <View style={styles.totalRow}>
            <View style={styles.monthColumn}>
              <Text style={styles.totalLabel}>TOPLAM</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_satis_2024)}</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_satis_2025)}</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.totalValue}>{formatNumber(bayi.toplam_2026)}</Text>
            </View>
          </View>

          {/* Ortalama Satırı */}
          <View style={styles.avgRow}>
            <View style={styles.monthColumn}>
              <Text style={styles.avgLabel}>ORTALAMA</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.avgValue}>{formatNumber(bayi.ortalama_2024)}</Text>
            </View>
            <View style={styles.yearColumn}>
              <Text style={styles.avgValue}>{formatNumber(bayi.ortalama_2025)}</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  developmentCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  developmentTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  developmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  devItem: {
    alignItems: 'center',
  },
  devLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
  },
  devValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  devPercent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  devPercentText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#0a0a0a',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  monthColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  yearColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
  valueText: {
    color: '#fff',
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  avgRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#4a2a2e',
  },
  avgLabel: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: 'bold',
  },
  avgValue: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
