import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView 
} from 'react-native';
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
      Alert.alert('Hata', 'Kullanıcı adı veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          <View style={styles.inner}>
            
            {/* Orijinal Altın Sarısı Logo */}
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            
            <Text style={styles.title}>Aydın Ünlüer-Konya</Text>
            <Text style={styles.subtitle}>Distribütör Paneli</Text>
            
            <View style={styles.form}>
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

              {/* Kırmızı butonu yok eden Gold Gradient Buton */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={loading}
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
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  inner: { padding: 30, alignItems: 'center' },
  logoCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    borderWidth: 2, 
    borderColor: '#D4AF37', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)'
  },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 40, fontSize: 14, marginTop: 5 },
  form: { width: '100%' },
  input: { 
    backgroundColor: '#1a1a1a', 
    color: '#fff', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#333',
    fontSize: 16
  },
  button: { height: 60, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }
});