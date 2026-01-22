import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';
import api from '../../src/services/api';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sales-tracker-519.preview.emergentagent.com';
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

type UploadType = 'ana' | 'fatura';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadType, setUploadType] = useState<UploadType>('ana');
  const [gdriveLink, setGdriveLink] = useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Google Drive Link ile Upload
  const handleGDriveUpload = async () => {
    if (!gdriveLink.trim()) {
      showAlert('Hata', 'Lütfen Google Drive linkini girin');
      return;
    }

    if (!gdriveLink.includes('drive.google.com')) {
      showAlert('Hata', 'Geçersiz Google Drive linki');
      return;
    }

    setUploading(true);
    setResult(null);
    setProgress(10);
    
    const endpoint = uploadType === 'ana' ? '/upload-gdrive' : '/upload-fatura-gdrive';
    const typeLabel = uploadType === 'ana' ? 'Ana Veri' : 'Fatura Verileri';
    setStatusMessage(`${typeLabel} indiriliyor...`);

    try {
      setProgress(30);
      const response = await api.post(endpoint, { link: gdriveLink });
      setProgress(100);
      setResult(response.data);
      setGdriveLink('');
    } catch (error: any) {
      console.error('GDrive upload error:', error);
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Google Drive\'dan yükleme başarısız',
      });
    } finally {
      setUploading(false);
      setStatusMessage('');
    }
  };

  const getUploadTypeInfo = () => {
    if (uploadType === 'ana') {
      return {
        title: 'Ana Veri Yükleme',
        description: 'Bayi bilgileri, DST/TTE verileri, RUT planları, hedefler vb.',
        icon: 'document-text',
        color: '#4CAF50',
      };
    } else {
      return {
        title: 'Fatura Verileri Yükleme',
        description: 'Faturalar, tahsilatlar, belge detayları',
        icon: 'receipt',
        color: '#FF9800',
      };
    }
  };

  const uploadInfo = getUploadTypeInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a1628', '#0d1f3c', '#0a1628']} style={StyleSheet.absoluteFillObject} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="cloud-upload" size={40} color="#D4AF37" />
            <Text style={styles.title}>Excel Veri Yükleme</Text>
            <Text style={styles.subtitle}>Google Drive linki ile yükleyin</Text>
          </View>

          {/* Upload Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, uploadType === 'ana' && styles.typeButtonActive]}
              onPress={() => setUploadType('ana')}
            >
              <Ionicons name="document-text" size={24} color={uploadType === 'ana' ? '#0a1628' : '#4CAF50'} />
              <Text style={[styles.typeButtonText, uploadType === 'ana' && styles.typeButtonTextActive]}>
                Ana Veri
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, uploadType === 'fatura' && styles.typeButtonActiveFatura]}
              onPress={() => setUploadType('fatura')}
            >
              <Ionicons name="receipt" size={24} color={uploadType === 'fatura' ? '#0a1628' : '#FF9800'} />
              <Text style={[styles.typeButtonText, uploadType === 'fatura' && styles.typeButtonTextActive]}>
                Fatura Verileri
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { borderColor: uploadInfo.color }]}>
            <View style={styles.infoHeader}>
              <Ionicons name={uploadInfo.icon as any} size={28} color={uploadInfo.color} />
              <Text style={[styles.infoTitle, { color: uploadInfo.color }]}>{uploadInfo.title}</Text>
            </View>
            <Text style={styles.infoDescription}>{uploadInfo.description}</Text>
          </View>

          {/* Google Drive Upload */}
          <View style={styles.uploadSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="logo-google" size={24} color="#D4AF37" />
              <Text style={styles.sectionTitle}>Google Drive Link</Text>
            </View>
            
            <TextInput
              style={styles.linkInput}
              placeholder="https://drive.google.com/file/d/..."
              placeholderTextColor="#4a6fa5"
              value={gdriveLink}
              onChangeText={setGdriveLink}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!uploading}
            />
            
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: uploadInfo.color }, uploading && styles.uploadButtonDisabled]}
              onPress={handleGDriveUpload}
              disabled={uploading}
            >
              {uploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color="#0a1628" size="small" />
                  <Text style={styles.uploadButtonText}>{statusMessage || 'Yükleniyor...'}</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={24} color="#0a1628" />
                  <Text style={styles.uploadButtonText}>
                    {uploadType === 'ana' ? 'Ana Veriyi Yükle' : 'Fatura Verilerini Yükle'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Progress */}
            {uploading && progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: uploadInfo.color }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
          </View>

          {/* Result */}
          {result && (
            <View style={[styles.resultCard, result.success ? styles.resultSuccess : styles.resultError]}>
              <Ionicons
                name={result.success ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={result.success ? '#4CAF50' : '#f44336'}
              />
              <Text style={styles.resultText}>{result.message}</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Kullanım Talimatları</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Excel dosyasını Google Drive'a yükleyin</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Dosyaya sağ tıklayıp "Paylaş" seçin</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>"Bağlantıyı bilen herkes" seçeneğini açın</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>Linki kopyalayıp yukarıya yapıştırın</Text>
            </View>
            
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                Ana Veri ve Fatura Verileri için ayrı dosyalar kullanın. Önce Ana Veriyi, sonra Fatura Verilerini yükleyin.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a9a',
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0d2040',
    borderWidth: 2,
    borderColor: '#1a3a6a',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonActiveFatura: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8aa8c8',
  },
  typeButtonTextActive: {
    color: '#0a1628',
  },
  infoCard: {
    backgroundColor: '#0d2040',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoDescription: {
    fontSize: 13,
    color: '#8aa8c8',
    lineHeight: 18,
  },
  uploadSection: {
    backgroundColor: '#0d2040',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
  },
  linkInput: {
    backgroundColor: '#0a1628',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1a3a6a',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1628',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1a3a6a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#8aa8c8',
    fontSize: 14,
    fontWeight: '600',
    width: 45,
    textAlign: 'right',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultError: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  resultText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  instructionsCard: {
    backgroundColor: '#0d2040',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a3a6a',
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    color: '#8aa8c8',
    fontSize: 13,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    color: '#FF9800',
    fontSize: 12,
    lineHeight: 18,
  },
});
