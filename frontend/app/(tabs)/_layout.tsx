import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../../src/services/api';

export default function TabLayout() {
  const { user } = useAuth();
  const isDST = user?.role === 'dst';
  const isAdmin = user?.role === 'admin';
  const [talepCount, setTalepCount] = useState(0);

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
      
      // Her 30 saniyede bir güncelle
      const interval = setInterval(fetchTalepCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Admin için header'da talep bildirimi
  const TalepBadge = () => {
    if (!isAdmin || talepCount === 0) return null;
    
    return (
      <TouchableOpacity 
        style={styles.talepButton}
        onPress={() => router.push('/rut-talepler')}
      >
        <Ionicons name="mail" size={22} color="#D4AF37" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{talepCount > 9 ? '9+' : talepCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a2e',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0a0a0a',
          borderBottomWidth: 1,
          borderBottomColor: '#1a1a2e',
        },
        headerTintColor: '#D4AF37',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <TalepBadge />,
      }}
    >
      {/* Ana Sayfa - sadece admin için */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)',
        }}
      />
      
      {/* Bayi Ara - herkes için */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Bayi Ara',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* DST - herkes için */}
      <Tabs.Screen
        name="dst"
        options={{
          title: 'DST',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* RUT - sadece DST için */}
      <Tabs.Screen
        name="rut"
        options={{
          title: 'RUT',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          href: isDST ? '/(tabs)/rut' : null,
        }}
      />
      
      {/* DSM - sadece admin için */}
      <Tabs.Screen
        name="dsm"
        options={{
          title: 'DSM',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/dsm',
        }}
      />
      
      {/* TTE - sadece admin için */}
      <Tabs.Screen
        name="tte"
        options={{
          title: 'TTE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/tte',
        }}
      />
      
      {/* Ekip Raporu - sadece admin için */}
      <Tabs.Screen
        name="ekip-raporu"
        options={{
          title: 'Ekip',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/ekip-raporu',
        }}
      />
      
      {/* Stil Satış - sadece admin için */}
      <Tabs.Screen
        name="stil-satis"
        options={{
          title: 'Stil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/stil-satis',
        }}
      />
      
      {/* Personel - sadece admin için */}
      <Tabs.Screen
        name="personel"
        options={{
          title: 'Personel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/personel',
        }}
      />
      
      {/* Ayarlar - herkes için */}
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Yükle - sadece admin için */}
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Yükle',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
          href: isDST ? null : '/(tabs)/upload',
        }}
      />
      
      {/* Eski settings sayfasını gizle */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  talepButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
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
});
