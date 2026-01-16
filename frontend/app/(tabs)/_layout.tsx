import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const isDST = user?.role === 'dst';

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
