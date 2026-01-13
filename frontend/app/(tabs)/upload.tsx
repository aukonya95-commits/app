import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAPI } from '../../src/services/api';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = async () => {
    if (Platform.OS === 'web') {
      // Web: trigger file input click
      fileInputRef.current?.click();
    } else {
      // Mobile: use DocumentPicker
      try {
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
          await uploadFile(file);
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

      try {
        const response = await uploadAPI.uploadExcel(file);
        setResult(response);
      } catch (error: any) {
        console.error('Upload error:', error);
        setResult({
          success: false,
          message: error.response?.data?.detail || 'Yükleme sırasında bir hata oluştu',
        });
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const uploadFile = async (file: { uri: string; name: string; mimeType?: string }) => {
    setUploading(true);
    setResult(null);

    try {
      const response = await uploadAPI.uploadExcel({
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      });
      setResult(response);
    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Yükleme sırasında bir hata oluştu',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload" size={80} color="#D4AF37" />
        </View>

        <Text style={styles.title}>Excel Dosyası Yükle</Text>
        <Text style={styles.subtitle}>
          Bayi verilerini içeren Excel dosyasını (.xlsb veya .xlsx) yükleyin
        </Text>

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
              <Ionicons name="document" size={24} color="#0a0a0a" />
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

        {uploading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.progressText}>Dosya işleniyor, lütfen bekleyin...</Text>
            <Text style={styles.progressSubtext}>Bu işlem birkaç dakika sürebilir</Text>
          </View>
        )}

        {result && (
          <View
            style={[
              styles.resultContainer,
              result.success ? styles.successContainer : styles.errorContainer,
            ]}
          >
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
            Desteklenen formatlar: .xlsb, .xlsx, .xls{"\n"}
            Maksimum dosya boyutu: 50MB
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  fileName: {
    color: '#D4AF37',
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  progressText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  progressSubtext: {
    color: '#888',
    marginTop: 4,
    fontSize: 12,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  successContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  resultText: {
    flex: 1,
    fontSize: 14,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginTop: 32,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
