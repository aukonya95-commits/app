import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animasyonu
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Nabız animasyonu
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const timer = setTimeout(() => { router.replace('/login'); }, 2500);
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#0a1628', '#0d1f3c', '#0a1628']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnimation }] }]}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>K</Text>
          </View>
        </Animated.View>

        {/* Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>AYDIN ÜNLÜER</Text>
          <View style={styles.locationRow}>
            <View style={styles.line} />
            <Text style={styles.locationText}>KONYA</Text>
            <View style={styles.line} />
          </View>
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footerText}>Veri Yönetim Sistemi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0d2847',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a4a8f',
    shadowColor: '#1a4a8f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  logoText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  brandTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  line: {
    height: 1,
    width: 25,
    backgroundColor: '#D4AF37',
  },
  locationText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 10,
    letterSpacing: 4,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    color: '#5a7a9a',
    fontSize: 14,
    marginTop: 15,
  },
  footerText: {
    color: '#2a4a6a',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 30,
  },
});
