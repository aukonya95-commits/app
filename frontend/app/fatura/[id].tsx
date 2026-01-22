import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/services/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/context/AuthContext';

interface Urun {
  urun_adi: string;
  miktar: number;
  birim_fiyat?: number;
  tutar?: number;
}

interface FaturaDetay {
  matbu_no: string;
  urunler: Urun[];
  toplam_miktar: number;
  toplam_tutar?: number;
}

export default function FaturaDetailScreen() {
  const { id, bayi_kodu, bayi_adi } = useLocalSearchParams<{ id: string; bayi_kodu?: string; bayi_adi?: string }>();
  const [fatura, setFatura] = useState<FaturaDetay | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Geri dönüş - her zaman bir önceki sayfaya
  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchFaturaDetail = async () => {
      try {
        const response = await api.get(`/faturalar/${id}`);
        setFatura(response.data);
      } catch (error) {
        console.error('Error fetching fatura detail:', error);
        Alert.alert('Hata', 'Fatura detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFaturaDetail();
    }
  }, [id]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const generatePDF = async () => {
    if (!fatura) return;

    setPdfLoading(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('tr-TR');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Fatura - ${fatura.matbu_no}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h2 { color: #333; font-size: 20px; }
            .disclaimer { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
            .disclaimer p { color: #856404; font-size: 11px; text-align: center; margin: 0; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; width: 48%; }
            .info-box label { color: #666; font-size: 12px; display: block; margin-bottom: 5px; }
            .info-box span { font-size: 14px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #333; color: #fff; padding: 12px 8px; text-align: left; font-size: 12px; }
            td { padding: 10px 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
            tr:nth-child(even) { background: #f9f9f9; }
            .total-row { background: #1a1a2e !important; }
            .total-row td { color: #fff; font-weight: bold; padding: 15px 8px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>FATURA DETAY</h2>
          </div>
          
          <div class="disclaimer">
            <p>Bu belge resmi evrak niteliği taşımamaktadır.</p>
            <p>Fatura No, Tarih, Miktar ve tutarlar bilgi amaçlı paylaşılmıştır.</p>
          </div>
          
          <div class="info">
            <div class="info-box">
              <label>Fatura No</label>
              <span>${fatura.matbu_no}</span>
            </div>
            <div class="info-box">
              <label>Tarih</label>
              <span>${dateStr}</span>
            </div>
          </div>
          
          ${bayi_kodu || bayi_adi ? `
          <div class="info">
            <div class="info-box">
              <label>Bayi Kodu</label>
              <span>${bayi_kodu || '-'}</span>
            </div>
            <div class="info-box">
              <label>Bayi Adı</label>
              <span>${bayi_adi || '-'}</span>
            </div>
          </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 45%">Ürün Adı</th>
                <th style="width: 15%" class="text-right">Miktar</th>
                <th style="width: 15%" class="text-right">Birim Fiyat</th>
                <th style="width: 20%" class="text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${fatura.urunler.map((urun, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${urun.urun_adi}</td>
                  <td class="text-right">${formatNumber(urun.miktar)}</td>
                  <td class="text-right">${formatCurrency(urun.birim_fiyat)}</td>
                  <td class="text-right">${formatCurrency(urun.tutar)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2"><strong>TOPLAM</strong></td>
                <td class="text-right"><strong>${formatNumber(fatura.toplam_miktar)}</strong></td>
                <td></td>
                <td class="text-right"><strong>${formatCurrency(fatura.toplam_tutar)}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (Platform.OS === 'web') {
        // Web için doğrudan indir
        const link = document.createElement('a');
        link.href = uri;
        link.download = `Fatura_${fatura.matbu_no}.pdf`;
        link.click();
      } else {
        // Mobil için paylaş
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Fatura ${fatura.matbu_no}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Hata', 'PDF paylaşımı bu cihazda desteklenmiyor');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fatura Detay</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Fatura yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!fatura) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fatura Detay</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Fatura bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fatura Detay</Text>
        <TouchableOpacity 
          style={styles.headerPdfButton}
          onPress={generatePDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <ActivityIndicator size="small" color="#D4AF37" />
          ) : (
            <Ionicons name="download-outline" size={24} color="#D4AF37" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Fatura Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Ionicons name="document-text" size={24} color="#D4AF37" />
            <Text style={styles.faturaNo}>{fatura.matbu_no}</Text>
          </View>
          
          {(bayi_kodu || bayi_adi) && (
            <View style={styles.bayiInfo}>
              {bayi_kodu && <Text style={styles.bayiKod}>{bayi_kodu}</Text>}
              {bayi_adi && <Text style={styles.bayiAdi}>{bayi_adi}</Text>}
            </View>
          )}
          
          {/* PDF İndir Butonu - Mobil için */}
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={generatePDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>PDF İndir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Ürün Listesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ürün Listesi ({fatura.urunler.length} kalem)</Text>
          
          {/* Tablo Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ürün</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Miktar</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>B.Fiyat</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Tutar</Text>
          </View>
          
          {fatura.urunler.map((urun, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.urunAdi, { flex: 2 }]} numberOfLines={2}>{urun.urun_adi}</Text>
              <Text style={[styles.miktar, { flex: 1, textAlign: 'right' }]}>{formatNumber(urun.miktar)}</Text>
              <Text style={[styles.birimFiyat, { flex: 1, textAlign: 'right' }]}>{formatCurrency(urun.birim_fiyat)}</Text>
              <Text style={[styles.tutar, { flex: 1, textAlign: 'right' }]}>{formatCurrency(urun.tutar)}</Text>
            </View>
          ))}
        </View>

        {/* Toplam */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam Miktar</Text>
            <Text style={styles.totalValue}>{formatNumber(fatura.toplam_miktar)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Toplam Tutar</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(fatura.toplam_tutar)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
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
  headerPdfButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pdfButton: {
    marginRight: 16,
    padding: 8,
  },
  headerCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faturaNo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 12,
  },
  bayiInfo: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 8,
  },
  bayiKod: {
    fontSize: 12,
    color: '#888',
  },
  bayiAdi: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  downloadButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableRowEven: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  urunAdi: {
    fontSize: 12,
    color: '#fff',
    paddingRight: 8,
  },
  miktar: {
    fontSize: 12,
    color: '#aaa',
  },
  birimFiyat: {
    fontSize: 11,
    color: '#888',
  },
  tutar: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D4AF37',
  },
  totalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
    marginTop: 8,
    paddingTop: 16,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
});
