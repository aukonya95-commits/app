import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ÖNEMLİ: AuthContext içindeki fonksiyon isminin doğruluğunu buradan kontrol et
  const auth = useAuth();
  const signInFunc = auth.signIn || auth.login; 
  
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      console.log("Giriş denemesi başlatıldı...");
      
      if (!signInFunc) {
        throw new Error("Giriş fonksiyonu (signIn/login) bulunamadı!");
      }

      await signInFunc(username, password);
      console.log("Giriş başarılı!");
      router.replace('/(tabs)'); 
    } catch (error: any) {
      console.log("Login Detaylı Hata:", error);
      Alert.alert('Giriş Başarısız', error.message || 'Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>Aydın Ünlüer-Konya</Text>
      <Text style={styles.subtitle}>Distribütör Paneli</Text>
      
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

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>GİRİŞ YAP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 30 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#D4AF37', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#D4AF37', fontSize: 30, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 12 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});