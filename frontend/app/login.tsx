import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext'; 
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // AuthContext'teki orijinal login
  const router = useRouter();

  const handleLogin = async () => {
    // 1. ADIM: Boşluk kontrolü
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre boş bırakılamaz.');
      return;
    }

    setLoading(true);
    try {
      // 2. ADIM: Senin sistemindeki login fonksiyonuna veriyi gönderiyoruz
      const result = await login(username.trim(), password.trim());
      
      console.log("Login Sonucu:", result); // Terminalden kontrol et

      // 3. ADIM: Başarı kontrolü
      if (result && result.success) {
        router.replace('/(tabs)');
      } else {
        // Sunucudan gelen hata mesajını göster
        Alert.alert('Giriş Başarısız', result?.message || 'Kullanıcı adı veya şifre yanlış.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Hata', 'Sunucu bağlantısı sağlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}><Text style={styles.logoText}>S</Text></View>
        <Text style={styles.brandTitle}>Aydın Ünlüer-Konya</Text>
        <Text style={styles.subTitle}>Distribütör Paneli</Text>
      </View>

      <TextInput 
        style={styles.input} 
        placeholder="Kullanıcı Adı" 
        placeholderTextColor="#666"
        value={username}
        onChangeText={(val) => setUsername(val)} // Veriyi doğrudan state'e yazıyoruz
        autoCapitalize="none"
      />

      <TextInput 
        style={styles.input} 
        placeholder="Şifre" 
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={(val) => setPassword(val)}
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.btn}>
        <LinearGradient colors={['#D4AF37', '#AA8439']} style={styles.gradient}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>GİRİŞ YAP</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 30 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  brandTitle: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: '#888', fontSize: 14, marginTop: 5 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  btn: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});