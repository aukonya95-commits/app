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
  StatusBar
} from 'react-native';
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
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.login(username, password);
      
      if (response && response.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Giriş Başarısız', response.message || 'Bilgiler hatalı.');
      }
    } catch (error) {
      console.error("Login hatası:", error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO ALANI */}
        <View style={styles.logoContainer}>
          <View style={styles.circle}>
            <LinearGradient
              colors={['#D4AF37', '#8A6E2F']}
              style={styles.circleGradient}
            >
              <Text style={styles.logoText}>S</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.brandContainer}>
            <Text style={styles.titleMain}>AYDIN ÜNLÜER</Text>
            <View style={styles.locationRow}>
              <View style={styles.line} />
              <Text style={styles.locationText}>KONYA</Text>
              <View style={styles.line} />
            </View>
            <Text style={styles.subtitle}>VERİ YÖNETİM SİSTEMİ</Text>
          </View>
        </View>

        {/* FORM ALANI */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#555"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={['#D4AF37', '#AA8439']} 
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradient}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Distribütör Paneli v2.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000', // Tam siyah arka plan
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 30 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 50 
  },
  circle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    padding: 3, // Dış halka efekti için
    backgroundColor: '#D4AF37',
    marginBottom: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  circleGradient: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { 
    color: '#000', 
    fontSize: 50, 
    fontWeight: '900',
  },
  brandContainer: {
    alignItems: 'center',
  },
  titleMain: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  line: {
    height: 1,
    width: 30,
    backgroundColor: '#D4AF37',
  },
  locationText: { 
    color: '#D4AF37', 
    fontSize: 16, 
    fontWeight: '600',
    marginHorizontal: 10,
    letterSpacing: 4,
  },
  subtitle: { 
    color: '#666', 
    fontSize: 12, 
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 15,
  },
  input: { 
    backgroundColor: '#111', 
    color: '#fff', 
    padding: 18, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#222',
    fontSize: 16,
  },
  button: { 
    height: 60, 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginTop: 10,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#000', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 1,
  },
  footerText: {
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  }
});