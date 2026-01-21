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

interface CariliBayi {
  bayi_kodu: string;
  unvan: string;
  dst: string;
  tip: string;
  musteri_bakiyesi: number;
  sinif: string;
}

const kanalLabels: Record<string, string> = {
  'piyasa': 'Piyasa',
  'yerel-zincir': 'Yerel Zincir',
  'askeriye': 'Askeriye + Cezaevi',
  'benzinlik': 'Benzinlik',
  'geleneksel': 'Geleneksel',
};

export default function CariliKanalScreen() {
  const router = useRouter();
  const { kanal } = useLocalSearchParams<{ kanal: string }>();
  const [bayiler, setBayiler] = useState<CariliBayi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBayiler = async () => {
    try {
      const response = await api.get(`/carili-kanal-bayiler/${kanal}`);
      setBayiler(response.data || []);
    } catch (error) {
      console.error('Error fetching carili kanal bayiler:', error);
      setBayiler([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (kanal) {
      fetchBayiler();
    }
  }, [kanal]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBayiler();
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  };

  const totalBakiye = bayiler.reduce((sum, b) => sum + (b.musteri_bakiyesi || 0), 0);

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
          <Text style={styles.headerTitle}>{kanalLabels[kanal || ''] || kanal} Carili Bayiler</Text>
          <Text style={styles.headerSubtitle}>{bayiler.length} borçlu bayi</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Toplam Bakiye</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalBakiye)}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {bayiler.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>Bu kanalda borçlu bayi yok</Text>
          </View>
        ) : (
          bayiler.map((bayi, index) => (
            <TouchableOpacity
              key={bayi.bayi_kodu + index}
              style={styles.bayiCard}
              onPress={() => router.push(`/bayi/${bayi.bayi_kodu}`)}
            >
              <View style={styles.bayiHeader}>
                <Text style={styles.bayiKodu}>{bayi.bayi_kodu}</Text>
                <View style={[styles.sinifBadge, { backgroundColor: bayi.sinif === 'A' ? '#4CAF50' : bayi.sinif === 'B' ? '#2196F3' : '#FF9800' }]}>
                  <Text style={styles.sinifText}>{bayi.sinif || '-'}</Text>
                </View>
              </View>
              <Text style={styles.bayiUnvan} numberOfLines={2}>{bayi.unvan}</Text>
              <View style={styles.bayiInfo}>
                <Text style={styles.bayiInfoText}>DST: {bayi.dst || '-'}</Text>
                <Text style={styles.bayiInfoText}>Tip: {bayi.tip || '-'}</Text>
              </View>
              <View style={styles.bakiyeContainer}>
                <Text style={styles.bakiyeLabel}>Toplam Bakiye</Text>
                <Text style={styles.bakiyeValue}>{formatCurrency(bayi.musteri_bakiyesi)}</Text>
              </View>
            </TouchableOpacity>
          ))
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  bayiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  bayiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bayiKodu: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  sinifBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sinifText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  bayiUnvan: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  bayiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bayiInfoText: {
    fontSize: 12,
    color: '#888',
  },
  bakiyeContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bakiyeLabel: {
    fontSize: 11,
    color: '#888',
  },
  bakiyeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
