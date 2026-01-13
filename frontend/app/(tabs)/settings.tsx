import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#D4AF37" />
          </View>
          <Text style={styles.userName}>Admin</Text>
          <Text style={styles.userRole}>Yönetici</Text>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color="#D4AF37" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Uygulama Hakkında</Text>
              <Text style={styles.menuItemSubtitle}>Aydın Ünlüer Konya Veri Uygulaması</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <Ionicons name="code-outline" size={24} color="#D4AF37" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Versiyon</Text>
              <Text style={styles.menuItemSubtitle}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#D4AF37" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Geliştirici</Text>
              <Text style={styles.menuItemSubtitle}>Semih Ateş</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  menuItemContent: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#f44336',
    gap: 8,
  },
  logoutText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
});
