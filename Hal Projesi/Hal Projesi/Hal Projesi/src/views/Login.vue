<template>
  <!-- Tam yükseklik container - Sayfayı ortalar -->
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <!-- Responsive kolon genişlikleri: Mobilde tam genişlik, tablette 8/12, masaüstünde 5/12 -->
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Giriş formu kartı -->
        <v-card class="elevation-12 pa-6">
          <!-- Kart başlığı - Logo ve başlık -->
          <v-card-title class="text-center mb-6">
            <div class="mx-auto">
              <v-icon size="64" color="primary" class="mb-4">mdi-store</v-icon>
              <h1 class="text-h4 font-weight-bold mb-2">Hal Yönetim Sistemi</h1>
              <p class="text-body-2 text-medium-emphasis">Halci Girişi</p>
            </div>
          </v-card-title>

          <!-- Form içeriği -->
          <v-card-text>
            <!-- Vuetify form bileşeni - Form validasyonu için -->
            <v-form ref="loginForm" v-model="valid">
              <!-- Email input alanı -->
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                class="mb-4"
                required
              ></v-text-field>

              <!-- Şifre input alanı -->
              <v-text-field
                v-model="sifre"
                label="Şifre"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required]"
                variant="outlined"
                class="mb-4"
                required
              ></v-text-field>

              <!-- Hata mesajı gösterimi -->
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

              <!-- Giriş yap butonu -->
              <v-btn
                color="primary"
                size="large"
                block
                :disabled="!valid || loading"
                :loading="loading"
                @click="handleLogin"
                class="mb-4"
              >
                Giriş Yap
              </v-btn>
            </v-form>
          </v-card-text>

          <!-- Kayıt ol linki -->
          <v-card-actions class="justify-center">
            <span class="text-body-2 text-medium-emphasis">
              Hesabınız yok mu?
              <router-link to="/register" class="text-primary text-decoration-none">
                Kayıt Ol
              </router-link>
            </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- 
  Login.vue - Giriş Sayfası
  Kullanıcıların email ve şifre ile giriş yaptığı sayfa
-->
<script setup>
// Vue 3 Composition API - reactive değişkenler için
import { ref } from 'vue'
// Vue Router - sayfa yönlendirme için
import { useRouter } from 'vue-router'
// Auth store - giriş işlemleri için
import { useAuthStore } from '@/stores/auth'

// Router instance'ını al
const router = useRouter()
// Auth store'unu al
const authStore = useAuthStore()

// Form verileri - reactive değişkenler
const email = ref('') // Email input değeri
const sifre = ref('') // Şifre input değeri
const showPassword = ref(false) // Şifre göster/gizle durumu
const valid = ref(false) // Form geçerlilik durumu (Vuetify form tarafından otomatik güncellenir)
const loading = ref(false) // Yüklenme durumu (API çağrısı sırasında true)
const error = ref('') // Hata mesajı

// Form validasyon kuralları
const rules = {
  // Zorunlu alan kontrolü - Boş olamaz
  required: (value) => !!value || 'Bu alan zorunludur',
  // Email format kontrolü - Regex ile email formatını kontrol eder
  email: (value) => {
    if (!value) return true // Boşsa geçerli (required kuralı zaten var)
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email regex pattern
    return pattern.test(value) || 'Geçerli bir email adresi giriniz'
  }
}

/**
 * Giriş yapma fonksiyonu
 * Form validasyonunu kontrol eder, API'ye istek gönderir ve başarılı olursa ana sayfaya yönlendirir
 */
const handleLogin = async () => {
  // Eğer form geçersizse işlemi durdur
  if (!valid.value) return

  // Yüklenme durumunu aktif et ve hata mesajını temizle
  loading.value = true
  error.value = ''

  try {
    // Auth store'daki login fonksiyonunu çağır
    await authStore.login(email.value, sifre.value)
    // Başarılı olursa ana sayfaya yönlendir
    router.push('/')
  } catch (err) {
    // Hata durumunda hata mesajını göster
    error.value = err.message || 'Giriş yapılırken bir hata oluştu'
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




