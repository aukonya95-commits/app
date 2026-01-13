from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import pyxlsb
import tempfile
import re
import unicodedata

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

class BayiSummary(BaseModel):
    bayi_kodu: str
    bayi_unvani: str
    kapsam_durumu: Optional[str] = None
    tip: Optional[str] = None
    sinif: Optional[str] = None

class DashboardStats(BaseModel):
    aktif_bayi: int
    pasif_bayi: int

class BayiDetail(BaseModel):
    bayi_kodu: str
    bayi_unvani: str
    dst: Optional[str] = None
    tte: Optional[str] = None
    dsm: Optional[str] = None
    tip: Optional[str] = None
    panaroma_sinif: Optional[str] = None
    satisa_gore_sinif: Optional[str] = None
    kapsam_durumu: Optional[str] = None
    jti_stant: Optional[str] = None
    jti_stant_adet: Optional[float] = None
    camel_myo_stant: Optional[str] = None
    camel_myo_adet: Optional[float] = None
    pmi_stant: Optional[str] = None
    pmi_adet: Optional[float] = None
    bat_stant: Optional[str] = None
    bat_adet: Optional[float] = None
    loyalty_plan_2025: Optional[float] = None
    odenen_2025: Optional[float] = None
    # 2025 Monthly Sales
    ocak_2025: Optional[float] = None
    subat_2025: Optional[float] = None
    mart_2025: Optional[float] = None
    nisan_2025: Optional[float] = None
    mayis_2025: Optional[float] = None
    haziran_2025: Optional[float] = None
    temmuz_2025: Optional[float] = None
    agustos_2025: Optional[float] = None
    eylul_2025: Optional[float] = None
    ekim_2025: Optional[float] = None
    kasim_2025: Optional[float] = None
    aralik_2025: Optional[float] = None
    toplam_satis_2025: Optional[float] = None
    ortalama_2025: Optional[float] = None
    # 2024 Monthly Sales
    ocak_2024: Optional[float] = None
    subat_2024: Optional[float] = None
    mart_2024: Optional[float] = None
    nisan_2024: Optional[float] = None
    mayis_2024: Optional[float] = None
    haziran_2024: Optional[float] = None
    temmuz_2024: Optional[float] = None
    agustos_2024: Optional[float] = None
    eylul_2024: Optional[float] = None
    ekim_2024: Optional[float] = None
    kasim_2024: Optional[float] = None
    aralik_2024: Optional[float] = None
    toplam_satis_2024: Optional[float] = None
    ortalama_2024: Optional[float] = None
    # 2026 Monthly Sales
    ocak_2026: Optional[float] = None
    subat_2026: Optional[float] = None
    mart_2026: Optional[float] = None
    nisan_2026: Optional[float] = None
    mayis_2026: Optional[float] = None
    haziran_2026: Optional[float] = None
    temmuz_2026: Optional[float] = None
    agustos_2026: Optional[float] = None
    eylul_2026: Optional[float] = None
    ekim_2026: Optional[float] = None
    kasim_2026: Optional[float] = None
    aralik_2026: Optional[float] = None
    toplam_2026: Optional[float] = None
    ortalama_2026: Optional[float] = None
    # Development percentage
    gelisim_yuzdesi: Optional[float] = None
    # Debt
    borc_durumu: Optional[str] = None

class Fatura(BaseModel):
    matbu_no: str
    tarih: str
    net_tutar: float
    bayi_kodu: str

class FaturaDetay(BaseModel):
    matbu_no: str
    urunler: List[Dict[str, Any]]
    toplam_miktar: float

class Tahsilat(BaseModel):
    tahsilat_turu: str
    islem_tarihi: str
    tutar: float
    bayi_kodu: str

# Helper function to convert Turkish characters for case-insensitive search
def turkish_to_ascii(text: str) -> str:
    """Convert Turkish special characters to ASCII equivalents"""
    if not text:
        return ""
    # Extended map including all Turkish characters
    tr_map = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
        # Additional Turkish chars that might appear
        '\u0130': 'i',  # İ (Turkish capital I with dot)
        '\u0131': 'i',  # ı (Turkish lowercase dotless i)
    }
    result = text.lower()
    for tr_char, ascii_char in tr_map.items():
        result = result.replace(tr_char, ascii_char)
    # Also normalize unicode
    import unicodedata
    result = unicodedata.normalize('NFKD', result)
    result = ''.join(c for c in result if not unicodedata.combining(c))
    return result

# Helper to parse Excel date serial
def excel_date_to_str(serial):
    if serial is None:
        return None
    try:
        if isinstance(serial, str):
            return serial
        base_date = datetime(1899, 12, 30)
        date = base_date + timedelta(days=int(serial))
        return date.strftime('%d/%m/%Y')
    except:
        return str(serial) if serial else None

def safe_float(value):
    if value is None:
        return 0.0
    try:
        return float(value)
    except:
        return 0.0

def safe_str(value):
    if value is None:
        return None
    return str(value).strip() if value else None

# Login endpoint
@api_router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Simple admin authentication
    if request.username == "admin" and request.password == "admin123":
        return LoginResponse(success=True, message="Giriş başarılı", token="admin-token-123")
    return LoginResponse(success=False, message="Kullanıcı adı veya şifre hatalı")

# Dashboard stats
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    try:
        aktif = await db.stand_raporu.count_documents({"bayi_durumu": "Aktif"})
        pasif = await db.stand_raporu.count_documents({"bayi_durumu": "Pasif"})
        return DashboardStats(aktif_bayi=aktif, pasif_bayi=pasif)
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return DashboardStats(aktif_bayi=0, pasif_bayi=0)

# Bayi search
@api_router.get("/bayiler", response_model=List[BayiSummary])
async def search_bayiler(q: str = Query(default="", description="Search query")):
    try:
        query = {}
        if q:
            # Convert search term to ASCII for Turkish-insensitive search
            search_ascii = turkish_to_ascii(q)
            query = {
                "$or": [
                    {"bayi_kodu_ascii": {"$regex": search_ascii, "$options": "i"}},
                    {"bayi_unvani_ascii": {"$regex": search_ascii, "$options": "i"}}
                ]
            }
        
        # Sort by kapsam_durumu: Aktif first, then Pasif, then İptal
        pipeline = [
            {"$match": query} if query else {"$match": {}},
            {"$addFields": {
                "sort_order": {
                    "$switch": {
                        "branches": [
                            {"case": {"$eq": ["$kapsam_durumu", "Aktif"]}, "then": 1},
                            {"case": {"$eq": ["$kapsam_durumu", "Pasif"]}, "then": 2},
                            {"case": {"$eq": ["$kapsam_durumu", "İptal"]}, "then": 3}
                        ],
                        "default": 4
                    }
                }
            }},
            {"$sort": {"sort_order": 1, "bayi_unvani": 1}},
            {"$limit": 100}
        ]
        
        bayiler = await db.bayiler.aggregate(pipeline).to_list(100)
        return [BayiSummary(
            bayi_kodu=str(b.get("bayi_kodu", "")),
            bayi_unvani=b.get("bayi_unvani", ""),
            kapsam_durumu=b.get("kapsam_durumu"),
            tip=b.get("tip"),
            sinif=b.get("panaroma_sinif")
        ) for b in bayiler]
    except Exception as e:
        logger.error(f"Error searching bayiler: {e}")
        return []

# Bayi detail
@api_router.get("/bayiler/{bayi_kodu}", response_model=BayiDetail)
async def get_bayi_detail(bayi_kodu: str):
    try:
        bayi = await db.bayiler.find_one({"bayi_kodu": bayi_kodu})
        if not bayi:
            raise HTTPException(status_code=404, detail="Bayi bulunamadı")
        
        # Get borç durumu from konya_gun collection
        borc = await db.konya_gun.find_one({"bayi_kodu": bayi_kodu})
        borc_durumu = "Borcu yoktur"
        if borc and borc.get("bakiye"):
            bakiye = safe_float(borc.get("bakiye"))
            if bakiye > 0:
                borc_durumu = f"{bakiye:,.1f} TL"
        
        # Calculate development percentage
        toplam_2024 = safe_float(bayi.get("toplam_satis_2024"))
        toplam_2025 = safe_float(bayi.get("toplam_satis_2025"))
        gelisim = 0.0
        if toplam_2024 > 0:
            gelisim = ((toplam_2025 - toplam_2024) / toplam_2024) * 100
        
        return BayiDetail(
            bayi_kodu=str(bayi.get("bayi_kodu", "")),
            bayi_unvani=bayi.get("bayi_unvani", ""),
            dst=bayi.get("dst"),
            tte=bayi.get("tte"),
            dsm=bayi.get("dsm"),
            tip=bayi.get("tip"),
            panaroma_sinif=bayi.get("panaroma_sinif"),
            satisa_gore_sinif=bayi.get("satisa_gore_sinif"),
            kapsam_durumu=bayi.get("kapsam_durumu"),
            jti_stant=bayi.get("jti_stant"),
            jti_stant_adet=safe_float(bayi.get("jti_stant_adet")),
            camel_myo_stant=bayi.get("camel_myo_stant"),
            camel_myo_adet=safe_float(bayi.get("camel_myo_adet")),
            pmi_stant=bayi.get("pmi_stant"),
            pmi_adet=safe_float(bayi.get("pmi_adet")),
            bat_stant=bayi.get("bat_stant"),
            bat_adet=safe_float(bayi.get("bat_adet")),
            loyalty_plan_2025=safe_float(bayi.get("loyalty_plan_2025")),
            odenen_2025=safe_float(bayi.get("odenen_2025")),
            ocak_2025=safe_float(bayi.get("ocak_2025")),
            subat_2025=safe_float(bayi.get("subat_2025")),
            mart_2025=safe_float(bayi.get("mart_2025")),
            nisan_2025=safe_float(bayi.get("nisan_2025")),
            mayis_2025=safe_float(bayi.get("mayis_2025")),
            haziran_2025=safe_float(bayi.get("haziran_2025")),
            temmuz_2025=safe_float(bayi.get("temmuz_2025")),
            agustos_2025=safe_float(bayi.get("agustos_2025")),
            eylul_2025=safe_float(bayi.get("eylul_2025")),
            ekim_2025=safe_float(bayi.get("ekim_2025")),
            kasim_2025=safe_float(bayi.get("kasim_2025")),
            aralik_2025=safe_float(bayi.get("aralik_2025")),
            toplam_satis_2025=safe_float(bayi.get("toplam_satis_2025")),
            ortalama_2025=safe_float(bayi.get("ortalama_2025")),
            ocak_2024=safe_float(bayi.get("ocak_2024")),
            subat_2024=safe_float(bayi.get("subat_2024")),
            mart_2024=safe_float(bayi.get("mart_2024")),
            nisan_2024=safe_float(bayi.get("nisan_2024")),
            mayis_2024=safe_float(bayi.get("mayis_2024")),
            haziran_2024=safe_float(bayi.get("haziran_2024")),
            temmuz_2024=safe_float(bayi.get("temmuz_2024")),
            agustos_2024=safe_float(bayi.get("agustos_2024")),
            eylul_2024=safe_float(bayi.get("eylul_2024")),
            ekim_2024=safe_float(bayi.get("ekim_2024")),
            kasim_2024=safe_float(bayi.get("kasim_2024")),
            aralik_2024=safe_float(bayi.get("aralik_2024")),
            toplam_satis_2024=safe_float(bayi.get("toplam_satis_2024")),
            ortalama_2024=safe_float(bayi.get("ortalama_2024")),
            ocak_2026=safe_float(bayi.get("ocak_2026")),
            subat_2026=safe_float(bayi.get("subat_2026")),
            mart_2026=safe_float(bayi.get("mart_2026")),
            nisan_2026=safe_float(bayi.get("nisan_2026")),
            mayis_2026=safe_float(bayi.get("mayis_2026")),
            haziran_2026=safe_float(bayi.get("haziran_2026")),
            temmuz_2026=safe_float(bayi.get("temmuz_2026")),
            agustos_2026=safe_float(bayi.get("agustos_2026")),
            eylul_2026=safe_float(bayi.get("eylul_2026")),
            ekim_2026=safe_float(bayi.get("ekim_2026")),
            kasim_2026=safe_float(bayi.get("kasim_2026")),
            aralik_2026=safe_float(bayi.get("aralik_2026")),
            toplam_2026=safe_float(bayi.get("toplam_2026")),
            ortalama_2026=safe_float(bayi.get("ortalama_2026")),
            gelisim_yuzdesi=gelisim,
            borc_durumu=borc_durumu
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bayi detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Faturalar for a bayi
@api_router.get("/bayiler/{bayi_kodu}/faturalar", response_model=List[Fatura])
async def get_bayi_faturalar(bayi_kodu: str):
    try:
        # Sort by date descending (newest first)
        faturalar = await db.faturalar.find({"bayi_kodu": bayi_kodu}).sort("tarih_sort", -1).to_list(1000)
        return [Fatura(
            matbu_no=f.get("matbu_no", ""),
            tarih=f.get("tarih", ""),
            net_tutar=safe_float(f.get("net_tutar")),
            bayi_kodu=f.get("bayi_kodu", "")
        ) for f in faturalar]
    except Exception as e:
        logger.error(f"Error getting faturalar: {e}")
        return []

# Fatura detail with products
@api_router.get("/faturalar/{matbu_no}", response_model=FaturaDetay)
async def get_fatura_detail(matbu_no: str):
    try:
        detaylar = await db.belge_detay.find({"matbu_no": matbu_no}).to_list(1000)
        urunler = []
        toplam_miktar = 0.0
        for d in detaylar:
            miktar = safe_float(d.get("miktar"))
            toplam_miktar += miktar
            urunler.append({
                "urun_adi": d.get("urun", ""),
                "miktar": miktar
            })
        return FaturaDetay(matbu_no=matbu_no, urunler=urunler, toplam_miktar=toplam_miktar)
    except Exception as e:
        logger.error(f"Error getting fatura detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Tahsilatlar for a bayi
@api_router.get("/bayiler/{bayi_kodu}/tahsilatlar", response_model=List[Tahsilat])
async def get_bayi_tahsilatlar(bayi_kodu: str):
    try:
        # Sort by date descending (newest first)
        tahsilatlar = await db.tahsilatlar.find({"bayi_kodu": bayi_kodu}).sort("tarih_sort", -1).to_list(1000)
        return [Tahsilat(
            tahsilat_turu=t.get("tahsilat_turu", ""),
            islem_tarihi=t.get("islem_tarihi", ""),
            tutar=safe_float(t.get("tutar")),
            bayi_kodu=t.get("bayi_kodu", "")
        ) for t in tahsilatlar]
    except Exception as e:
        logger.error(f"Error getting tahsilatlar: {e}")
        return []

# Excel upload endpoint
@api_router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    try:
        logger.info(f"Receiving file: {file.filename}")
        
        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsb') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"File saved to {tmp_path}, size: {len(content)} bytes")
        
        # Process the Excel file
        await process_excel(tmp_path)
        
        # Clean up
        os.unlink(tmp_path)
        
        return {"success": True, "message": "Excel dosyası başarıyla yüklendi ve işlendi"}
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Yükleme hatası: {str(e)}")

async def process_excel(file_path: str):
    """Process the Excel file and populate MongoDB collections"""
    logger.info("Starting Excel processing...")
    
    # Clear existing data
    await db.bayiler.delete_many({})
    await db.faturalar.delete_many({})
    await db.belge_detay.delete_many({})
    await db.tahsilatlar.delete_many({})
    await db.konya_gun.delete_many({})
    await db.stand_raporu.delete_many({})
    
    with pyxlsb.open_workbook(file_path) as wb:
        # Process AÜ BAYİ LİST
        logger.info("Processing AÜ BAYİ LİST...")
        with wb.get_sheet('AÜ BAYİ LİST') as sheet:
            rows = list(sheet.rows())
            bayiler_data = []
            
            for row in rows[2:]:  # Start from row 3 (index 2)
                cells = [cell.v for cell in row]
                if len(cells) > 0 and cells[0]:
                    bayi_kodu = str(int(cells[0])) if isinstance(cells[0], float) else str(cells[0])
                    bayi_unvani = safe_str(cells[1]) if len(cells) > 1 else ""
                    
                    bayi = {
                        "bayi_kodu": bayi_kodu,
                        "bayi_kodu_ascii": turkish_to_ascii(bayi_kodu),
                        "bayi_unvani": bayi_unvani,
                        "bayi_unvani_ascii": turkish_to_ascii(bayi_unvani) if bayi_unvani else "",
                        "dst": safe_str(cells[2]) if len(cells) > 2 else None,
                        "tte": safe_str(cells[3]) if len(cells) > 3 else None,
                        "dsm": safe_str(cells[4]) if len(cells) > 4 else None,
                        "tip": safe_str(cells[5]) if len(cells) > 5 else None,
                        "panaroma_sinif": safe_str(cells[6]) if len(cells) > 6 else None,
                        "satisa_gore_sinif": safe_str(cells[7]) if len(cells) > 7 else None,
                        "kapsam_durumu": safe_str(cells[9]) if len(cells) > 9 else None,
                        "jti_stant": safe_str(cells[10]) if len(cells) > 10 else None,
                        "jti_stant_adet": safe_float(cells[11]) if len(cells) > 11 else 0,
                        "camel_myo_stant": safe_str(cells[12]) if len(cells) > 12 else None,
                        "camel_myo_adet": safe_float(cells[13]) if len(cells) > 13 else 0,
                        "pmi_stant": safe_str(cells[14]) if len(cells) > 14 else None,
                        "pmi_adet": safe_float(cells[15]) if len(cells) > 15 else 0,
                        "bat_stant": safe_str(cells[16]) if len(cells) > 16 else None,
                        "bat_adet": safe_float(cells[17]) if len(cells) > 17 else 0,
                        "loyalty_plan_2025": safe_float(cells[18]) if len(cells) > 18 else 0,
                        "odenen_2025": safe_float(cells[19]) if len(cells) > 19 else 0,
                        # 2025 Monthly
                        "ocak_2025": safe_float(cells[33]) if len(cells) > 33 else 0,
                        "subat_2025": safe_float(cells[34]) if len(cells) > 34 else 0,
                        "mart_2025": safe_float(cells[35]) if len(cells) > 35 else 0,
                        "nisan_2025": safe_float(cells[36]) if len(cells) > 36 else 0,
                        "mayis_2025": safe_float(cells[37]) if len(cells) > 37 else 0,
                        "haziran_2025": safe_float(cells[38]) if len(cells) > 38 else 0,
                        "temmuz_2025": safe_float(cells[39]) if len(cells) > 39 else 0,
                        "agustos_2025": safe_float(cells[40]) if len(cells) > 40 else 0,
                        "eylul_2025": safe_float(cells[41]) if len(cells) > 41 else 0,
                        "ekim_2025": safe_float(cells[42]) if len(cells) > 42 else 0,
                        "kasim_2025": safe_float(cells[43]) if len(cells) > 43 else 0,
                        "aralik_2025": safe_float(cells[44]) if len(cells) > 44 else 0,
                        "toplam_satis_2025": safe_float(cells[45]) if len(cells) > 45 else 0,
                        "ortalama_2025": safe_float(cells[48]) if len(cells) > 48 else 0,
                        # 2024 Monthly
                        "ocak_2024": safe_float(cells[71]) if len(cells) > 71 else 0,
                        "subat_2024": safe_float(cells[72]) if len(cells) > 72 else 0,
                        "mart_2024": safe_float(cells[73]) if len(cells) > 73 else 0,
                        "nisan_2024": safe_float(cells[74]) if len(cells) > 74 else 0,
                        "mayis_2024": safe_float(cells[75]) if len(cells) > 75 else 0,
                        "haziran_2024": safe_float(cells[76]) if len(cells) > 76 else 0,
                        "temmuz_2024": safe_float(cells[77]) if len(cells) > 77 else 0,
                        "agustos_2024": safe_float(cells[78]) if len(cells) > 78 else 0,
                        "eylul_2024": safe_float(cells[79]) if len(cells) > 79 else 0,
                        "ekim_2024": safe_float(cells[80]) if len(cells) > 80 else 0,
                        "kasim_2024": safe_float(cells[81]) if len(cells) > 81 else 0,
                        "aralik_2024": safe_float(cells[82]) if len(cells) > 82 else 0,
                        "toplam_satis_2024": safe_float(cells[83]) if len(cells) > 83 else 0,
                        "ortalama_2024": safe_float(cells[84]) if len(cells) > 84 else 0,
                        # 2026 Monthly
                        "ocak_2026": safe_float(cells[85]) if len(cells) > 85 else 0,
                        "subat_2026": safe_float(cells[86]) if len(cells) > 86 else 0,
                        "mart_2026": safe_float(cells[87]) if len(cells) > 87 else 0,
                        "nisan_2026": safe_float(cells[88]) if len(cells) > 88 else 0,
                        "mayis_2026": safe_float(cells[89]) if len(cells) > 89 else 0,
                        "haziran_2026": safe_float(cells[90]) if len(cells) > 90 else 0,
                        "temmuz_2026": safe_float(cells[91]) if len(cells) > 91 else 0,
                        "agustos_2026": safe_float(cells[92]) if len(cells) > 92 else 0,
                        "eylul_2026": safe_float(cells[93]) if len(cells) > 93 else 0,
                        "ekim_2026": safe_float(cells[94]) if len(cells) > 94 else 0,
                        "kasim_2026": safe_float(cells[95]) if len(cells) > 95 else 0,
                        "aralik_2026": safe_float(cells[96]) if len(cells) > 96 else 0,
                        "toplam_2026": safe_float(cells[97]) if len(cells) > 97 else 0,
                        "ortalama_2026": safe_float(cells[98]) if len(cells) > 98 else 0,
                    }
                    bayiler_data.append(bayi)
            
            if bayiler_data:
                await db.bayiler.insert_many(bayiler_data)
                logger.info(f"Inserted {len(bayiler_data)} bayiler")
        
        # Process Fatura
        logger.info("Processing Fatura...")
        with wb.get_sheet('Fatura') as sheet:
            rows = list(sheet.rows())
            faturalar_data = []
            
            for row in rows[1:]:  # Start from row 2
                cells = [cell.v for cell in row]
                if len(cells) > 13 and cells[0]:
                    bayi_kodu = str(cells[0]).strip() if cells[0] else ""
                    tarih = excel_date_to_str(cells[3])
                    
                    # Parse date for sorting
                    tarih_sort = None
                    if cells[3]:
                        try:
                            if isinstance(cells[3], (int, float)):
                                tarih_sort = int(cells[3])
                            else:
                                # Try to parse date string
                                parts = str(cells[3]).replace('.', '/').replace('-', '/').split('/')
                                if len(parts) == 3:
                                    tarih_sort = int(parts[2]) * 10000 + int(parts[1]) * 100 + int(parts[0])
                        except:
                            tarih_sort = 0
                    
                    fatura = {
                        "bayi_kodu": bayi_kodu,
                        "tarih": tarih,
                        "tarih_sort": tarih_sort or 0,
                        "matbu_no": safe_str(cells[5]) if len(cells) > 5 else "",
                        "net_tutar": safe_float(cells[13]) if len(cells) > 13 else 0
                    }
                    faturalar_data.append(fatura)
            
            if faturalar_data:
                await db.faturalar.insert_many(faturalar_data)
                logger.info(f"Inserted {len(faturalar_data)} faturalar")
        
        # Process Belge Detay
        logger.info("Processing Belge detay...")
        with wb.get_sheet('Belge detay') as sheet:
            rows = list(sheet.rows())
            detay_data = []
            
            for row in rows[1:]:  # Start from row 2
                cells = [cell.v for cell in row]
                if len(cells) > 7 and cells[0]:
                    detay = {
                        "matbu_no": safe_str(cells[0]),
                        "urun": safe_str(cells[6]) if len(cells) > 6 else "",
                        "miktar": safe_float(cells[7]) if len(cells) > 7 else 0
                    }
                    detay_data.append(detay)
            
            if detay_data:
                await db.belge_detay.insert_many(detay_data)
                logger.info(f"Inserted {len(detay_data)} belge detay")
        
        # Process Tahsilat
        logger.info("Processing tahsilat...")
        with wb.get_sheet('tahsilat') as sheet:
            rows = list(sheet.rows())
            tahsilat_data = []
            
            for row in rows[1:]:  # Start from row 2
                cells = [cell.v for cell in row]
                if len(cells) > 8 and cells[2]:
                    bayi_kodu = str(cells[2]).strip() if cells[2] else ""
                    islem_tarihi = safe_str(cells[5])
                    
                    # Parse date for sorting
                    tarih_sort = 0
                    if islem_tarihi:
                        try:
                            parts = islem_tarihi.replace('.', '/').replace('-', '/').split('/')
                            if len(parts) == 3:
                                # Format: DD/MM/YYYY
                                tarih_sort = int(parts[2]) * 10000 + int(parts[1]) * 100 + int(parts[0])
                        except:
                            tarih_sort = 0
                    
                    tahsilat = {
                        "bayi_kodu": bayi_kodu,
                        "tahsilat_turu": safe_str(cells[1]) if len(cells) > 1 else "",
                        "islem_tarihi": islem_tarihi,
                        "tarih_sort": tarih_sort,
                        "tutar": safe_float(cells[8]) if len(cells) > 8 else 0
                    }
                    tahsilat_data.append(tahsilat)
            
            if tahsilat_data:
                await db.tahsilatlar.insert_many(tahsilat_data)
                logger.info(f"Inserted {len(tahsilat_data)} tahsilatlar")
        
        # Process Konya Gün (for debt info)
        logger.info("Processing KONYA GÜN...")
        with wb.get_sheet('KONYA GÜN') as sheet:
            rows = list(sheet.rows())
            konya_data = []
            
            for row in rows[7:]:  # Start from row 8 (index 7)
                cells = [cell.v for cell in row]
                if len(cells) > 10 and cells[0]:
                    bayi_kodu = str(int(cells[0])) if isinstance(cells[0], float) else str(cells[0])
                    konya = {
                        "bayi_kodu": bayi_kodu,
                        "bakiye": safe_float(cells[10]) if len(cells) > 10 else 0
                    }
                    konya_data.append(konya)
            
            if konya_data:
                await db.konya_gun.insert_many(konya_data)
                logger.info(f"Inserted {len(konya_data)} konya_gun records")
        
        # Process Stand Raporu (for active/passive counts)
        logger.info("Processing STAND RAPORU...")
        with wb.get_sheet('STAND RAPORU') as sheet:
            rows = list(sheet.rows())
            stand_data = []
            
            for row in rows[1:]:  # Start from row 2
                cells = [cell.v for cell in row]
                if len(cells) > 12 and cells[5]:
                    bayi_kodu = str(cells[5]).strip() if cells[5] else ""
                    stand = {
                        "bayi_kodu": bayi_kodu,
                        "bayi_durumu": safe_str(cells[12]) if len(cells) > 12 else None
                    }
                    stand_data.append(stand)
            
            if stand_data:
                await db.stand_raporu.insert_many(stand_data)
                logger.info(f"Inserted {len(stand_data)} stand_raporu records")
    
    # Create indexes
    await db.bayiler.create_index("bayi_kodu")
    await db.bayiler.create_index("bayi_kodu_ascii")
    await db.bayiler.create_index("bayi_unvani_ascii")
    await db.faturalar.create_index("bayi_kodu")
    await db.faturalar.create_index("matbu_no")
    await db.belge_detay.create_index("matbu_no")
    await db.tahsilatlar.create_index("bayi_kodu")
    await db.konya_gun.create_index("bayi_kodu")
    await db.stand_raporu.create_index("bayi_durumu")
    
    logger.info("Excel processing completed!")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
