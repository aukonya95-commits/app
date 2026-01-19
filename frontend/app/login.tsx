import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext'; // Senin orijinal context'in
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // BURASI KRİTİK: signIn değil, senin kodundaki gibi 'login' kullanıyoruz
  const { login } = useAuth(); 
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      // Senin AuthContext'indeki orijinal login fonksiyonunu tetikliyoruz
      const result = await login(username, password);
      
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', result.message || 'Giriş başarısız.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', 'Sistemsel bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Aydın Ünlüer-Konya</Text>
          <Text style={styles.subtitle}>Distribütör Paneli</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable 
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.buttonWrapper,
            { opacity: pressed || loading ? 0.8 : 1 }
          ]}
        >
          <LinearGradient colors={['#D4AF37', '#AA8439']} style={styles.gradient}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>GİRİŞ YAP</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' },
  innerContainer: { paddingHorizontal: 30, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 5 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  buttonWrapper: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});