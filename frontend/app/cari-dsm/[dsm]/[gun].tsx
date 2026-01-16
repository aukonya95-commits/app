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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/services/api';

interface CariBayi {
  bayi_kodu: string;
  unvan: string;
  dst: string;
  dsm: string;
  tip: string;
  sinif: string;
  musteri_bakiyesi: number;
  gun_deger: number;
}

const gunLabels: { [key: string]: string } = {
  '0': '0 Gün',
  '1': '1 Gün',
  '2': '2 Gün',
  '3': '3 Gün',
  '4': '4 Gün',
  '5': '5 Gün',
  '6': '6 Gün',
  '7': '7 Gün',
  '8': '8 Gün',
  '9': '9 Gün',
  '10': '10 Gün',
  '11': '11 Gün',
  '12': '12 Gün',
  '13': '13 Gün',
  '14_uzeri': '14+ Gün',
  'toplam': 'Toplam Cari',
};

export default function CariDSMScreen() {
  const { dsm, gun } = useLocalSearchParams<{ dsm: string; gun: string }>();
  const router = useRouter();
  const [bayiler, setBayiler] = useState<CariBayi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/cari-bayiler-dsm/${encodeURIComponent(dsm)}?gun=${gun}`);
        setBayiler(response.data);
      } catch (error) {
        console.error('Error fetching cari bayiler:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dsm, gun]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺';
  };

  const totalGunDeger = bayiler.reduce((sum, b) => sum + (b.gun_deger || 0), 0);

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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{decodeURIComponent(dsm)}</Text>
          <Text style={styles.headerSubtitle}>{gunLabels[gun || 'toplam']} - {bayiler.length} bayi</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Toplam Tutar</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalGunDeger)}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {bayiler.map((bayi, index) => (
          <TouchableOpacity
            key={bayi.bayi_kodu + index}
            style={styles.bayiCard}
            onPress={() => router.push(`/bayi/${bayi.bayi_kodu}`)}
          >
            <View style={styles.bayiHeader}>
              <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
              <View style={[styles.sinifBadge, { backgroundColor: bayi.sinif === 'A' ? '#4CAF50' : bayi.sinif === 'B' ? '#2196F3' : '#FF9800' }]}>
                <Text style={styles.sinifText}>{bayi.sinif}</Text>
              </View>
            </View>
            <Text style={styles.bayiUnvan} numberOfLines={2}>{bayi.unvan}</Text>
            <View style={styles.bayiInfo}>
              <Text style={styles.bayiInfoText}>DST: {bayi.dst}</Text>
              <Text style={styles.bayiInfoText}>Tip: {bayi.tip}</Text>
            </View>
            <View style={styles.bayiAmounts}>
              <View>
                <Text style={styles.amountLabel}>{gunLabels[gun || 'toplam']} Tutar</Text>
                <Text style={styles.amountValue}>{formatCurrency(bayi.gun_deger)}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>Toplam Bakiye</Text>
                <Text style={styles.amountValueSmall}>{formatCurrency(bayi.musteri_bakiyesi)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {bayiler.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Bu gün için carili bayi bulunamadı</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  bayiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5722',
  },
  bayiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bayiKodu: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  sinifBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sinifText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  bayiUnvan: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  bayiInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bayiInfoText: {
    fontSize: 11,
    color: '#888',
    marginRight: 16,
  },
  bayiAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  amountLabel: {
    fontSize: 10,
    color: '#888',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  amountValueSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D4AF37',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  bottomPadding: {
    height: 40,
  },
});
