import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { router, Stack } from 'expo-router';
import api from '../src/services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface RutTalep {
  _id: string;
  dst_name: string;
  gun: string;
  tarih: string;
  durum: string;
  yeni_sira: Array<{
    ziyaret_sira: number;
    musteri_kod: string;
    musteri_unvan: string;
    musteri_durum: string;
    musteri_grup: string;
  }>;
}

export default function RutTaleplerScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [talepler, setTalepler] = useState<RutTalep[]>([]);
  const [expandedTalep, setExpandedTalep] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const loadTalepler = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/rut/talepler');
      setTalepler(response.data || []);
    } catch (error) {
      console.error('Error loading talepler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTalepler();
  }, [loadTalepler]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTalepler();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'onaylandi': return '#28a745';
      case 'reddedildi': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'onaylandi': return 'Onaylandı';
      case 'reddedildi': return 'Reddedildi';
      default: return 'Beklemede';
    }
  };

  const updateTalepDurum = async (talepId: string, durum: string) => {
    const durumText = durum === 'onaylandi' ? 'onaylamak' : 'reddetmek';
    
    Alert.alert(
      'Talep Durumu',
      `Bu talebi ${durumText} istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              const response = await api.put(`/rut/talep/${talepId}?durum=${durum}`);
              if (response.data?.success) {
                Alert.alert('Başarılı', 'Talep durumu güncellendi');
                loadTalepler();
              } else {
                Alert.alert('Hata', response.data?.message || 'Güncelleme başarısız');
              }
            } catch (error) {
              console.error('Error updating talep:', error);
              Alert.alert('Hata', 'Talep güncellenirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const downloadExcel = async (talepId: string, dstName: string, gun: string) => {
    console.log('=== DOWNLOAD EXCEL STARTED ===');
    console.log('Talep ID:', talepId);
    console.log('DST Name:', dstName);
    console.log('Gun:', gun);
    console.log('Platform:', Platform.OS);
    
    try {
      const downloadUrl = `https://dstroute-system.preview.emergentagent.com/api/rut/talep/${talepId}/excel`;
      
      // Türkçe karakterleri düzelt
      const safeDstName = dstName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeGun = gun.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `RUT_${safeDstName}_${safeGun}.csv`;
      
      console.log('Download URL:', downloadUrl);
      console.log('Filename:', filename);
      
      if (Platform.OS === 'web') {
        console.log('WEB: Starting download...');
        // Web'de fetch ile indir
        try {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('WEB: Download completed');
        } catch (webError) {
          console.error('WEB download error:', webError);
          // Fallback: yeni sekmede aç
          window.open(downloadUrl, '_blank');
        }
      } else {
        console.log('MOBILE: Starting download...');
        // Mobil'de dosyayı indir ve paylaş
        try {
          const fileUri = FileSystem.documentDirectory + filename;
          console.log('File URI:', fileUri);
          
          // Dosyayı indir
          const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
          console.log('Download result:', downloadResult);
          
          if (downloadResult.status === 200) {
            // Paylaşılabilir mi kontrol et
            const canShare = await Sharing.isAvailableAsync();
            console.log('Can share:', canShare);
            
            if (canShare) {
              await Sharing.shareAsync(downloadResult.uri, {
                mimeType: 'text/csv',
                dialogTitle: 'CSV Dosyasını Kaydet',
              });
              console.log('Sharing completed');
            } else {
              Alert.alert('Başarılı', `Dosya indirildi: ${filename}`);
            }
          } else {
            console.error('Download failed with status:', downloadResult.status);
            Alert.alert('Hata', 'Dosya indirilemedi');
          }
        } catch (downloadError) {
          console.error('Mobile download error:', downloadError);
          // Fallback: tarayıcıda aç
          try {
            await Linking.openURL(downloadUrl);
          } catch (linkError) {
            console.error('Linking error:', linkError);
            Alert.alert('Hata', 'Dosya açılamadı');
          }
        }
      }
    } catch (error) {
      console.error('General error:', error);
      Alert.alert('Hata', 'Dosya indirilirken bir hata oluştu');
    }
  };

  // Geri dönüş
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RUT Talepleri</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Bu sayfa sadece admin kullanıcıları içindir</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RUT Talepleri</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        >
          {talepler.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Henüz talep bulunmuyor</Text>
            </View>
          ) : (
            talepler.map((talep) => (
              <View key={talep._id} style={styles.talepCard}>
                {/* Header */}
                <TouchableOpacity
                  style={styles.talepHeader}
                  onPress={() => setExpandedTalep(expandedTalep === talep._id ? null : talep._id)}
                >
                  <View style={styles.talepInfo}>
                    <Text style={styles.dstName}>{talep.dst_name}</Text>
                    <Text style={styles.gunText}>{talep.gun}</Text>
                    <Text style={styles.tarihText}>{formatDate(talep.tarih)}</Text>
                  </View>
                  
                  <View style={styles.talepMeta}>
                    <View style={[styles.durumBadge, { backgroundColor: getDurumColor(talep.durum) + '30' }]}>
                      <Text style={[styles.durumText, { color: getDurumColor(talep.durum) }]}>
                        {getDurumText(talep.durum)}
                      </Text>
                    </View>
                    <Ionicons 
                      name={expandedTalep === talep._id ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#888" 
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {expandedTalep === talep._id && (
                  <View style={styles.expandedContent}>
                    {/* Actions */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.downloadButton]}
                        onPress={() => downloadExcel(talep._id, talep.dst_name, talep.gun)}
                      >
                        <Ionicons name="download-outline" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Excel İndir</Text>
                      </TouchableOpacity>
                      
                      {talep.durum === 'beklemede' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => updateTalepDurum(talep._id, 'onaylandi')}
                          >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Onayla</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => updateTalepDurum(talep._id, 'reddedildi')}
                          >
                            <Ionicons name="close" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Reddet</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>

                    {/* Yeni Sıra Listesi */}
                    <Text style={styles.sectionTitle}>Yeni Sıralama ({talep.yeni_sira?.length || 0} müşteri)</Text>
                    <View style={styles.siraList}>
                      {talep.yeni_sira?.slice(0, 10).map((item, index) => (
                        <View key={index} style={styles.siraItem}>
                          <Text style={styles.siraNo}>{item.ziyaret_sira}</Text>
                          <View style={styles.siraInfo}>
                            <Text style={styles.siraUnvan} numberOfLines={1}>{item.musteri_unvan}</Text>
                            <Text style={styles.siraKod}>{item.musteri_kod}</Text>
                          </View>
                        </View>
                      ))}
                      {(talep.yeni_sira?.length || 0) > 10 && (
                        <Text style={styles.moreText}>
                          ... ve {(talep.yeni_sira?.length || 0) - 10} müşteri daha
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  talepCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  talepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  talepInfo: {
    flex: 1,
  },
  dstName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gunText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 4,
  },
  tarihText: {
    fontSize: 12,
    color: '#888',
  },
  talepMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  durumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: '#17a2b8',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  siraList: {
    gap: 8,
  },
  siraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 10,
  },
  siraNo: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  siraInfo: {
    flex: 1,
    marginLeft: 10,
  },
  siraUnvan: {
    fontSize: 13,
    color: '#fff',
  },
  siraKod: {
    fontSize: 11,
    color: '#888',
  },
  moreText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
