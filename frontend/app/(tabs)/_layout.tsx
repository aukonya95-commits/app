import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView,
  Platform,
  Dimensions 
} from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

interface MenuItem {
  name: string;
  title: string;
  icon: string;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { name: 'index', title: 'Ana Sayfa', icon: 'home-outline', path: '/(tabs)', roles: ['admin', 'dsm', 'tte'] },
  { name: 'search', title: 'Bayi Ara', icon: 'search-outline', path: '/(tabs)/search', roles: ['admin', 'dsm', 'tte', 'dst'] },
  { name: 'harita', title: 'Satış Haritası', icon: 'map-outline', path: '/(tabs)/harita', roles: ['admin', 'dsm'] },
  { name: 'dst', title: 'DST', icon: 'people-outline', path: '/(tabs)/dst', roles: ['admin', 'dsm', 'tte', 'dst'] },
  { name: 'rut', title: 'RUT', icon: 'navigate-outline', path: '/(tabs)/rut', roles: ['admin', 'dst'] },
  { name: 'dsm', title: 'DSM', icon: 'briefcase-outline', path: '/(tabs)/dsm', roles: ['admin'] },
  { name: 'tte', title: 'TTE', icon: 'stats-chart-outline', path: '/(tabs)/tte', roles: ['admin'] },
  { name: 'ekip-raporu', title: 'Ekip Raporu', icon: 'calendar-outline', path: '/(tabs)/ekip-raporu', roles: ['admin'] },
  { name: 'stil-satis', title: 'Stil Satış', icon: 'bar-chart-outline', path: '/(tabs)/stil-satis', roles: ['admin'] },
  { name: 'personel', title: 'Personel', icon: 'person-outline', path: '/(tabs)/personel', roles: ['admin'] },
  { name: 'upload', title: 'Veri Yükle', icon: 'cloud-upload-outline', path: '/(tabs)/upload', roles: ['admin'] },
  { name: 'ayarlar', title: 'Ayarlar', icon: 'settings-outline', path: '/(tabs)/ayarlar', roles: ['admin', 'dsm', 'tte', 'dst'] },
];

export default function TabLayout() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = useState(false);
  const [talepCount, setTalepCount] = useState(0);
  
  const userRole = user?.role || 'dst';
  const isAdmin = userRole === 'admin';
  
  // Kullanıcının görebileceği menü öğelerini filtrele
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));
  
  // Aktif sayfa başlığını bul
  const getActiveTitle = () => {
    const currentItem = menuItems.find(item => pathname === item.path || pathname === item.path.replace('/(tabs)', ''));
    return currentItem?.title || 'Ana Sayfa';
  };

  // Admin için bekleyen talep sayısını al
  useEffect(() => {
    if (isAdmin) {
      const fetchTalepCount = async () => {
        try {
          const response = await api.get('/rut/talep-sayisi');
          setTalepCount(response.data?.count || 0);
        } catch (error) {
          console.error('Error fetching talep count:', error);
        }
      };
      fetchTalepCount();
      const interval = setInterval(fetchTalepCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const navigateTo = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getActiveTitle()}</Text>
        
        <View style={styles.headerRight}>
          {/* Admin için talep bildirimi */}
          {isAdmin && talepCount > 0 && (
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/rut-talepler')}
            >
              <Ionicons name="mail" size={24} color="#D4AF37" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{talepCount > 9 ? '9+' : talepCount}</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Hamburger menü butonu */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={28} color="#D4AF37" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ana içerik */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Açılır Menü Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {/* Menü Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderTitle}>Menü</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            
            {/* Kullanıcı Bilgisi */}
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={40} color="#D4AF37" />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
                <Text style={styles.userRole}>{getRoleName(userRole)}</Text>
              </View>
            </View>
            
            {/* Menü Öğeleri */}
            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
              {visibleMenuItems.map((item, index) => {
                const isActive = pathname === item.path || pathname === item.path.replace('/(tabs)', '');
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => navigateTo(item.path)}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={22} 
                      color={isActive ? '#D4AF37' : '#888'} 
                    />
                    <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                      {item.title}
                    </Text>
                    {isActive && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function getRoleName(role: string): string {
  switch (role) {
    case 'admin': return 'Yönetici';
    case 'dsm': return 'DSM';
    case 'tte': return 'TTE';
    case 'dst': return 'DST';
    default: return role;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a1628',
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a6a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: Math.min(width * 0.75, 300),
    height: '100%',
    backgroundColor: '#0a1628',
    borderLeftWidth: 1,
    borderLeftColor: '#D4AF37',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a6a',
  },
  menuHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a6a',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#0d2847',
  },
  menuItemText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 14,
    flex: 1,
  },
  menuItemTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: '#D4AF37',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
