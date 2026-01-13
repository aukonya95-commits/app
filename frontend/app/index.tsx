import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glowCircle,
            {
              opacity: glowAnim,
            },
          ]}
        />
        <View style={styles.logoWrapper}>
          <Text style={styles.logoText}>S</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          { opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Aydın Ünlüer Konya</Text>
        <Text style={styles.subtitle}>Veri Uygulaması</Text>
        <View style={styles.divider} />
        <Text style={styles.author}>Semih Ateş</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#D4AF37',
    textShadowColor: '#D4AF37',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#C9A227',
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#D4AF37',
    marginVertical: 20,
    opacity: 0.5,
  },
  author: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
