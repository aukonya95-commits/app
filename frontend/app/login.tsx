import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar,
  Animated,
  Easing,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext'; 
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Animated SVG için wrapper
const AnimatedView = Animated.createAnimatedComponent(View);

const REMEMBER_ME_KEY = '@remember_me';
const SAVED_CREDENTIALS_KEY = '@saved_credentials';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const auth = useAuth(); 
  const router = useRouter();
  
  // Nabız animasyonu
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Kaydedilmiş bilgileri yükle
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (savedRememberMe === 'true') {
          setRememberMe(true);
          const savedCredentials = await AsyncStorage.getItem(SAVED_CREDENTIALS_KEY);
          if (savedCredentials) {
            const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
            setUsername(savedUsername || '');
            setPassword(savedPassword || '');
          }
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadSavedCredentials();
  }, []);
  
  useEffect(() => {
    // Nabız animasyonu
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => {
      pulse.stop();
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.login(username, password);
      
      if (response && response.success) {
        // Beni hatırla seçeneğine göre kaydet
        if (rememberMe) {
          await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
          await AsyncStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ username, password }));
        } else {
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
          await AsyncStorage.removeItem(SAVED_CREDENTIALS_KEY);
        }
        
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

  const handleRememberMeChange = async (value: boolean) => {
    setRememberMe(value);
    if (!value) {
      // Beni hatırla kapatıldığında kayıtlı bilgileri sil
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      await AsyncStorage.removeItem(SAVED_CREDENTIALS_KEY);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient 
          colors={['#0a1628', '#0d1f3c', '#0a1628']} 
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient 
        colors={['#0a1628', '#0d1f3c', '#0a1628']} 
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO ALANI */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.eagleContainer, { transform: [{ scale: pulseAnimation }] }]}>
            {/* K Harfi Logo */}
            <Text style={styles.logoText}>K</Text>
          </Animated.View>
          
          <View style={styles.brandContainer}>
            <Text style={styles.titleMain}>AYDIN ÜNLÜER</Text>
            <View style={styles.locationRow}>
              <View style={styles.line} />
              <Text style={styles.locationText}>KONYA</Text>
              <View style={styles.line} />
            </View>
            <Text style={styles.subtitle}>VERİ YÖNETİM SİSTEMİ</Text>
            <Text style={styles.developerName}>Semih Ateş</Text>
          </View>
        </View>

        {/* FORM ALANI */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="person-outline" size={20} color="#4a6fa5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#4a6fa5"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#4a6fa5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#4a6fa5"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Beni Hatırla */}
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={() => handleRememberMeChange(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="#0a1628" />}
            </View>
            <Text style={styles.rememberMeText}>Beni Hatırla</Text>
          </TouchableOpacity>

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
    backgroundColor: '#0a1628',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  eagleContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0d2847',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a4a8f',
    shadowColor: '#1a4a8f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#5a7a9a', 
    fontSize: 12, 
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  developerName: {
    color: '#D4AF37',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2040',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: { 
    flex: 1,
    color: '#fff', 
    padding: 18, 
    paddingLeft: 8,
    fontSize: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#D4AF37',
  },
  rememberMeText: {
    color: '#8aa8c8',
    fontSize: 14,
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
    color: '#2a4a6a',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  }
});
