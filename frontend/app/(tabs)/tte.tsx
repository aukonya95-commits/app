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
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

interface TTEData {
  tte_name: string;
  bayi_sayisi?: number;
  aktif_bayi_sayisi?: number;
  pasif_bayi_sayisi?: number;
  jti?: number;
  jti_stand?: number;
  pmi?: number;
  pmi_stand?: number;
  bat?: number;
  bat_stand?: number;
  sinif_a?: number;
  sinif_a_plus?: number;
  sinif_b?: number;
  sinif_c?: number;
  sinif_d?: number;
  sinif_e?: number;
  sinif_e_minus?: number;
}

export default function TTEScreen() {
  const router = useRouter();
  const [tteList, setTteList] = useState<TTEData[]>([]);
  const [selectedTTE, setSelectedTTE] = useState<TTEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTTEData = async () => {
    try {
      const response = await api.get('/tte-data');
      setTteList(response.data);
      if (response.data.length > 0 && !selectedTTE) {
        setSelectedTTE(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching TTE data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTTEData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTTEData();
  };

  const formatNumber = (value?: number, decimals: number = 0) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(2);
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
      
      {/* TTE Selection Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
        <View style={styles.tabContainer}>
          {tteList.map((tte) => (
            <TouchableOpacity
              key={tte.tte_name}
              style={[
                styles.tab,
                selectedTTE?.tte_name === tte.tte_name && styles.activeTab
              ]}
              onPress={() => setSelectedTTE(tte)}
            >
              <Text style={[
                styles.tabText,
                selectedTTE?.tte_name === tte.tte_name && styles.activeTabText
              ]}>
                {tte.tte_name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedTTE && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        >
          {/* Bayi Sayıları */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.activeValue]}>{formatNumber(selectedTTE.aktif_bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Aktif Bayi</Text>
            </View>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push(`/pasif-bayiler-tte/${encodeURIComponent(selectedTTE.tte_name)}`)}
            >
              <Text style={[styles.statValue, styles.passiveValue]}>{formatNumber(selectedTTE.pasif_bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Pasif Bayi</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFC107" />
            </TouchableOpacity>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(selectedTTE.bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>

          {/* Stand Sayıları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stand Sayıları</Text>
            <View style={styles.standGrid}>
              <View style={styles.standCard}>
                <View style={styles.standHeader}>
                  <Text style={styles.standTitle}>JTI</Text>
                </View>
                <Text style={styles.standValue}>{formatNumber(selectedTTE.jti)}</Text>
                <Text style={styles.standPercent}>{formatPercent(selectedTTE.jti_stand)}</Text>
              </View>
              <View style={styles.standCard}>
                <View style={styles.standHeader}>
                  <Text style={styles.standTitle}>PMI</Text>
                </View>
                <Text style={styles.standValue}>{formatNumber(selectedTTE.pmi)}</Text>
                <Text style={styles.standPercent}>{formatPercent(selectedTTE.pmi_stand)}</Text>
              </View>
              <View style={styles.standCard}>
                <View style={styles.standHeader}>
                  <Text style={styles.standTitle}>BAT</Text>
                </View>
                <Text style={styles.standValue}>{formatNumber(selectedTTE.bat)}</Text>
                <Text style={styles.standPercent}>{formatPercent(selectedTTE.bat_stand)}</Text>
              </View>
            </View>
          </View>

          {/* Bayi Sınıfları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bayi Sınıfları</Text>
            <View style={styles.classGrid}>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>A+</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_a_plus)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>A</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_a)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>B</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_b)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>C</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_c)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>D</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_d)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>E</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_e)}</Text>
              </View>
              <View style={styles.classCard}>
                <Text style={styles.classTitle}>E-</Text>
                <Text style={styles.classValue}>{formatNumber(selectedTTE.sinif_e_minus)}</Text>
              </View>
            </View>
          </View>

          {/* Özet Tablo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özet Bilgiler</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>TTE Adı</Text>
                <Text style={styles.tableValue}>{selectedTTE.tte_name}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Toplam Bayi</Text>
                <Text style={styles.tableValue}>{formatNumber(selectedTTE.bayi_sayisi)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Aktif Bayi</Text>
                <Text style={[styles.tableValue, styles.activeText]}>{formatNumber(selectedTTE.aktif_bayi_sayisi)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Pasif Bayi</Text>
                <Text style={[styles.tableValue, styles.passiveText]}>{formatNumber(selectedTTE.pasif_bayi_sayisi)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>JTI Stand</Text>
                <Text style={styles.tableValue}>{formatNumber(selectedTTE.jti)} ({formatPercent(selectedTTE.jti_stand)})</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>PMI Stand</Text>
                <Text style={styles.tableValue}>{formatNumber(selectedTTE.pmi)} ({formatPercent(selectedTTE.pmi_stand)})</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>BAT Stand</Text>
                <Text style={styles.tableValue}>{formatNumber(selectedTTE.bat)} ({formatPercent(selectedTTE.bat_stand)})</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  tabScrollView: {
    maxHeight: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  activeTabText: {
    color: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeValue: {
    color: '#4CAF50',
  },
  passiveValue: {
    color: '#FFC107',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  standGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  standCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  standHeader: {
    marginBottom: 8,
  },
  standTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  standValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  standPercent: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classCard: {
    width: '13%',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  classTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  classValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  activeText: {
    color: '#4CAF50',
  },
  passiveText: {
    color: '#FFC107',
  },
});
