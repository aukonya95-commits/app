import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, DashboardStats } from '../../src/services/api';

export default function HomeScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Aydın Ünlüer Konya</Text>
            <Text style={styles.headerSubtitle}>Veri Uygulaması</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bayi İstatistikleri</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.activeCard]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{stats?.aktif_bayi || 0}</Text>
              <Text style={styles.statLabel}>Aktif Bayi</Text>
            </View>

            <View style={[styles.statCard, styles.passiveCard]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="pause-circle" size={32} color="#FFC107" />
              </View>
              <Text style={styles.statNumber}>{stats?.pasif_bayi || 0}</Text>
              <Text style={styles.statLabel}>Pasif Bayi</Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#D4AF37" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Hoş Geldiniz</Text>
            <Text style={styles.infoText}>
              Bayi bilgilerini görüntülemek için "Bayi Ara" sekmesini kullanın.
              Excel dosyası yüklemek için "Yükle" sekmesine gidin.
            </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  logoSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeCard: {
    borderColor: '#4CAF50',
  },
  passiveCard: {
    borderColor: '#FFC107',
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    opacity: 0.9,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});
