import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const loginFunc = auth?.signIn || auth?.login; // Context'teki fonksiyonu güvenli al
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (loginFunc) {
        await loginFunc(username.trim(), password.trim());
        router.replace('/(tabs)');
      } else {
        // Eğer auth sistemi henüz hazır değilse manuel geçiş (Hata vermemesi için)
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#D4AF37', '#AA8439']} style={styles.gradient}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>GİRİŞ YAP</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#D4AF37', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});