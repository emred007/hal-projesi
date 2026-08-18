/**
 * stores/auth.js - Kimlik Doğrulama Store'u
 * 
 * Bu dosya kullanıcı oturum yönetimini sağlar:
 * - Giriş yapma (login)
 * - Kayıt olma (register)
 * - Çıkış yapma (logout)
 * - Oturum bilgilerini saklama (localStorage)
 * - Kullanıcı bilgilerini güncelleme
 */

// Pinia store oluşturma fonksiyonu
import { defineStore } from 'pinia'
// Vue 3 reactive değişkenler ve computed property'ler için
import { ref, computed } from 'vue'
// Halci API servis fonksiyonları
import { halciService } from '@/services/api'

// Auth store'unu tanımlıyoruz - Composition API syntax kullanıyoruz
export const useAuthStore = defineStore('auth', () => {
  // Halci (kullanıcı) bilgilerini tutan reactive değişken
  const halci = ref(null)
  // JWT token veya oturum token'ını tutan reactive değişken
  // localStorage'dan varsa yüklenir, yoksa null
  const token = ref(localStorage.getItem('hal_token') || null)

  // Kullanıcının giriş yapıp yapmadığını kontrol eden computed property
  // Halci veya token varsa true döner
  const isAuthenticated = computed(() => !!halci.value || !!token.value)

  /**
   * Giriş yapma fonksiyonu
   * @param {string} email - Kullanıcı email adresi
   * @param {string} sifre - Kullanıcı şifresi
   * @returns {Object} - Başarı durumu ve halci bilgileri
   */
  const login = async (email, sifre) => {
    try {
      // Tüm halcileri API'den çekiyoruz
      const halciler = await halciService.getAll()
      // Email, şifre ve aktif durumuna göre kullanıcıyı buluyoruz
      const foundHalci = halciler.find(
        h => h.email === email && h.sifre === sifre && h.aktif === true
      )

      // Eğer kullanıcı bulunamazsa hata fırlat
      if (!foundHalci) {
        throw new Error('Email veya şifre hatalı, veya hesap aktif değil')
      }

      // Kullanıcı bulundu, bilgileri store'a kaydet
      halci.value = foundHalci
      // Benzersiz bir token oluştur (halci ID + zaman damgası)
      token.value = `token_${foundHalci.id}_${Date.now()}`
      // Token'ı tarayıcı localStorage'ına kaydet
      localStorage.setItem('hal_token', token.value)
      // Halci bilgilerini JSON formatında localStorage'a kaydet
      localStorage.setItem('hal_halci', JSON.stringify(foundHalci))

      // Başarılı giriş bilgisini döndür
      return { success: true, halci: foundHalci }
    } catch (error) {
      console.error('Giriş hatası:', error)
      throw error // Hatayı yukarı fırlat (Login.vue'da yakalanacak)
    }
  }

  /**
   * Kayıt olma fonksiyonu
   * @param {Object} halciData - Yeni halci bilgileri (ad, soyad, email, vb.)
   * @returns {Object} - Başarı durumu ve yeni halci bilgileri
   */
  const register = async (halciData) => {
    try {
      // Email kontrolü - Aynı email zaten kayıtlı mı?
      const halciler = await halciService.getAll()
      const emailExists = halciler.some(h => h.email === halciData.email)
      
      if (emailExists) {
        throw new Error('Bu email adresi zaten kullanılıyor')
      }

      // Vergi numarası kontrolü - Aynı vergi numarası zaten kayıtlı mı?
      const vergiExists = halciler.some(h => h.vergiNumarasi === halciData.vergiNumarasi)
      
      if (vergiExists) {
        throw new Error('Bu vergi numarası zaten kayıtlı')
      }

      // Yeni halci kaydı oluştur
      // Kayıt tarihini bugünün tarihi olarak ayarla
      // Aktif durumunu true olarak ayarla
      const newHalci = await halciService.create({
        ...halciData, // Tüm halci bilgilerini kopyala
        kayitTarihi: new Date().toISOString().split('T')[0], // Bugünün tarihi (YYYY-MM-DD)
        aktif: true // Yeni kayıtlar otomatik aktif
      })

      // Yeni halci bilgilerini store'a kaydet
      halci.value = newHalci
      // Benzersiz token oluştur
      token.value = `token_${newHalci.id}_${Date.now()}`
      // Token'ı localStorage'a kaydet
      localStorage.setItem('hal_token', token.value)
      // Halci bilgilerini localStorage'a kaydet
      localStorage.setItem('hal_halci', JSON.stringify(newHalci))

      // Başarılı kayıt bilgisini döndür
      return { success: true, halci: newHalci }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      // Network hatalarını olduğu gibi yukarı fırlat (Register.vue'da özel mesaj gösterilecek)
      if (error.name === 'NetworkError' || error.name === 'RequestError' || error.message.includes('bağlanılamıyor') || error.message.includes('yanıt alınamadı')) {
        throw error
      }
      // Diğer hataları da fırlat
      throw error
    }
  }

  /**
   * Çıkış yapma fonksiyonu
   * Tüm oturum bilgilerini temizler (store ve localStorage)
   */
  const logout = () => {
    halci.value = null // Store'daki halci bilgisini temizle
    token.value = null // Store'daki token'ı temizle
    localStorage.removeItem('hal_token') // localStorage'dan token'ı sil
    localStorage.removeItem('hal_halci') // localStorage'dan halci bilgisini sil
    // Router navigation component'ten yapılacak (App.vue'da handleLogout)
  }

  /**
   * Oturum bilgilerini yükleme fonksiyonu
   * Sayfa yenilendiğinde veya uygulama açıldığında localStorage'dan
   * kayıtlı oturum bilgilerini yükler (kullanıcıyı otomatik giriş yaptırır)
   */
  const initAuth = () => {
    // localStorage'dan kayıtlı halci bilgisini al
    const storedHalci = localStorage.getItem('hal_halci')
    // Eğer hem halci hem de token varsa oturumu geri yükle
    if (storedHalci && token.value) {
      try {
        // JSON string'i JavaScript objesine çevir
        halci.value = JSON.parse(storedHalci)
      } catch (error) {
        console.error('Oturum bilgileri yüklenirken hata:', error)
        // Hatalı veriyi temizle (bozuk JSON vb.)
        halci.value = null
        token.value = null
        localStorage.removeItem('hal_token')
        localStorage.removeItem('hal_halci')
      }
    }
  }

  /**
   * Halci bilgilerini güncelleme fonksiyonu
   * @param {Object} updatedHalci - Güncellenmiş halci bilgileri
   */
  const updateHalci = (updatedHalci) => {
    halci.value = updatedHalci // Store'u güncelle
    localStorage.setItem('hal_halci', JSON.stringify(updatedHalci)) // localStorage'ı güncelle
  }

  // Store'dan dışa aktarılacak değişkenler ve fonksiyonlar
  return {
    halci, // Halci bilgileri (reactive)
    token, // Oturum token'ı (reactive)
    isAuthenticated, // Giriş durumu (computed)
    login, // Giriş yapma fonksiyonu
    register, // Kayıt olma fonksiyonu
    logout, // Çıkış yapma fonksiyonu
    initAuth, // Oturum yükleme fonksiyonu
    updateHalci // Halci güncelleme fonksiyonu
  }
})

