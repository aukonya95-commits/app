import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const signInFunc = auth?.signIn || auth?.login; 
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre giriniz.');
      return;
    }
    setLoading(true);
    try {
      await signInFunc(username.trim(), password.trim());
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Giriş Başarısız', 'Bilgiler hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 30 }}>
          
          {/* Orijinal Altın Sarısı Logo */}
          <View style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#D4AF37', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
            <Text style={{ color: '#D4AF37', fontSize: 40, fontWeight: 'bold' }}>S</Text>
          </View>
          
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Aydın Ünlüer-Konya</Text>
          <Text style={{ color: '#888', textAlign: 'center', marginBottom: 40, fontSize: 14 }}>Distribütör Paneli</Text>
          
          <View style={{ width: '100%' }}>
            <TextInput
              style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' }}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#333' }}
              placeholder="Şifre"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* GOLD GRADIENT BUTON - Kırmızı Butonun Kesin Çözümü */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} style={{ height: 60, borderRadius: 12, overflow: 'hidden' }}>
              <LinearGradient colors={['#D4AF37', '#AA8439']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>GİRİŞ YAP</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}