import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log("Giriş denemesi başladı..."); // Terminalde bunu görüyorsan buton çalışıyor demektir
    if (!username || !password) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Giriş Hatası:", error);
      Alert.alert('Hata', 'Kullanıcı adı veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appName}>Aydın Ünlüer Konya</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* BUTON: Z-Index ve Şeffaflık Ayarlı */}
            <TouchableOpacity 
              onPress={handleLogin}
              style={styles.loginButtonWrapper}
              activeOpacity={0.7}
              disabled={loading}
            >
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>GİRİŞ YAP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: '#D4AF37',
    justifyContent: 'center', alignItems: 'center',
  },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  appName: { color: '#D4AF37', fontSize: 20, marginTop: 10, fontWeight: 'bold' },
  card: { width: '100%', maxWidth: 350, backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 15 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16
  },
  loginButtonWrapper: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    zIndex: 999, // Diğer her şeyin önünde olmasını sağlar
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});