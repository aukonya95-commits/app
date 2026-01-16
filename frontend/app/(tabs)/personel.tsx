import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface PersonelRecord {
  _id: string;
  sira_no: number;
  bolge: string;
  distributor: string;
  adi: string;
  pozisyonu: string;
  cep_telefonu: string;
  yakini: string;
  yakini_telefon: string;
  kan_grubu: string;
  src: string;
  src_verilis: number;
  psikoteknik_verilis: number;
  psikoteknik_gecerlilik: number;
  mezuniyet: string;
  bolum: string;
  arac_plaka: string;
}

export default function PersonelScreen() {
  const [records, setRecords] = useState<PersonelRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PersonelRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPersonel, setSelectedPersonel] = useState<PersonelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/personel-data');
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error('Error fetching personel data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredRecords(records);
    } else {
      const search = searchText.toLowerCase();
      const filtered = records.filter(r => 
        r.adi?.toLowerCase().includes(search) ||
        r.pozisyonu?.toLowerCase().includes(search)
      );
      setFilteredRecords(filtered);
    }
  }, [searchText, records]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (excelDate?: number) => {
    if (!excelDate || typeof excelDate !== 'number') return '-';
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPhone = (phone?: string | number) => {
    if (!phone) return '-';
    // Convert to string and remove .0 if present
    let p = phone.toString().replace(/\.0$/, '');
    // Remove any non-digit characters
    p = p.replace(/\D/g, '');
    if (p.length === 10) {
      return `0${p.slice(0,3)} ${p.slice(3,6)} ${p.slice(6)}`;
    }
    if (p.length === 11 && p.startsWith('0')) {
      return `${p.slice(0,4)} ${p.slice(4,7)} ${p.slice(7)}`;
    }
    return p || '-';
  };

  const getPositionColor = (pos?: string) => {
    if (!pos) return '#888';
    const p = pos.toUpperCase();
    if (p === 'DSM') return '#D4AF37';
    if (p === 'TTE') return '#4CAF50';
    if (p === 'DST') return '#2196F3';
    return '#FF9800';
  };

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
          <Ionicons name="people" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Personel Listesi</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="İsim veya pozisyon ara..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.countText}>{filteredRecords.length} personel</Text>

        {/* Personel List */}
        {filteredRecords.map((person) => (
          <TouchableOpacity
            key={person._id}
            style={[styles.personCard, selectedPersonel?._id === person._id && styles.personCardActive]}
            onPress={() => setSelectedPersonel(selectedPersonel?._id === person._id ? null : person)}
          >
            <View style={styles.personHeader}>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.adi}</Text>
                <View style={[styles.positionBadge, { backgroundColor: getPositionColor(person.pozisyonu) }]}>
                  <Text style={styles.positionText}>{person.pozisyonu}</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPersonel?._id === person._id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#D4AF37"
              />
            </View>
            
            {selectedPersonel?._id === person._id && (
              <View style={styles.personDetail}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cep Telefonu</Text>
                  <Text style={styles.detailValue}>{formatPhone(person.cep_telefonu)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kan Grubu</Text>
                  <Text style={styles.detailValue}>{person.kan_grubu || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Yakını</Text>
                  <Text style={styles.detailValue}>{person.yakini || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Yakını Tel</Text>
                  <Text style={styles.detailValue}>{formatPhone(person.yakini_telefon)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SRC</Text>
                  <Text style={styles.detailValue}>{person.src || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SRC Veriliş</Text>
                  <Text style={styles.detailValue}>{formatDate(person.src_verilis)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Psikoteknik</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(person.psikoteknik_verilis)} - {formatDate(person.psikoteknik_gecerlilik)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mezuniyet</Text>
                  <Text style={styles.detailValue}>{person.mezuniyet || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bölüm</Text>
                  <Text style={styles.detailValue}>{person.bolum || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Araç Plaka</Text>
                  <Text style={styles.detailValue}>{person.arac_plaka || '-'}</Text>
                </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 14,
  },
  countText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  personCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  personCardActive: {
    borderLeftColor: '#4CAF50',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginRight: 10,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  positionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  personDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
  },
  detailValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
