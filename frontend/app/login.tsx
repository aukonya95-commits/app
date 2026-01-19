import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert('Hata', 'Bilgileri giriniz.'); return; }
    setLoading(true);
    try {
      await signIn(username, password);
      router.replace('/(tabs)');
    } catch (e) { Alert.alert('Hata', 'Giriş başarısız.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>Aydın Ünlüer-Konya</Text>
      
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

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.buttonContainer}>
        <LinearGradient colors={['#D4AF37', '#AA8439']} style={styles.gradient}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>GİRİŞ YAP</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 30 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#D4AF37', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#D4AF37', fontSize: 36, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  buttonContainer: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});