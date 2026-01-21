import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Production deployment URL - always use this
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Fallback for safety (optional but recommended)
const API_URL = PRODUCTION_API_URL || 'https://konya-district-map.preview.emergentagent.com';


console.log('Platform:', Platform.OS);
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000, // Increased timeout for mobile
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.message, error.config?.url);
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    username: string;
    name: string;
    role: string;
    dst_name?: string;
  };
}

export interface BayiSummary {
  bayi_kodu: string;
  bayi_unvani: string;
  kapsam_durumu?: string;
  tip?: string;
  sinif?: string;
  dst?: string;
  tte?: string;
}

export interface DashboardStats {
  aktif_bayi: number;
  pasif_bayi: number;
}

export interface BayiDetail {
  bayi_kodu: string;
  bayi_unvani: string;
  dst?: string;
  tte?: string;
  dsm?: string;
  tip?: string;
  panaroma_sinif?: string;
  satisa_gore_sinif?: string;
  kapsam_durumu?: string;
  jti_stant?: string;
  jti_stant_adet?: number;
  camel_myo_stant?: string;
  camel_myo_adet?: number;
  pmi_stant?: string;
  pmi_adet?: number;
  bat_stant?: string;
  bat_adet?: number;
  loyalty_plan_2025?: number;
  odenen_2025?: number;
  ocak_2025?: number;
  subat_2025?: number;
  mart_2025?: number;
  nisan_2025?: number;
  mayis_2025?: number;
  haziran_2025?: number;
  temmuz_2025?: number;
  agustos_2025?: number;
  eylul_2025?: number;
  ekim_2025?: number;
  kasim_2025?: number;
  aralik_2025?: number;
  toplam_satis_2025?: number;
  ortalama_2025?: number;
  ocak_2024?: number;
  subat_2024?: number;
  mart_2024?: number;
  nisan_2024?: number;
  mayis_2024?: number;
  haziran_2024?: number;
  temmuz_2024?: number;
  agustos_2024?: number;
  eylul_2024?: number;
  ekim_2024?: number;
  kasim_2024?: number;
  aralik_2024?: number;
  toplam_satis_2024?: number;
  ortalama_2024?: number;
  ocak_2026?: number;
  subat_2026?: number;
  mart_2026?: number;
  nisan_2026?: number;
  mayis_2026?: number;
  haziran_2026?: number;
  temmuz_2026?: number;
  agustos_2026?: number;
  eylul_2026?: number;
  ekim_2026?: number;
  kasim_2026?: number;
  aralik_2026?: number;
  toplam_2026?: number;
  ortalama_2026?: number;
  gelisim_yuzdesi?: number;
  borc_durumu?: string;
  ziyaret_gunleri?: string[];
}

export interface Fatura {
  matbu_no: string;
  tarih: string;
  net_tutar: number;
  bayi_kodu: string;
}

export interface FaturaDetay {
  matbu_no: string;
  urunler: Array<{ urun_adi: string; miktar: number }>;
  toplam_miktar: number;
}

export interface Tahsilat {
  tahsilat_turu: string;
  islem_tarihi: string;
  tutar: number;
  bayi_kodu: string;
}

export interface PasifBayi {
  bayi_kodu: string;
  bayi_unvani: string;
  dst?: string;
  tte?: string;
  txtkapsam?: string;
}

// API Functions
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/login', data);
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getPasifBayiler: async (): Promise<PasifBayi[]> => {
    const response = await api.get('/pasif-bayiler');
    return response.data;
  },
};

export const bayiAPI = {
  search: async (query: string): Promise<BayiSummary[]> => {
    const response = await api.get('/bayiler', { params: { q: query } });
    return response.data;
  },
  getDetail: async (bayiKodu: string): Promise<BayiDetail> => {
    const response = await api.get(`/bayiler/${bayiKodu}`);
    return response.data;
  },
  getFaturalar: async (bayiKodu: string): Promise<Fatura[]> => {
    const response = await api.get(`/bayiler/${bayiKodu}/faturalar`);
    return response.data;
  },
  getTahsilatlar: async (bayiKodu: string): Promise<Tahsilat[]> => {
    const response = await api.get(`/bayiler/${bayiKodu}/tahsilatlar`);
    return response.data;
  },
};

export const faturaAPI = {
  getDetail: async (matbuNo: string): Promise<FaturaDetay> => {
    const response = await api.get(`/faturalar/${matbuNo}`);
    return response.data;
  },
};

export const uploadAPI = {
  uploadExcel: async (file: File | { uri: string; name: string; type: string }): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    
    if (file instanceof File) {
      // Web environment
      formData.append('file', file);
    } else {
      // React Native environment
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type || 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      } as any);
    }
    
    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large files
    });
    return response.data;
  },
};

export default api;
