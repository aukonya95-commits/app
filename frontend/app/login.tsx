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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // AuthContext'ten gelen signIn fonksiyonunu kullanıyoruz
  const { signIn } = useAuth(); 
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Uyarı', 'Lütfen kullanıcı adı ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      // AuthContext üzerinden giriş denemesi
      await signIn(username.trim(), password.trim());
      
      // Başarılı giriş sonrası ana sayfaya yönlendir
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Giriş Hatası:", error);
      Alert.alert('Giriş Başarısız', 'Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.title}>Aydın Ünlüer-Konya</Text>
            <Text style={styles.subtitle}>Distribütör Paneli</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="admin"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a' 
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  logoText: {
    color: '#D4AF37',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: { 
    color: '#D4AF37', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#D4AF37',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: { 
    backgroundColor: '#1a1a1a', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  button: { 
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 55,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { 
    color: '#000', 
    fontWeight: '800', 
    fontSize: 16,
    letterSpacing: 1
  }
});