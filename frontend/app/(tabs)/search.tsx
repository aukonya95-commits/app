import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { bayiAPI, BayiSummary } from '../../src/services/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BayiSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      const data = await bayiAPI.search(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Aktif':
        return '#4CAF50';
      case 'Pasif':
        return '#FFC107';
      case 'İptal':
        return '#f44336';
      default:
        return '#888';
    }
  };

  const renderItem = ({ item }: { item: BayiSummary }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push(`/bayi/${item.bayi_kodu}`)}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.bayiKodu}>{item.bayi_kodu}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.kapsam_durumu) }]}>
            <Text style={styles.statusText}>{item.kapsam_durumu || 'Bilinmiyor'}</Text>
          </View>
        </View>
        <Text style={styles.bayiUnvan} numberOfLines={2}>{item.bayi_unvani}</Text>
        <View style={styles.resultMeta}>
          {item.tip && <Text style={styles.metaText}>Tip: {item.tip}</Text>}
          {item.sinif && <Text style={styles.metaText}>Sınıf: {item.sinif}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#D4AF37" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bayi kodu veya adı ile arayın..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Örnek: "çelikkaya" veya "6764" yazarak arayabilirsiniz
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.bayi_kodu}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searched ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                <Text style={styles.emptySubtext}>Farklı bir arama yapmayı deneyin</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="storefront-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>Bayi Arama</Text>
                <Text style={styles.emptySubtext}>Bayi kodu veya adı ile arama yapın</Text>
              </View>
            )
          }
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  resultItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bayiKodu: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  bayiUnvan: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
});
