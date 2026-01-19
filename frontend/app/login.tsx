import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 2, 
    borderColor: '#D4AF37', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoText: { 
    color: '#D4AF37', 
    fontSize: 40, 
    fontWeight: 'bold' 
  }
});