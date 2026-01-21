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
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';

interface PasifBayi {
  bayi_kodu: string;
  bayi_unvani: string;
  dst?: string;
  tte?: string;
  txtkapsam?: string;
}

export default function PasifBayilerDSTScreen() {
  const router = useRouter();
  const { dst } = useLocalSearchParams<{ dst: string }>();
  const [bayiler, setBayiler] = useState<PasifBayi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPasifBayiler = async () => {
    try {
      console.log('Fetching pasif bayiler for DST:', dst);
      const response = await api.get(`/pasif-bayiler-dst/${encodeURIComponent(dst || '')}`);
      console.log('Response data:', response.data);
      setBayiler(response.data || []);
    } catch (error) {
      console.error('Error fetching pasif bayiler:', error);
      setBayiler([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (dst) {
      fetchPasifBayiler();
    }
  }, [dst]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPasifBayiler();
  };

  const renderBayiItem = ({ item }: { item: PasifBayi }) => (
    <TouchableOpacity
      style={styles.bayiCard}
      onPress={() => router.push(`/bayi/${item.bayi_kodu}`)}
      activeOpacity={0.7}
    >
      <View style={styles.bayiHeader}>
        <View style={styles.bayiKoduContainer}>
          <Text style={styles.bayiKodu}>{item.bayi_kodu}</Text>
        </View>
        <View style={styles.kapsamBadge}>
          <Text style={styles.kapsamText}>{item.txtkapsam || 'Pasif'}</Text>
        </View>
      </View>
      
      <Text style={styles.bayiUnvani}>{item.bayi_unvani}</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DST</Text>
          <Text style={styles.infoValue}>{item.dst || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>TTE</Text>
          <Text style={styles.infoValue}>{item.tte || '-'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Pasif Bayiler</Text>
          <Text style={styles.headerSubtitle}>{dst} - {bayiler.length} bayi</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="pause-circle" size={32} color="#FFC107" />
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
        </View>
      ) : bayiler.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Pasif bayi bulunmamaktadır</Text>
        </View>
      ) : (
        <FlatList
          data={bayiler}
          renderItem={renderBayiItem}
          keyExtractor={(item) => item.bayi_kodu}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
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
    color: '#FFC107',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  headerIcon: {
    marginLeft: 12,
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
  listContent: {
    padding: 16,
  },
  bayiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  bayiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bayiKoduContainer: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bayiKodu: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  kapsamBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kapsamText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  bayiUnvani: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
});
