# Hal Yönetim Sistemi

Vue 3, Vuetify 3 ve **Supabase** kullanılarak geliştirilmiş sebze ve meyve hallerinde çiftçi ve ürün takip sistemi.

## Özellikler

- ✅ Çiftçi Profil Yönetimi (Ekleme, Düzenleme, Silme)
- ✅ Her çiftçi için ayrı profil ve ürün takibi
- ✅ Ürün Yönetimi (Sebze ve Meyve)
- ✅ Ürün detayları (Miktar, Fiyat, Kalite, Son Kullanım Tarihi)
- ✅ Ürün durum takibi (Beklemede, Onaylandı, Reddedildi, Tedarik Edildi)
- ✅ Çiftçi istatistikleri
- ✅ Responsive Tasarım (Vuetify 3)
- ✅ Veritabanı entegrasyonu (Supabase PostgreSQL)

## 💿 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluşturun
2. **SQL Editor** bölümünde `supabase/schema.sql` dosyasının içeriğini çalıştırın
3. **Project Settings > API** bölümünden URL ve `anon` key değerlerini kopyalayın

### 3. Ortam Değişkenlerini Ayarla

Proje kökünde `.env` dosyası oluşturun (`.env.example` dosyasını referans alın):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. (İsteğe Bağlı) Mevcut Verileri Aktar

`db.json` içindeki örnek verileri Supabase'e taşımak için:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

```bash
npm run seed
```

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

> **Not:** Artık JSON Server gerekmez. Eski yerel API için hâlâ `npm run server` kullanılabilir.

## 🛠️ Kullanılan Teknolojiler

- **Vue 3** - Progressive JavaScript Framework
- **Vuetify 3** - Material Design Component Framework
- **Vue Router** - SPA routing
- **Supabase** - PostgreSQL veritabanı ve API
- **Vite** - Build Tool

## 📁 Proje Yapısı

```
src/
├── components/      # Vue bileşenleri
├── views/          # Sayfa görünümleri
│   ├── Home.vue           # Ana sayfa - Çiftçi listesi
│   └── CiftciDetail.vue   # Çiftçi detay ve ürün yönetimi
├── services/       # API servisleri
│   └── api.js             # Supabase CRUD servisleri
├── lib/            # Supabase client
│   └── supabase.js
├── router/         # Router yapılandırması
│   └── index.js
└── App.vue         # Ana uygulama bileşeni
```

## 🚀 Kullanım

### Çiftçi Ekleme

1. Ana sayfada "Yeni Çiftçi Ekle" butonuna tıklayın
2. Çiftçi bilgilerini girin (Ad Soyad, Telefon, TC Kimlik, Adres, Notlar)
3. "Kaydet" butonuna tıklayın

### Ürün Ekleme

1. Çiftçi kartına tıklayarak çiftçi detay sayfasına gidin
2. "Ürün Ekle" butonuna tıklayın
3. Ürün bilgilerini girin:
   - Ürün Adı
   - Ürün Tipi (Sebze/Meyve)
   - Miktar ve Birim
   - Fiyat
   - Kalite (A/B/C Sınıfı)
   - Geliş Tarihi
   - Son Kullanım Tarihi
   - Durum
   - Notlar
4. "Kaydet" butonuna tıklayın

### Ürün Düzenleme/Silme

- Çiftçi detay sayfasında ürün kartının üzerindeki düzenleme butonuna tıklayın
- Ürün bilgilerini güncelleyin ve kaydedin
- Silme butonu ile ürünü silebilirsiniz

### Çiftçi Bilgilerini Düzenleme

- Çiftçi detay sayfasında "Bilgileri Düzenle" butonuna tıklayın
- Bilgileri güncelleyin ve kaydedin

## 📊 Veritabanı Yapısı

### Çiftçiler (ciftciler)

```json
{
  "id": 1,
  "adSoyad": "Ahmet Yılmaz",
  "telefon": "0532 123 45 67",
  "adres": "Antalya Merkez",
  "tcKimlik": "12345678901",
  "kayitTarihi": "2024-01-15",
  "aktif": true,
  "notlar": "Organik ürün yetiştiriciliği yapıyor"
}
```

### Ürünler (urunler)

```json
{
  "id": 1,
  "ciftciId": 1,
  "urunAdi": "Domates",
  "urunTipi": "Sebze",
  "miktar": 150,
  "birim": "kg",
  "fiyat": 25.50,
  "gelisTarihi": "2024-12-26",
  "sonKullanimTarihi": "2025-01-05",
  "kalite": "A Sınıfı",
  "notlar": "Organik sertifikalı",
  "durum": "Beklemede"
}
```

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# db.json verilerini Supabase'e aktar
npm run seed

# Eski JSON Server (artık gerekli değil)
npm run server

# Production build
npm run build

# Build önizleme
npm run preview
```

## 📝 Notlar

- Supabase `.env` dosyasındaki `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerleri olmadan uygulama veritabanına bağlanamaz
- Veritabanı şeması `supabase/schema.sql` dosyasında tanımlıdır
- Geliştirme ortamında RLS politikaları açıktır; üretimde Supabase Auth ile kısıtlayın
- Şifreler şu an düz metin olarak saklanır; üretimde Supabase Auth kullanılmalıdır

## 📑 License

[MIT](http://opensource.org/licenses/MIT)
