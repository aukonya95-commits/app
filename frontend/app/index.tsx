import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // 2 saniye sonra Login ekranına geçiş yap
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
      <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 30 }} />
      <Text style={styles.loadingText}>Yükleniyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  logoText: { color: '#D4AF37', fontSize: 50, fontWeight: 'bold' },
  loadingText: { color: '#888', marginTop: 10, fontSize: 14 }
});