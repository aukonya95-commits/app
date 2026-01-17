import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

interface DSMTeam {
  team_name: string;
  dsm_name: string;
  dst_list: string[];
  bayi_sayisi?: number;
  aktif_bayi_sayisi?: number;
  pasif_bayi_sayisi?: number;
  aralik_hedef?: number;
  aralik_satis?: number;
  kalan_satis?: number;
  hedef_basari_orani?: number;
  tahsilat_hedef?: number;
  tahsilat_tutari?: number;
  ay_hedef_ziyaret?: number;
  ziyaret_gerceklesen?: number;
  drop_rate?: number;
  basarili_satis?: number;
  basarili_satis_yuzde?: number;
  carili_bayi_sayisi?: number;
  gun_0?: number;
  gun_1?: number;
  gun_2?: number;
  gun_3?: number;
  gun_4?: number;
  gun_5?: number;
  gun_6?: number;
  gun_7?: number;
  gun_8?: number;
  gun_9?: number;
  gun_10?: number;
  gun_11?: number;
  gun_12?: number;
  gun_13?: number;
  gun_14_uzeri?: number;
  cari_toplam?: number;
  toplam_gun_sku?: number;
  camel_toplam?: number;
  winston_toplam?: number;
  mcarlo_toplam?: number;
  myo_camel?: number;
  ld_toplam?: number;
  toplam?: number;
  kasa?: number;
  hedef_das?: number;
  camel_gerc?: number;
  winston_gerc?: number;
  mcarlo_gerc?: number;
  myo_camel_gerc?: number;
  ld_gerc?: number;
  toplam_gerc?: number;
  kasa_gerc?: number;
  gerc_das?: number;
  bak_01?: number;
  mar_02?: number;
  bfe_03?: number;
  kye_04?: number;
  tek_05?: number;
  ben_07?: number;
  ask_08?: number;
  czv_11?: number;
  yznc_12?: number;
  tut_14?: number;
  tus_15?: number;
  jti?: number;
  pmi?: number;
  bat?: number;
  rut_say?: number;
  w_dark_blue_ks?: number;
  w_slender_blue_ks?: number;
  w_dark_blue_long?: number;
  mcarlo_slender_dark_blue_yil?: number;
  w_slim_blue?: number;
  w_blue_ks?: number;
  w_slender_blue_long?: number;
  camel_slender_blue_yil?: number;
  mcarlo_dark_blue_ks?: number;
  mcarlo_dark_blue_long_yil?: number;
  w_slender_q_line_2025?: number;
  w_slender_q_line_2026?: number;
  frekans_ort?: number;
}

export default function DSMScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<DSMTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<DSMTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/dsm-teams');
      setTeams(response.data);
      if (response.data.length > 0 && !selectedTeam) {
        setSelectedTeam(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching DSM teams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  const formatNumber = (value?: number, decimals: number = 0) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' ₺';
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return '%' + value.toFixed(2);
  };

  const renderInfoRow = (label: string, value: string, highlight?: boolean) => (
    <View style={[styles.infoRow, highlight && styles.highlightRow]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      
      {/* Team Selection Tabs */}
      <View style={styles.tabContainer}>
        {teams.map((team) => (
          <TouchableOpacity
            key={team.team_name}
            style={[
              styles.tab,
              selectedTeam?.team_name === team.team_name && styles.activeTab
            ]}
            onPress={() => setSelectedTeam(team)}
          >
            <Text style={[
              styles.tabText,
              selectedTeam?.team_name === team.team_name && styles.activeTabText
            ]}>
              {team.team_name}
            </Text>
            <Text style={styles.tabSubText}>{team.dsm_name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTeam && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        >
          {/* Müşteri Sayısı */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(selectedTeam.aktif_bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Aktif Bayi</Text>
            </View>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push(`/pasif-bayiler-dsm/${encodeURIComponent(selectedTeam.dsm_name)}`)}
            >
              <Text style={[styles.statValue, styles.passiveValue]}>{formatNumber(selectedTeam.pasif_bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Pasif Bayi</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFC107" />
            </TouchableOpacity>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(selectedTeam.bayi_sayisi)}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>

          {/* DST Listesi */}
          <View style={styles.dstListContainer}>
            <Text style={styles.dstListTitle}>DST Listesi</Text>
            <View style={styles.dstChipsContainer}>
              {selectedTeam.dst_list.map((dst, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dstChip}
                  onPress={() => router.push(`/dst/${encodeURIComponent(dst)}`)}
                >
                  <Text style={styles.dstChipText}>{dst}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Satış Bilgileri */}
          {renderSection('Satış Bilgileri', <>
            {renderInfoRow('Bayi Sayısı', formatNumber(selectedTeam.bayi_sayisi))}
            {renderInfoRow('Aktif Bayi Sayısı', formatNumber(selectedTeam.aktif_bayi_sayisi))}
            {renderInfoRow('Pasif Bayi Sayısı', formatNumber(selectedTeam.pasif_bayi_sayisi))}
            {renderInfoRow('Ocak Hedef', formatNumber(selectedTeam.aralik_hedef, 1))}
            {renderInfoRow('Ocak Satış', formatNumber(selectedTeam.aralik_satis, 1), true)}
            {renderInfoRow('Kalan Satış', formatNumber(selectedTeam.kalan_satis, 1))}
            {renderInfoRow('Hedef/Başarı Oranı', formatPercent(selectedTeam.hedef_basari_orani), true)}
            {renderInfoRow('Tahsilat Hedef', formatCurrency(selectedTeam.tahsilat_hedef))}
            {renderInfoRow('Tahsilat Tutarı', formatCurrency(selectedTeam.tahsilat_tutari), true)}
            {renderInfoRow('Ay Hedef Ziyaret', formatNumber(selectedTeam.ay_hedef_ziyaret))}
            {renderInfoRow('Ziyaret Gerçekleşen', formatNumber(selectedTeam.ziyaret_gerceklesen))}
            {renderInfoRow('Drop Rate', formatNumber(selectedTeam.drop_rate, 1))}
            {renderInfoRow('Başarılı Satış', formatNumber(selectedTeam.basarili_satis))}
            {renderInfoRow('Başarılı Satış %', formatPercent(selectedTeam.basarili_satis_yuzde), true)}
            {renderInfoRow('Frekans Ortalaması', formatNumber(selectedTeam.frekans_ort, 2), true)}
          </>)}

          {/* Cari Bilgileri - Tıklanabilir */}
          {renderSection('Cari Bilgileri', <>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/toplam`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>Carili Bayi Sayısı</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatNumber(selectedTeam.carili_bayi_sayisi)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/0`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>0 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_0)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/1`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>1 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_1)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/2`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>2 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_2)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/3`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>3 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_3)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/4`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>4 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_4)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/5`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>5 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_5)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/6`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>6 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_6)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/7`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>7 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_7)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/8`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>8 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_8)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/9`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>9 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_9)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/10`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>10 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_10)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/11`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>11 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_11)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/12`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>12 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_12)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/13`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>13 Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_13)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/14_uzeri`)}>
              <View style={styles.clickableInfoRow}>
                <Text style={styles.infoLabel}>14+ Gün</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValue}>{formatCurrency(selectedTeam.gun_14_uzeri)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cari-dsm/${encodeURIComponent(selectedTeam.dsm_name)}/toplam`)}>
              <View style={[styles.clickableInfoRow, styles.highlightRow]}>
                <Text style={[styles.infoLabel, styles.highlightLabel]}>Cari Toplam</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={[styles.infoValue, styles.highlightValue]}>{formatCurrency(selectedTeam.cari_toplam)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
                </View>
              </View>
            </TouchableOpacity>
          </>)}

          {/* Son Gün SKU */}
          {renderSection('Son Gün Satış SKU', <>
            {renderInfoRow('Toplam Gün SKU', formatNumber(selectedTeam.toplam_gun_sku, 1), true)}
          </>)}

          {/* Ay Verileri - Hedefler */}
          {renderSection('Hedefler', <>
            {renderInfoRow('Camel', formatNumber(selectedTeam.camel_toplam, 1))}
            {renderInfoRow('Winston', formatNumber(selectedTeam.winston_toplam, 1))}
            {renderInfoRow('M.Carlo', formatNumber(selectedTeam.mcarlo_toplam, 1))}
            {renderInfoRow('MYO Camel', formatNumber(selectedTeam.myo_camel, 1))}
            {renderInfoRow('LD', formatNumber(selectedTeam.ld_toplam, 1))}
            {renderInfoRow('Toplam', formatNumber(selectedTeam.toplam, 1), true)}
            {renderInfoRow('Kasa', formatNumber(selectedTeam.kasa, 2))}
            {renderInfoRow('Hedef DAS', formatNumber(selectedTeam.hedef_das, 2))}
          </>)}

          {/* Ay Verileri - Satışlar */}
          {renderSection('Satışlar', <>
            {renderInfoRow('Camel', formatNumber(selectedTeam.camel_gerc, 1))}
            {renderInfoRow('Winston', formatNumber(selectedTeam.winston_gerc, 1))}
            {renderInfoRow('M.Carlo', formatNumber(selectedTeam.mcarlo_gerc, 1))}
            {renderInfoRow('MYO Camel', formatNumber(selectedTeam.myo_camel_gerc, 1))}
            {renderInfoRow('LD', formatNumber(selectedTeam.ld_gerc, 1))}
            {renderInfoRow('Toplam', formatNumber(selectedTeam.toplam_gerc, 1), true)}
            {renderInfoRow('Kasa', formatNumber(selectedTeam.kasa_gerc, 2))}
            {renderInfoRow('Gerç. DAS', formatNumber(selectedTeam.gerc_das, 2))}
          </>)}

          {/* Bayi Tipleri */}
          {renderSection('Bayi Tipleri ve Sayıları', <>
            {renderInfoRow('01 BAK', formatNumber(selectedTeam.bak_01))}
            {renderInfoRow('02 MAR', formatNumber(selectedTeam.mar_02))}
            {renderInfoRow('03 BFE', formatNumber(selectedTeam.bfe_03))}
            {renderInfoRow('04 KYE', formatNumber(selectedTeam.kye_04))}
            {renderInfoRow('05 TEK', formatNumber(selectedTeam.tek_05))}
            {renderInfoRow('07 BEN', formatNumber(selectedTeam.ben_07))}
            {renderInfoRow('08 ASK', formatNumber(selectedTeam.ask_08))}
            {renderInfoRow('11 CZV', formatNumber(selectedTeam.czv_11))}
            {renderInfoRow('12 YZNC', formatNumber(selectedTeam.yznc_12))}
            {renderInfoRow('14 TUT', formatNumber(selectedTeam.tut_14))}
            {renderInfoRow('15 TUS', formatNumber(selectedTeam.tus_15))}
            {renderInfoRow('JTI', formatNumber(selectedTeam.jti))}
            {renderInfoRow('PMI', formatNumber(selectedTeam.pmi))}
            {renderInfoRow('BAT', formatNumber(selectedTeam.bat))}
            {renderInfoRow('Rut Sayısı', formatNumber(selectedTeam.rut_say))}
          </>)}

          {/* İlk 10 SKU */}
          {renderSection('İlk 10 SKU', <>
            {renderInfoRow('W.Dark Blue Ks', formatNumber(selectedTeam.w_dark_blue_ks))}
            {renderInfoRow('W.Slender Blue Ks', formatNumber(selectedTeam.w_slender_blue_ks))}
            {renderInfoRow('W.Dark Blue Long', formatNumber(selectedTeam.w_dark_blue_long))}
            {renderInfoRow('M.Carlo Slender Dark Blue', formatNumber(selectedTeam.mcarlo_slender_dark_blue_yil))}
            {renderInfoRow('W.Slim Blue', formatNumber(selectedTeam.w_slim_blue))}
            {renderInfoRow('W.Blue Ks', formatNumber(selectedTeam.w_blue_ks))}
            {renderInfoRow('W.Slender Blue Long', formatNumber(selectedTeam.w_slender_blue_long))}
            {renderInfoRow('Camel Slender Blue', formatNumber(selectedTeam.camel_slender_blue_yil))}
            {renderInfoRow('M.Carlo Dark Blue Ks', formatNumber(selectedTeam.mcarlo_dark_blue_ks))}
            {renderInfoRow('M.Carlo Dark Blue Long', formatNumber(selectedTeam.mcarlo_dark_blue_long_yil, 1))}
            {renderInfoRow('2025 W.Slender Q Line', formatNumber(selectedTeam.w_slender_q_line_2025, 1))}
            {renderInfoRow('2026 W.Slender Q Line', formatNumber(selectedTeam.w_slender_q_line_2026, 1))}
          </>)}

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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  activeTabText: {
    color: '#0a0a0a',
  },
  tabSubText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  passiveValue: {
    color: '#FFC107',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  dstListContainer: {
    marginBottom: 20,
  },
  dstListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  dstChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dstChip: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dstChipText: {
    fontSize: 12,
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  sectionContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  highlightRow: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'right',
  },
  highlightValue: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  clickableInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightLabel: {
    color: '#D4AF37',
  },
});
