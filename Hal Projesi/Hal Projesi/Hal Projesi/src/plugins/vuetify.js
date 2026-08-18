/**
 * plugins/vuetify.js - Vuetify Yapılandırması
 *
 * Vuetify UI framework'ünün yapılandırma dosyası
 * Tema renkleri, stil ayarları burada tanımlanır
 * Framework documentation: https://vuetifyjs.com`
 */

// Material Design Icons CSS dosyasını import et (tüm ikonlar için)
import '@mdi/font/css/materialdesignicons.css'
// Vuetify'in temel stillerini import et
import 'vuetify/styles'

// Vuetify oluşturma fonksiyonunu import et
import { createVuetify } from 'vuetify'

/**
 * Vuetify instance'ını oluştur ve yapılandır
 * https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
 */
export default createVuetify({
  // Tema yapılandırması
  theme: {
    defaultTheme: 'light', // Varsayılan tema (açık tema)
    themes: {
      light: {
        // Renk paleti - Material Design renkleri
        colors: {
          primary: '#FF9800', // Turuncu - Ana renk
          secondary: '#FFC107', // Sarı - İkincil renk
          accent: '#FF5722', // Koyu turuncu - Vurgu rengi
          error: '#F44336', // Kırmızı - Hata mesajları
          warning: '#FF9800', // Turuncu - Uyarı mesajları
          info: '#2196F3', // Mavi - Bilgi mesajları
          success: '#4CAF50', // Yeşil - Başarı mesajları
          background: '#FAFAFA', // Arka plan rengi
          surface: '#FFFFFF', // Kart/panel arka plan rengi
          'on-primary': '#FFFFFF', // Primary renk üzerindeki yazı rengi
          'on-secondary': '#000000', // Secondary renk üzerindeki yazı rengi
          'on-surface': '#212121', // Surface üzerindeki yazı rengi
          'on-background': '#212121', // Background üzerindeki yazı rengi
        },
      },
    },
  },
})
