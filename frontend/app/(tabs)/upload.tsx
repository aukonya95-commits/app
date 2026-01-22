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

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://konya-district-map.preview.emergentagent.com';
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'gdrive'>('file');
  const [gdriveLink, setGdriveLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    setStatusMessage('Google Drive\'dan indiriliyor...');

    try {
      setProgress(30);
      const response = await api.post('/upload-gdrive', { link: gdriveLink });
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

  const handleFilePick = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      try {
        setResult(null);
        setProgress(0);
        setRetryCount(0);
        setStatusMessage('');
        
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            '*/*',
          ],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          setSelectedFile(file.name);
          await uploadFileMobileWithRetry(file);
        }
      } catch (error) {
        console.error('File pick error:', error);
        setResult({ success: false, message: 'Dosya seçilirken bir hata oluştu' });
      }
    }
  };

  const handleWebFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file.name);
      setUploading(true);
      setResult(null);
      setProgress(0);
      setStatusMessage('Dosya yükleniyor...');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000,
          onUploadProgress: (progressEvent) => {
            const percent = progressEvent.total 
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setProgress(percent);
          },
        });
        
        setResult(response.data);
      } catch (error: any) {
        console.error('Upload error:', error);
        setResult({
          success: false,
          message: error.response?.data?.detail || 'Yükleme sırasında bir hata oluştu',
        });
      } finally {
        setUploading(false);
        setStatusMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const uploadFileMobileWithRetry = async (
    file: { uri: string; name: string; mimeType?: string },
    attempt: number = 1
  ): Promise<void> => {
    setUploading(true);
    setResult(null);
    setRetryCount(attempt - 1);

    try {
      setStatusMessage('Dosya hazırlanıyor...');
      setProgress(5);
      
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      
      if (!fileInfo.exists) {
        throw new Error('Dosya bulunamadı');
      }

      const fileSizeMB = (fileInfo.size || 0) / (1024 * 1024);
      
      if (fileSizeMB > 50) {
        throw new Error('Dosya boyutu 50MB\'dan büyük olamaz');
      }

      setProgress(10);
      setStatusMessage(`Yükleniyor... (Deneme ${attempt}/${MAX_RETRIES})`);

      const uploadResult = await FileSystem.uploadAsync(
        `${API_URL}/api/upload`,
        file.uri,
        {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: { 'Accept': 'application/json' },
          parameters: { filename: file.name },
        }
      );

      setProgress(80);
      setStatusMessage('Veriler işleniyor...');

      if (uploadResult.status === 200) {
        setProgress(100);
        const response = JSON.parse(uploadResult.body);
        setResult(response);
        setStatusMessage('');
        setUploading(false);
      } else if (uploadResult.status >= 500) {
        throw new Error(`Sunucu hatası (${uploadResult.status})`);
      } else {
        let errorMsg = 'Yükleme başarısız oldu';
        try {
          const errorResponse = JSON.parse(uploadResult.body);
          errorMsg = errorResponse.detail || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      const isRetryableError = 
        error.message?.includes('502') ||
        error.message?.includes('503') ||
        error.message?.includes('504') ||
        error.message?.includes('Sunucu') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network') ||
        error.message?.includes('Timeout');
      
      if (attempt < MAX_RETRIES && (isRetryableError || attempt < 3)) {
        setStatusMessage(`Hata: ${error.message || 'Bilinmeyen'}. ${RETRY_DELAY/1000}sn içinde tekrar... (${attempt}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY);
        return uploadFileMobileWithRetry(file, attempt + 1);
      }
      
      setResult({
        success: false,
        message: `${error.message || 'Yükleme başarısız'}. Lütfen Google Drive yöntemini deneyin.`,
      });
      setStatusMessage('');
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-upload" size={60} color="#D4AF37" />
          </View>

          <Text style={styles.title}>Excel Dosyası Yükle</Text>

          {/* Method Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity 
              style={[styles.methodButton, uploadMethod === 'file' && styles.methodButtonActive]}
              onPress={() => setUploadMethod('file')}
            >
              <Ionicons name="document" size={20} color={uploadMethod === 'file' ? '#0a0a0a' : '#D4AF37'} />
              <Text style={[styles.methodText, uploadMethod === 'file' && styles.methodTextActive]}>Dosya Seç</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.methodButton, uploadMethod === 'gdrive' && styles.methodButtonActive]}
              onPress={() => setUploadMethod('gdrive')}
            >
              <Ionicons name="logo-google" size={20} color={uploadMethod === 'gdrive' ? '#0a0a0a' : '#D4AF37'} />
              <Text style={[styles.methodText, uploadMethod === 'gdrive' && styles.methodTextActive]}>Google Drive</Text>
            </TouchableOpacity>
          </View>

          {uploadMethod === 'file' ? (
            <>
              {Platform.OS === 'web' && (
                <input
                  ref={fileInputRef as any}
                  type="file"
                  accept=".xlsb,.xlsx,.xls"
                  onChange={handleWebFileChange as any}
                  style={{ display: 'none' }}
                />
              )}

              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleFilePick}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <>
                    <Ionicons name="folder-open" size={24} color="#0a0a0a" />
                    <Text style={styles.uploadButtonText}>Dosya Seç ve Yükle</Text>
                  </>
                )}
              </TouchableOpacity>

              {selectedFile && (
                <View style={styles.fileInfo}>
                  <Ionicons name="document-text" size={20} color="#D4AF37" />
                  <Text style={styles.fileName}>{selectedFile}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.gdriveContainer}>
              <Text style={styles.gdriveHint}>
                1. Excel dosyasını Google Drive'a yükleyin{'\n'}
                2. Sağ tık → "Paylaş" → "Bağlantıyı bilen herkes"{'\n'}
                3. Linki kopyalayıp aşağıya yapıştırın
              </Text>
              
              <TextInput
                style={styles.linkInput}
                placeholder="Google Drive linkini yapıştırın..."
                placeholderTextColor="#666"
                value={gdriveLink}
                onChangeText={setGdriveLink}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.uploadButton, (uploading || !gdriveLink.trim()) && styles.uploadButtonDisabled]}
                onPress={handleGDriveUpload}
                disabled={uploading || !gdriveLink.trim()}
              >
                {uploading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <>
                    <Ionicons name="cloud-download" size={24} color="#0a0a0a" />
                    <Text style={styles.uploadButtonText}>Drive'dan Yükle</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {uploading && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.progressText}>{statusMessage || 'İşleniyor...'}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>%{progress}</Text>
            </View>
          )}

          {result && (
            <View style={[styles.resultContainer, result.success ? styles.successContainer : styles.errorContainer]}>
              <Ionicons
                name={result.success ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={result.success ? '#4CAF50' : '#f44336'}
              />
              <Text style={[styles.resultText, result.success ? styles.successText : styles.errorText]}>
                {result.message}
              </Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              Desteklenen formatlar: .xlsb, .xlsx{'\n'}
              Maksimum dosya boyutu: 50MB{'\n'}
              💡 Sorun yaşarsanız Google Drive yöntemini deneyin
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 24, alignItems: 'center' },
  iconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, marginTop: 20,
    borderWidth: 2, borderColor: '#D4AF37', borderStyle: 'dashed',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  methodToggle: {
    flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 4, marginBottom: 24, width: '100%',
  },
  methodButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, gap: 8,
  },
  methodButtonActive: { backgroundColor: '#D4AF37' },
  methodText: { fontSize: 14, fontWeight: '600', color: '#D4AF37' },
  methodTextActive: { color: '#0a0a0a' },
  uploadButton: {
    flexDirection: 'row', backgroundColor: '#D4AF37', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', gap: 12,
    width: '100%', justifyContent: 'center',
  },
  uploadButtonDisabled: { opacity: 0.6 },
  uploadButtonText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  fileName: { color: '#D4AF37', fontSize: 14 },
  gdriveContainer: { width: '100%' },
  gdriveHint: {
    color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 16,
    backgroundColor: '#1a1a2e', padding: 12, borderRadius: 8,
  },
  linkInput: {
    backgroundColor: '#1a1a2e', color: '#fff', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#333', fontSize: 14, marginBottom: 16,
  },
  progressContainer: { alignItems: 'center', marginTop: 24, width: '100%' },
  progressText: { color: '#fff', marginTop: 12, fontSize: 14, textAlign: 'center' },
  progressBarContainer: {
    width: '100%', height: 8, backgroundColor: '#333', borderRadius: 4, marginTop: 16, overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#D4AF37', borderRadius: 4 },
  progressPercent: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  resultContainer: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12,
    marginTop: 24, gap: 12, width: '100%',
  },
  successContainer: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 1, borderColor: '#4CAF50' },
  errorContainer: { backgroundColor: 'rgba(244, 67, 54, 0.1)', borderWidth: 1, borderColor: '#f44336' },
  resultText: { flex: 1, fontSize: 14 },
  successText: { color: '#4CAF50' },
  errorText: { color: '#f44336' },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 8,
    padding: 12, marginTop: 24, gap: 8, alignItems: 'flex-start', width: '100%',
  },
  infoText: { color: '#888', fontSize: 12, flex: 1, lineHeight: 18 },
});
