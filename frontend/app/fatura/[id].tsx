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
import { faturaAPI, FaturaDetay } from '../../src/services/api';

const formatNumber = (value?: number): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

export default function FaturaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detay, setDetay] = useState<FaturaDetay | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await faturaAPI.getDetail(id);
        setDetay(data);
      } catch (error) {
        console.error('Error fetching fatura detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!detay) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <Text style={styles.errorText}>Fatura detayı bulunamadı</Text>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Fatura Detay</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={32} color="#D4AF37" />
          <View style={styles.headerContent}>
            <Text style={styles.matbuNo}>{detay.matbu_no}</Text>
            <Text style={styles.totalLabel}>Toplam Miktar: <Text style={styles.totalValue}>{formatNumber(detay.toplam_miktar)}</Text></Text>
          </View>
        </View>

        {/* Products */}
        <Text style={styles.sectionTitle}>Ürün Listesi ({detay.urunler.length} ürün)</Text>

        {detay.urunler.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>Ürün bulunamadı</Text>
          </View>
        ) : (
          <View style={styles.productList}>
            {detay.urunler.map((urun, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productIndex}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.productContent}>
                  <Text style={styles.productName}>{urun.urun_adi}</Text>
                </View>
                <View style={styles.productQuantity}>
                  <Text style={styles.quantityText}>{formatNumber(urun.miktar)}</Text>
                  <Text style={styles.quantityLabel}>karton</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Ürün Çeşidi</Text>
            <Text style={styles.summaryValue}>{detay.urunler.length}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>Toplam Miktar</Text>
            <Text style={[styles.summaryValue, styles.summaryTotal]}>{formatNumber(detay.toplam_miktar)}</Text>
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
  header: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  headerContent: {
    marginLeft: 16,
    flex: 1,
  },
  matbuNo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalLabel: {
    color: '#888',
    fontSize: 14,
  },
  totalValue: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  productList: {
    gap: 8,
  },
  productItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  productContent: {
    flex: 1,
  },
  productName: {
    color: '#fff',
    fontSize: 14,
  },
  productQuantity: {
    alignItems: 'flex-end',
  },
  quantityText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityLabel: {
    color: '#888',
    fontSize: 10,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryTotal: {
    color: '#D4AF37',
    fontSize: 18,
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
});
