import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.brandTitle}>Aydın Ünlüer-Konya</Text>
      <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  brandTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginTop: 15 }
});