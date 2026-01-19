import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => { router.replace('/login'); }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#D4AF37', fontSize: 40, fontWeight: 'bold' }}>S</Text>
      </View>
      <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Aydın Ünlüer-Konya</Text>
      <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
    </View>
  );
}