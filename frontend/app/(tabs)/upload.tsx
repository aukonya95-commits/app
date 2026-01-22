import React, { useState } from 'react';
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
import api from '../../src/services/api';

type UploadType = 'ana' | 'fatura';
type UploadMethod = 'gdrive' | 'file';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadType, setUploadType] = useState<UploadType>('ana');
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('gdrive');
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

  // Manuel Dosya Yükleme
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      if (!file.name.endsWith('.xlsb') && !file.name.endsWith('.xlsx')) {
        showAlert('Hata', 'Lütfen .xlsb veya .xlsx dosyası seçin');
        return;
      }

      setUploading(true);
      setResult(null);
      setProgress(10);
      
      const typeLabel = uploadType === 'ana' ? 'Ana Veri' : 'Fatura Verileri';
      setStatusMessage(`${typeLabel} yükleniyor...`);

      const endpoint = uploadType === 'ana' ? '/upload' : '/upload-fatura-veri';
      
      try {
        setProgress(30);
        
        if (Platform.OS === 'web') {
          // Web için FormData
          const formData = new FormData();
          const response = await fetch(file.uri);
          const blob = await response.blob();
          formData.append('file', blob, file.name);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'POST',
            body: formData,
          });
          
          const data = await uploadResponse.json();
          setProgress(100);
          setResult(data);
        } else {
          // Mobile için FileSystem
          const uploadResult = await FileSystem.uploadAsync(
            `${API_BASE_URL}/api${endpoint}`,
            file.uri,
            {
              fieldName: 'file',
              httpMethod: 'POST',
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            }
          );
          
          setProgress(100);
          const data = JSON.parse(uploadResult.body);
          setResult(data);
        }
      } catch (uploadError: any) {
        console.error('File upload error:', uploadError);
        setResult({
          success: false,
          message: uploadError.message || 'Dosya yüklenirken hata oluştu',
        });
      }
    } catch (error: any) {
      console.error('Document picker error:', error);
      setResult({
        success: false,
        message: 'Dosya seçilirken hata oluştu',
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
          </View>

          {/* Upload Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, uploadType === 'ana' && styles.typeButtonActive]}
              onPress={() => setUploadType('ana')}
            >
              <Ionicons name="document-text" size={20} color={uploadType === 'ana' ? '#0a1628' : '#4CAF50'} />
              <Text style={[styles.typeButtonText, uploadType === 'ana' && styles.typeButtonTextActive]}>
                Ana Veri
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, uploadType === 'fatura' && styles.typeButtonActiveFatura]}
              onPress={() => setUploadType('fatura')}
            >
              <Ionicons name="receipt" size={20} color={uploadType === 'fatura' ? '#0a1628' : '#FF9800'} />
              <Text style={[styles.typeButtonText, uploadType === 'fatura' && styles.typeButtonTextActive]}>
                Fatura Verileri
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodButton, uploadMethod === 'gdrive' && styles.methodButtonActive]}
              onPress={() => setUploadMethod('gdrive')}
            >
              <Ionicons name="logo-google" size={18} color={uploadMethod === 'gdrive' ? '#D4AF37' : '#5a7a9a'} />
              <Text style={[styles.methodButtonText, uploadMethod === 'gdrive' && styles.methodButtonTextActive]}>
                Google Drive
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.methodButton, uploadMethod === 'file' && styles.methodButtonActive]}
              onPress={() => setUploadMethod('file')}
            >
              <Ionicons name="folder-open" size={18} color={uploadMethod === 'file' ? '#D4AF37' : '#5a7a9a'} />
              <Text style={[styles.methodButtonText, uploadMethod === 'file' && styles.methodButtonTextActive]}>
                Dosya Seç
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { borderColor: uploadInfo.color }]}>
            <View style={styles.infoHeader}>
              <Ionicons name={uploadInfo.icon as any} size={24} color={uploadInfo.color} />
              <Text style={[styles.infoTitle, { color: uploadInfo.color }]}>{uploadInfo.title}</Text>
            </View>
            <Text style={styles.infoDescription}>{uploadInfo.description}</Text>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            {uploadMethod === 'gdrive' ? (
              <>
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
                      <Text style={styles.uploadButtonText}>Drive'dan Yükle</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="folder-open" size={24} color="#D4AF37" />
                  <Text style={styles.sectionTitle}>Dosya Seç</Text>
                </View>
                
                <Text style={styles.fileHint}>Desteklenen formatlar: .xlsb, .xlsx</Text>
                
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: uploadInfo.color }, uploading && styles.uploadButtonDisabled]}
                  onPress={handleFileUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <View style={styles.uploadingContainer}>
                      <ActivityIndicator color="#0a1628" size="small" />
                      <Text style={styles.uploadButtonText}>{statusMessage || 'Yükleniyor...'}</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="document-attach" size={24} color="#0a1628" />
                      <Text style={styles.uploadButtonText}>Dosya Seç ve Yükle</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

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
                size={28}
                color={result.success ? '#4CAF50' : '#f44336'}
              />
              <Text style={styles.resultText}>{result.message}</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Kullanım</Text>
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={18} color="#FF9800" />
              <Text style={styles.warningText}>
                Önce "Ana Veri" dosyasını, sonra "Fatura Verileri" dosyasını yükleyin.
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0d2040',
    borderWidth: 1,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#8aa8c8',
  },
  typeButtonTextActive: {
    color: '#0a1628',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0d2040',
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  methodButtonActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  methodButtonText: {
    fontSize: 12,
    color: '#5a7a9a',
  },
  methodButtonTextActive: {
    color: '#D4AF37',
  },
  infoCard: {
    backgroundColor: '#0d2040',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoDescription: {
    fontSize: 12,
    color: '#8aa8c8',
    lineHeight: 16,
  },
  uploadSection: {
    backgroundColor: '#0d2040',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  linkInput: {
    backgroundColor: '#0a1628',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#1a3a6a',
    marginBottom: 12,
  },
  fileHint: {
    color: '#5a7a9a',
    fontSize: 12,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0a1628',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a3a6a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#8aa8c8',
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
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
    fontSize: 13,
  },
  instructionsCard: {
    backgroundColor: '#0d2040',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 10,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    color: '#FF9800',
    fontSize: 11,
    lineHeight: 16,
  },
});
