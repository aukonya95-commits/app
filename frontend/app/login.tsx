import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
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
    console.log("Giriş işlemi başlatıldı..."); // Terminalde basıldığını gör
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen bilgileri doldurun.');
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Hata', 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {/* Yazıları buraya sabitledik */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.brandName}>Aydın Ünlüer-Konya</Text>
          <Text style={styles.panelText}>Distribütör Paneli</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Buton Tıklama Sorunu İçin Pressable ve zIndex Kullanıldı */}
        <Pressable 
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.buttonBox,
            { opacity: pressed || loading ? 0.8 : 1 }
          ]}
        >
          <LinearGradient 
            colors={['#D4AF37', '#AA8439']} 
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>GİRİŞ YAP</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' },
  formContainer: { paddingHorizontal: 30, zIndex: 100 }, // Katman en üste alındı
  header: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoText: { color: '#D4AF37', fontSize: 35, fontWeight: 'bold' },
  brandName: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  panelText: { color: '#777', fontSize: 14, marginTop: 4 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  buttonBox: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10, cursor: 'pointer' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});