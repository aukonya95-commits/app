import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../../src/services/api';

export default function AyarlarScreen() {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Tüm alanları doldurun');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalı');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/change-password?username=${user?.username}`, {
        old_password: oldPassword,
        new_password: newPassword
      });
      
      if (response.data.success) {
        Alert.alert('Başarılı', 'Şifreniz değiştirildi');
        setShowChangePassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Hata', response.data.message);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'dsm': return 'DSM';
      case 'tte': return 'TTE';
      case 'dst': return 'DST';
      default: return role || '-';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="settings" size={28} color="#D4AF37" />
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userIconContainer}>
            <Ionicons name="person-circle" size={60} color="#D4AF37" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleName(user?.role)}</Text>
          </View>
          <Text style={styles.userUsername}>@{user?.username}</Text>
        </View>

        {/* Change Password Section */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowChangePassword(!showChangePassword)}
        >
          <Ionicons name="key" size={22} color="#D4AF37" />
          <Text style={styles.menuText}>Şifre Değiştir</Text>
          <Ionicons 
            name={showChangePassword ? 'chevron-up' : 'chevron-down'} 
            size={22} 
            color="#888" 
          />
        </TouchableOpacity>

        {showChangePassword && (
          <View style={styles.changePasswordForm}>
            <TextInput
              style={styles.input}
              placeholder="Mevcut Şifre"
              placeholderTextColor="#666"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifre"
              placeholderTextColor="#666"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifre (Tekrar)"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text style={styles.saveButtonText}>Şifreyi Değiştir</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanıcı Adı</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{getRoleName(user?.role)}</Text>
          </View>
          {user?.dst_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DST</Text>
              <Text style={styles.infoValue}>{user.dst_name}</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color="#FF5722" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Aydın Ünlüer Konya Distribütör</Text>
          <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 12,
  },
  userCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  userIconContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  userUsername: {
    fontSize: 14,
    color: '#888',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  changePasswordForm: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#666',
  },
  appVersion: {
    fontSize: 10,
    color: '#444',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
