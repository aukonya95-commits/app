import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    // TEST: Eğer bu uyarıyı görüyorsan buton çalışıyor demektir.
    console.log("Buton Tetiklendi");
    
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      // AuthContext içindeki signIn fonksiyonunu çağırıyoruz
      await signIn(username, password);
      // Başarılıysa yönlendir
      router.replace('/(tabs)');
    } catch (error) {
      console.log("Login Hatası:", error);
      Alert.alert('Hata', 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aydın Ünlüer Konya</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#999"
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
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});