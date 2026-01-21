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
  Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext'; 
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Defs, ClipPath, Rect } from 'react-native-svg';

// Animated SVG için wrapper
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth(); 
  const router = useRouter();
  
  // Kanat animasyonu
  const wingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Kanat çırpma animasyonu
    const wingFlap = Animated.loop(
      Animated.sequence([
        Animated.timing(wingAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wingAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
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
    
    wingFlap.start();
    pulse.start();
    
    return () => {
      wingFlap.stop();
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
  
  // Kanat rotasyonu
  const leftWingRotate = wingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });
  
  const rightWingRotate = wingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

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
          <Animated.View style={[styles.eagleContainer, { transform: [{ scale: pulseAnimation }] }]}>
            {/* Lacivert-Beyaz Zarif Kartal Logo */}
            <Svg width={90} height={90} viewBox="0 0 100 100">
              {/* Arka plan daire */}
              <Circle cx="50" cy="50" r="48" fill="#0d1b4c" stroke="#1a3a8f" strokeWidth="2" />
              
              {/* Kartal gövdesi - merkez */}
              <Path
                d="M50 30 
                   C45 35, 42 45, 44 55
                   C45 65, 48 75, 50 80
                   C52 75, 55 65, 56 55
                   C58 45, 55 35, 50 30Z"
                fill="#fff"
              />
              
              {/* Kartal başı */}
              <Circle cx="50" cy="28" r="10" fill="#fff" />
              
              {/* Gaga */}
              <Path
                d="M50 32 L46 40 L50 37 L54 40 Z"
                fill="#D4AF37"
              />
              
              {/* Sol göz */}
              <Circle cx="46" cy="26" r="2" fill="#0d1b4c" />
              <Circle cx="46.5" cy="25.5" r="0.5" fill="#fff" />
              
              {/* Sağ göz */}
              <Circle cx="54" cy="26" r="2" fill="#0d1b4c" />
              <Circle cx="54.5" cy="25.5" r="0.5" fill="#fff" />
              
              {/* Sol kanat - Ana */}
              <Path
                d="M44 40
                   C35 35, 20 30, 8 25
                   C12 32, 18 40, 25 45
                   C18 45, 10 48, 5 52
                   C15 52, 28 52, 38 50
                   C35 55, 30 60, 28 65
                   C38 60, 42 52, 44 48Z"
                fill="#fff"
              />
              
              {/* Sağ kanat - Ana */}
              <Path
                d="M56 40
                   C65 35, 80 30, 92 25
                   C88 32, 82 40, 75 45
                   C82 45, 90 48, 95 52
                   C85 52, 72 52, 62 50
                   C65 55, 70 60, 72 65
                   C62 60, 58 52, 56 48Z"
                fill="#fff"
              />
              
              {/* Sol kanat detayları */}
              <Path d="M40 42 L20 32" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              <Path d="M38 45 L15 40" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              <Path d="M36 48 L12 48" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              
              {/* Sağ kanat detayları */}
              <Path d="M60 42 L80 32" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              <Path d="M62 45 L85 40" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              <Path d="M64 48 L88 48" stroke="#0d1b4c" strokeWidth="1" opacity="0.3" />
              
              {/* Kuyruk tüyleri */}
              <Path
                d="M46 75 L42 90 L50 82 L58 90 L54 75"
                fill="#fff"
              />
              
              {/* Pençeler */}
              <Path d="M46 78 L40 85 M46 78 L44 86 M46 78 L48 85" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <Path d="M54 78 L60 85 M54 78 L56 86 M54 78 L52 85" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            </Svg>
          </Animated.View>
          
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
    backgroundColor: '#000',
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
    backgroundColor: '#0d1b4c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a3a8f',
    shadowColor: '#1a3a8f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 20,
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
