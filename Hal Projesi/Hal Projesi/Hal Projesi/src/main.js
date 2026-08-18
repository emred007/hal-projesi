/**
 * main.js - Uygulamanın Ana Giriş Noktası
 *
 * Bu dosya Vue uygulamasını başlatır, tüm eklentileri yükler ve uygulamayı DOM'a bağlar
 */

// Plugin kayıt fonksiyonunu import ediyoruz (Vuetify vb.)
import { registerPlugins } from '@/plugins'

// Ana uygulama bileşenini import ediyoruz
import App from './App.vue'

// Vue 3'ten uygulama oluşturma fonksiyonunu import ediyoruz
import { createApp } from 'vue'
// Pinia state management kütüphanesini import ediyoruz
import { createPinia } from 'pinia'
// Router yapılandırmasını import ediyoruz
import router from './router'
// Auth store'unu import ediyoruz (kullanıcı oturum bilgileri için)
import { useAuthStore } from './stores/auth'

// Vue uygulamasını oluşturuyoruz (App.vue bileşenini kullanarak)
const app = createApp(App)
// Pinia state management'ı oluşturuyoruz (global state yönetimi için)
const pinia = createPinia()

// Tüm eklentileri kaydediyoruz (Vuetify UI framework'ü dahil)
registerPlugins(app)

// Pinia'yı uygulamaya ekliyoruz (state management aktif)
app.use(pinia)
// Router'ı uygulamaya ekliyoruz (sayfa yönlendirme aktif)
app.use(router)

// Auth store'unu başlatıyoruz - Tarayıcıda kayıtlı oturum bilgilerini yüklüyoruz
const authStore = useAuthStore()
authStore.initAuth() // localStorage'dan kullanıcı bilgilerini kontrol eder

// Uygulamayı HTML'deki #app elementine bağlıyoruz (index.html'deki div)
app.mount('#app')
