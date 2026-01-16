import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

interface DSTSummary {
  dst: string;
  bayi_sayisi?: number;
  aktif_bayi_sayisi?: number;
  pasif_bayi_sayisi?: number;
  hedef_basari_orani?: number;
  aralik_satis?: number;
}

export default function DSTScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dstList, setDstList] = useState<DSTSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDSTList = async () => {
    try {
      const response = await api.get('/dst-data');
      let data = response.data;
      
      // DST kullanıcısı ise sadece kendi verisini göster
      if (user?.role === 'dst' && user?.dst_name) {
        const dstName = user.dst_name.toUpperCase();
        data = data.filter((d: DSTSummary) => 
          d.dst?.toUpperCase() === dstName
        );
      }
      
      setDstList(data);
    } catch (error) {
      console.error('Error fetching DST list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDSTList();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDSTList();
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(1);
  };

  const renderDSTItem = ({ item }: { item: DSTSummary }) => (
    <TouchableOpacity
      style={styles.dstCard}
      onPress={() => router.push(`/dst/${encodeURIComponent(item.dst)}`)}
      activeOpacity={0.7}
    >
      <View style={styles.dstHeader}>
        <View style={styles.dstIconContainer}>
          <Ionicons name="person" size={24} color="#D4AF37" />
        </View>
        <Text style={styles.dstName}>{item.dst}</Text>
        <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(item.bayi_sayisi)}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.activeValue]}>{formatNumber(item.aktif_bayi_sayisi)}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.passiveValue]}>{formatNumber(item.pasif_bayi_sayisi)}</Text>
          <Text style={styles.statLabel}>Pasif</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.percentValue]}>{formatPercent(item.hedef_basari_orani)}</Text>
          <Text style={styles.statLabel}>Başarı</Text>
        </View>
      </View>
      
      <View style={styles.salesRow}>
        <Ionicons name="trending-up" size={16} color="#4CAF50" />
        <Text style={styles.salesLabel}>Aralık Satış:</Text>
        <Text style={styles.salesValue}>{formatNumber(item.aralik_satis)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
        </View>
      ) : dstList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#888" />
          <Text style={styles.emptyText}>DST verisi bulunamadı</Text>
          <Text style={styles.emptySubText}>Excel dosyası yükleyerek verileri ekleyin</Text>
        </View>
      ) : (
        <FlatList
          data={dstList}
          renderItem={renderDSTItem}
          keyExtractor={(item) => item.dst}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <Ionicons name="people" size={24} color="#D4AF37" />
              <Text style={styles.headerInfoText}>{dstList.length} DST listelendi</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#888',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerInfoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  dstCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dstHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dstIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dstName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeValue: {
    color: '#4CAF50',
  },
  passiveValue: {
    color: '#FFC107',
  },
  percentValue: {
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  salesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
  },
  salesLabel: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  salesValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
});
