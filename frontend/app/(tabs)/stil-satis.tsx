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

interface StilAySatisRecord {
  _id: string;
  ay: string;
  toplam: number;
  [key: string]: any;
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
};

export default function StilSatisScreen() {
  const [records, setRecords] = useState<StilAySatisRecord[]>([]);
  const [selectedAy, setSelectedAy] = useState<StilAySatisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/stil-ay-satis');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching stil ay satis:', error);
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

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Calculate yearly total
  const yilToplam = records.reduce((sum, r) => sum + (r.toplam || 0), 0);

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
          <Ionicons name="bar-chart" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Stil Ay Satış</Text>
        </View>

        {/* Yıl Toplam */}
        <View style={styles.yilToplamCard}>
          <Text style={styles.yilToplamLabel}>Yıl Toplam Satış</Text>
          <Text style={styles.yilToplamValue}>{formatNumber(yilToplam)}</Text>
        </View>

        {/* Aylık Satışlar */}
        <Text style={styles.sectionTitle}>Aylık Ürün Satışları</Text>
        {records.map((record) => (
          <TouchableOpacity
            key={record._id}
            style={[styles.ayCard, selectedAy?._id === record._id && styles.ayCardActive]}
            onPress={() => setSelectedAy(selectedAy?._id === record._id ? null : record)}
          >
            <View style={styles.ayHeader}>
              <Text style={styles.ayName}>{record.ay}</Text>
              <Text style={styles.ayToplam}>{formatNumber(record.toplam)}</Text>
              <Ionicons
                name={selectedAy?._id === record._id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#D4AF37"
              />
            </View>
            
            {selectedAy?._id === record._id && (
              <View style={styles.ayDetail}>
                {Object.keys(skuLabels).map((key) => {
                  const value = record[key];
                  if (value === 0 || value === undefined) return null;
                  return (
                    <View key={key} style={styles.skuRow}>
                      <Text style={styles.skuLabel}>{skuLabels[key]}</Text>
                      <Text style={styles.skuValue}>{formatNumber(value)}</Text>
                    </View>
                  );
                })}
                {Object.keys(skuLabels).every(key => !record[key] || record[key] === 0) && (
                  <Text style={styles.emptyText}>Bu ay için veri yok</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

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
    marginBottom: 12,
  },
  yilToplamCard: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  yilToplamLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  yilToplamValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  ayCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  ayCardActive: {
    borderLeftColor: '#4CAF50',
  },
  ayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ayName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  ayToplam: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginRight: 12,
  },
  ayDetail: {
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
  emptyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
