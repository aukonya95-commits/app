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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../../src/services/api';

interface RutItem {
  _id: string;
  rut_kod: string;
  rut_aciklama: string;
  dst_name: string;
  gun: string;
  ziyaret_sira: number;
  musteri_kod: string;
  musteri_unvan: string;
  musteri_durum: string;
  musteri_grup: string;
  adres?: string;
}

export default function RutScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gunler, setGunler] = useState<string[]>([]);
  const [selectedGun, setSelectedGun] = useState<string>('');
  const [rutData, setRutData] = useState<RutItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<RutItem[]>([]);
  const [sending, setSending] = useState(false);

  const isDST = user?.role === 'dst';
  const dstName = user?.dst_name || '';

  // Gün listesini yükle
  const loadGunler = useCallback(async () => {
    try {
      const params = isDST && dstName ? `?dst_name=${encodeURIComponent(dstName)}` : '';
      const response = await api.get(`/rut/gunler${params}`);
      const data = response.data || [];
      setGunler(data);
      
      if (data.length > 0 && !selectedGun) {
        setSelectedGun(data[0]);
      }
    } catch (error) {
      console.error('Error loading gunler:', error);
    }
  }, [isDST, dstName, selectedGun]);

  // RUT verilerini yükle
  const loadRutData = useCallback(async () => {
    if (!selectedGun) return;
    
    try {
      setLoading(true);
      
      // DST kullanıcısı kendi verilerini görür
      if (isDST && dstName) {
        const response = await api.get(`/rut?dst_name=${encodeURIComponent(dstName)}&gun=${encodeURIComponent(selectedGun)}`);
        const data = response.data || [];
        setRutData(data);
        setEditedData(data);
      }
    } catch (error) {
      console.error('Error loading rut data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedGun, isDST, dstName]);

  useEffect(() => {
    loadGunler();
  }, [loadGunler]);

  useEffect(() => {
    if (selectedGun && isDST) {
      loadRutData();
    }
  }, [selectedGun, loadRutData, isDST]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRutData();
  };

  // Sırayı değiştir (yukarı/aşağı)
  const moveItem = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const newData = [...editedData];
    let newIndex: number;
    
    switch (direction) {
      case 'up':
        newIndex = index - 1;
        if (newIndex < 0) return;
        [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
        break;
      case 'down':
        newIndex = index + 1;
        if (newIndex >= newData.length) return;
        [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
        break;
      case 'top':
        if (index === 0) return;
        const itemTop = newData.splice(index, 1)[0];
        newData.unshift(itemTop);
        break;
      case 'bottom':
        if (index === newData.length - 1) return;
        const itemBottom = newData.splice(index, 1)[0];
        newData.push(itemBottom);
        break;
    }
    
    // Update sıra numbers
    newData.forEach((item, i) => {
      item.ziyaret_sira = i + 1;
    });
    
    setEditedData(newData);
  };

  // Talebi gönder
  const sendTalep = async () => {
    if (!editedData.length) return;
    
    Alert.alert(
      'Talep Gönder',
      `${selectedGun} günü için yeni rut sıralamasını admin'e göndermek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            try {
              setSending(true);
              const response = await api.post('/rut/talep', {
                dst_name: dstName,
                gun: selectedGun,
                yeni_sira: editedData.map(item => ({
                  ziyaret_sira: item.ziyaret_sira,
                  musteri_kod: item.musteri_kod,
                  musteri_unvan: item.musteri_unvan,
                  musteri_durum: item.musteri_durum,
                  musteri_grup: item.musteri_grup
                }))
              });
              
              if (response.data?.success) {
                Alert.alert('Başarılı', 'Rut değişiklik talebiniz admin\'e gönderildi.');
                setEditMode(false);
              } else {
                Alert.alert('Hata', response.data?.message || 'Talep gönderilemedi');
              }
            } catch (error) {
              console.error('Error sending talep:', error);
              Alert.alert('Hata', 'Talep gönderilirken bir hata oluştu');
            } finally {
              setSending(false);
            }
          }
        }
      ]
    );
  };

  // DST olmayan kullanıcılar bu sayfayı göremez - bu kontrol _layout'da yapılıyor
  // Ama DST kullanıcısı için içeriği gösterelim

  if (!isDST) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Bu sayfa sadece DST kullanıcıları içindir</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with talep button for admin */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RUT - {dstName}</Text>
        {editMode && (
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendTalep}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendButtonText}>Talep Gönder</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Gün seçici */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.gunlerContainer}
        contentContainerStyle={styles.gunlerContent}
      >
        {gunler.map((gun) => (
          <TouchableOpacity
            key={gun}
            style={[
              styles.gunButton,
              selectedGun === gun && styles.gunButtonActive
            ]}
            onPress={() => {
              setSelectedGun(gun);
              setEditMode(false);
            }}
          >
            <Text style={[
              styles.gunButtonText,
              selectedGun === gun && styles.gunButtonTextActive
            ]}>
              {gun}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Edit Mode Toggle */}
      {rutData.length > 0 && (
        <View style={styles.editModeContainer}>
          <TouchableOpacity
            style={[styles.editButton, editMode && styles.editButtonActive]}
            onPress={() => {
              if (editMode) {
                // İptal - orijinal veriye dön
                setEditedData([...rutData]);
              }
              setEditMode(!editMode);
            }}
          >
            <Ionicons 
              name={editMode ? "close" : "pencil"} 
              size={18} 
              color={editMode ? "#ff4444" : "#D4AF37"} 
            />
            <Text style={[styles.editButtonText, editMode && styles.editButtonTextActive]}>
              {editMode ? 'İptal' : 'Sıra Düzenle'}
            </Text>
          </TouchableOpacity>
          
          {editMode && (
            <Text style={styles.editHint}>
              ⬆⬆ En üste | ↑ Yukarı | ↓ Aşağı | ⬇⬇ En alta
            </Text>
          )}
        </View>
      )}

      {/* RUT Listesi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        >
          {(editMode ? editedData : rutData).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                {selectedGun ? `${selectedGun} günü için rut verisi bulunamadı` : 'Bir gün seçin'}
              </Text>
            </View>
          ) : (
            (editMode ? editedData : rutData).map((item, index) => (
              <View key={item._id || index} style={styles.rutCard}>
                <View style={styles.siraContainer}>
                  <Text style={styles.siraNumber}>{item.ziyaret_sira}</Text>
                </View>
                
                <View style={styles.rutInfo}>
                  <Text style={styles.musteriUnvan} numberOfLines={2}>
                    {item.musteri_unvan}
                  </Text>
                  <Text style={styles.musteriKod}>{item.musteri_kod}</Text>
                  <View style={styles.metaRow}>
                    <View style={[
                      styles.durumBadge,
                      item.musteri_durum === 'Aktif' ? styles.durumAktif : styles.durumPasif
                    ]}>
                      <Text style={styles.durumText}>{item.musteri_durum}</Text>
                    </View>
                    <Text style={styles.grupText}>{item.musteri_grup}</Text>
                  </View>
                  {item.adres && (
                    <Text style={styles.adresText} numberOfLines={1}>
                      📍 {item.adres}
                    </Text>
                  )}
                </View>
                
                {editMode && (
                  <View style={styles.moveButtons}>
                    {/* En üste taşı */}
                    <TouchableOpacity
                      style={[styles.moveButton, styles.moveButtonSpecial, index === 0 && styles.moveButtonDisabled]}
                      onPress={() => moveItem(index, 'top')}
                      disabled={index === 0}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={16} 
                        color={index === 0 ? '#333' : '#00FF7F'} 
                      />
                      <Ionicons 
                        name="chevron-up" 
                        size={16} 
                        color={index === 0 ? '#333' : '#00FF7F'} 
                        style={{ marginTop: -10 }}
                      />
                    </TouchableOpacity>
                    {/* Bir yukarı */}
                    <TouchableOpacity
                      style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                      onPress={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={24} 
                        color={index === 0 ? '#333' : '#D4AF37'} 
                      />
                    </TouchableOpacity>
                    {/* Bir aşağı */}
                    <TouchableOpacity
                      style={[styles.moveButton, index === editedData.length - 1 && styles.moveButtonDisabled]}
                      onPress={() => moveItem(index, 'down')}
                      disabled={index === editedData.length - 1}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={24} 
                        color={index === editedData.length - 1 ? '#333' : '#D4AF37'} 
                      />
                    </TouchableOpacity>
                    {/* En alta taşı */}
                    <TouchableOpacity
                      style={[styles.moveButton, styles.moveButtonSpecial, index === editedData.length - 1 && styles.moveButtonDisabled]}
                      onPress={() => moveItem(index, 'bottom')}
                      disabled={index === editedData.length - 1}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={16} 
                        color={index === editedData.length - 1 ? '#333' : '#ff6b6b'} 
                      />
                      <Ionicons 
                        name="chevron-down" 
                        size={16} 
                        color={index === editedData.length - 1 ? '#333' : '#ff6b6b'} 
                        style={{ marginTop: -10 }}
                      />
                    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  gunlerContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  gunlerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  gunButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    marginRight: 8,
  },
  gunButtonActive: {
    backgroundColor: '#D4AF37',
  },
  gunButtonText: {
    color: '#888',
    fontWeight: '500',
  },
  gunButtonTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  editModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f1a',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
  },
  editButtonActive: {
    backgroundColor: '#2a1a1a',
  },
  editButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  editButtonTextActive: {
    color: '#ff4444',
  },
  editHint: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 12,
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
  rutCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  siraContainer: {
    width: 50,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  siraNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  rutInfo: {
    flex: 1,
    padding: 12,
  },
  musteriUnvan: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  musteriKod: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  durumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durumAktif: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  durumPasif: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
  },
  durumText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  grupText: {
    fontSize: 11,
    color: '#888',
  },
  adresText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  moveButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  moveButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#0f0f1a',
  },
  moveButtonSpecial: {
    backgroundColor: '#1a1a2e',
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
});
