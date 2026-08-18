<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card class="elevation-12 pa-6">
          <v-card-title class="text-center mb-6">
            <div class="mx-auto">
              <v-icon size="64" color="primary" class="mb-4">mdi-account-plus</v-icon>
              <h1 class="text-h4 font-weight-bold mb-2">Halci Kayıt Formu</h1>
              <p class="text-body-2 text-medium-emphasis">Hal yönetim sistemine kayıt olun</p>
            </div>
          </v-card-title>

          <v-card-text>
            <v-form ref="registerForm" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.ad"
                    label="Ad *"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required, rules.adSoyad]"
                    variant="outlined"
                    @input="form.ad = capitalizeFirst(form.ad)"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.soyad"
                    label="Soyad *"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required, rules.adSoyad]"
                    variant="outlined"
                    @input="form.soyad = capitalizeFirst(form.soyad)"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email *"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.vergiNumarasi"
                    label="Vergi Numarası *"
                    prepend-inner-icon="mdi-card-account-details"
                    :rules="[rules.required, rules.vergiNumarasi]"
                    variant="outlined"
                    hint="10 haneli vergi numarası"
                    persistent-hint
                    maxlength="10"
                    inputmode="numeric"
                    @input="vergiNumarasiFormatla"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.telefon"
                    label="Telefon *"
                    prepend-inner-icon="mdi-phone"
                    :rules="[rules.required, rules.telefon]"
                    maxlength="11"
                    inputmode="numeric"
                    @input="telefonFormatla"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.sirketAdi"
                    label="Şirket Adı *"
                    prepend-inner-icon="mdi-office-building"
                    :rules="[rules.required, rules.sirketAdi]"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.adres"
                    label="Adres *"
                    prepend-inner-icon="mdi-map-marker"
                    :rules="[rules.required, rules.adres]"
                    variant="outlined"
                    rows="3"
                    required
                  ></v-textarea>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.sifre"
                    label="Şifre *"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    :rules="[rules.required, rules.minLength]"
                    variant="outlined"
                    hint="En az 6 karakter"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.sifreTekrar"
                    label="Şifre Tekrar *"
                    :type="showPasswordRepeat ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="showPasswordRepeat ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPasswordRepeat = !showPasswordRepeat"
                    :rules="[rules.required, rules.sifreMatch]"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="error = ''"
              >
                {{ error }}
              </v-alert>

              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mb-4"
              >
                Kayıt başarılı! Yönlendiriliyorsunuz...
              </v-alert>

              <v-btn
                color="primary"
                size="large"
                block
                :disabled="!valid || loading"
                :loading="loading"
                @click="handleRegister"
                class="mb-4"
              >
                Kayıt Ol
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center">
            <span class="text-body-2 text-medium-emphasis">
              Zaten hesabınız var mı?
              <router-link to="/login" class="text-primary text-decoration-none">
                Giriş Yap
              </router-link>
            </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- 
  Register.vue - Kayıt Sayfası
  Yeni halci (kullanıcı) kaydı oluşturma sayfası
-->
<script setup>
// Vue 3 Composition API
import { ref, computed } from 'vue'
// Vue Router - sayfa yönlendirme
import { useRouter } from 'vue-router'
// Auth store - kayıt işlemleri
import { useAuthStore } from '@/stores/auth'

// Router ve auth store instance'ları
const router = useRouter()
const authStore = useAuthStore()

// Form verileri - Tüm input alanlarının değerlerini tutar
const form = ref({
  ad: '',
  soyad: '',
  email: '',
  vergiNumarasi: '',
  telefon: '',
  sirketAdi: '',
  adres: '',
  sifre: '',
  sifreTekrar: ''
})

// UI durum değişkenleri
const showPassword = ref(false) // Şifre göster/gizle
const showPasswordRepeat = ref(false) // Şifre tekrar göster/gizle
const valid = ref(false) // Form geçerlilik durumu
const loading = ref(false) // API çağrısı yüklenme durumu
const error = ref('') // Hata mesajı
const success = ref(false) // Başarı mesajı

/**
 * İlk harfi büyük yapma fonksiyonu
 * Türkçe karakterleri de destekler
 */
const capitalizeFirst = (str) => {
  if (!str) return ''
  // İlk harfi büyük yap, geri kalanını küçük yap
  return str.charAt(0).toLocaleUpperCase('tr-TR') + str.slice(1).toLocaleLowerCase('tr-TR')
}

const sadeceRakamFormatla = (fieldName) => {
  if (form.value[fieldName] == null) return
  form.value[fieldName] = String(form.value[fieldName]).replace(/\D/g, '')
}

const telefonFormatla = () => {
  sadeceRakamFormatla('telefon')
  let cleaned = form.value.telefon
  if (!cleaned) return
  if (cleaned.startsWith('5') && cleaned.length === 10) {
    cleaned = '0' + cleaned
  }
  if (cleaned.length > 11) {
    cleaned = cleaned.substring(0, 11)
  }
  form.value.telefon = cleaned
}

const vergiNumarasiFormatla = () => {
  sadeceRakamFormatla('vergiNumarasi')
  if (form.value.vergiNumarasi.length > 10) {
    form.value.vergiNumarasi = form.value.vergiNumarasi.substring(0, 10)
  }
}

const rules = {
  required: (value) => !!value || 'Bu alan zorunludur',
  adSoyad: (value) => {
    if (!value) return true
    const trimmed = value.trim()
    if (trimmed.length < 2) {
      return 'En az 2 karakter olmalıdır'
    }
    if (trimmed.length > 50) {
      return 'En fazla 50 karakter olabilir'
    }
    // Türkçe karakterler dahil sadece harf ve boşluk
    const pattern = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/
    return pattern.test(trimmed) || 'Sadece harf ve boşluk karakterleri kullanılabilir'
  },
  email: (value) => {
    if (!value) return true
    const trimmed = value.trim().toLowerCase()
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!pattern.test(trimmed)) {
      return 'Geçerli bir email adresi giriniz'
    }
    if (trimmed.length > 100) {
      return 'Email adresi çok uzun'
    }
    return true
  },
  vergiNumarasi: (value) => {
    if (!value) return true
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      return 'Vergi numarası tam 10 haneli olmalıdır'
    }
    return true
  },
  telefon: (value) => {
    if (!value) return true
    const cleaned = value.replace(/\D/g, '') // Sadece rakamları al
    if (cleaned.length === 0) return true // Boşsa geçerli (required kuralı zaten var)
    if (cleaned.length !== 11) {
      return 'Telefon numarası tam 11 haneli olmalıdır'
    }
    if (!cleaned.startsWith('05')) {
      return 'Telefon numarası 05 ile başlamalıdır'
    }
    return true
  },
  sirketAdi: (value) => {
    if (!value) return true
    const trimmed = value.trim()
    if (trimmed.length < 2) {
      return 'Şirket adı en az 2 karakter olmalıdır'
    }
    if (trimmed.length > 100) {
      return 'Şirket adı en fazla 100 karakter olabilir'
    }
    return true
  },
  adres: (value) => {
    if (!value) return true
    const trimmed = value.trim()
    if (trimmed.length < 10) {
      return 'Adres en az 10 karakter olmalıdır'
    }
    if (trimmed.length > 200) {
      return 'Adres en fazla 200 karakter olabilir'
    }
    return true
  },
  minLength: (value) => {
    if (!value) return true
    if (value.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır'
    }
    if (value.length > 50) {
      return 'Şifre en fazla 50 karakter olabilir'
    }
    return true
  },
  sifreMatch: (value) => {
    if (!value) return true
    return value === form.value.sifre || 'Şifreler eşleşmiyor'
  }
}

/**
 * Kayıt olma fonksiyonu
 * Form verilerini temizler, formatlar ve API'ye gönderir
 * Başarılı olursa kullanıcıyı otomatik giriş yaptırır ve ana sayfaya yönlendirir
 */
const handleRegister = async () => {
  // Form geçersizse işlemi durdur
  if (!valid.value) return

  // Yüklenme durumunu aktif et, hata ve başarı mesajlarını temizle
  loading.value = true
  error.value = ''
  success.value = false

  try {
    // Verileri temizle ve formatla
    const telefonTemiz = form.value.telefon.replace(/\D/g, '') // Sadece rakamları al (boşluk, tire vb. temizle)
    const vergiTemiz = form.value.vergiNumarasi.replace(/\D/g, '') // Sadece rakamları al
    const emailTemiz = form.value.email.trim().toLowerCase() // Başındaki/sonundaki boşlukları temizle ve küçük harfe çevir
    
    // API'ye gönderilecek veri objesi
    // Ad ve soyad'ın ilk harflerini büyük yap
    const adCapitalized = capitalizeFirst(form.value.ad.trim())
    const soyadCapitalized = capitalizeFirst(form.value.soyad.trim())
    
    const halciData = {
      ad: adCapitalized,
      soyad: soyadCapitalized,
      email: emailTemiz,
      vergiNumarasi: vergiTemiz,
      telefon: telefonTemiz,
      sirketAdi: form.value.sirketAdi.trim(),
      adres: form.value.adres.trim(),
      sifre: form.value.sifre // Şifre olduğu gibi (hash'lenmemiş - JSON Server için)
    }

    // Auth store'daki register fonksiyonunu çağır
    await authStore.register(halciData)
    // Başarı mesajını göster
    success.value = true
    
    // 1.5 saniye sonra ana sayfaya yönlendir (kullanıcı başarı mesajını görebilsin)
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    console.error('Kayıt hatası detayı:', err)
    // Network hataları için özel mesaj
    if (err.name === 'NetworkError' || err.message.includes('bağlanılamıyor') || err.message.includes('yanıt alınamadı')) {
      error.value = 'Supabase\'e bağlanılamıyor. .env dosyasındaki VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.'
    } else {
      // Diğer hatalar için genel mesaj
      error.value = err.message || 'Kayıt olurken bir hata oluştu'
    }
  } finally {
    // Her durumda yüklenme durumunu kapat
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>


