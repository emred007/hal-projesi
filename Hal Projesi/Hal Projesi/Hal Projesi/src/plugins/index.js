/**
 * plugins/index.js - Plugin Kayıt Dosyası
 *
 * Bu dosya tüm Vue eklentilerini kaydeder
 * main.js tarafından otomatik olarak çağrılır
 */

// Vuetify UI framework'ünü import et
import vuetify from './vuetify'

/**
 * Tüm eklentileri Vue uygulamasına kaydeden fonksiyon
 * @param {Object} app - Vue uygulama instance'ı
 */
export function registerPlugins (app) {
  // Vuetify'ı uygulamaya ekle (tüm Vuetify bileşenleri kullanılabilir hale gelir)
  app.use(vuetify)
}
