<template>
  <!-- Vuetify uygulama container'ı - Tüm Vuetify bileşenleri için gerekli -->
  <v-app class="light-theme app-container">
    <!-- Üst menü çubuğu - Sadece Login ve Register sayfalarında gizlenir -->
    <v-app-bar
      v-if="showAppBar"
      color="primary"
      elevation="2"
      prominent
    >
      <!-- Menü çubuğunun ortası - Başlık (tıklanabilir) -->
          <v-app-bar-title>
        <div
          class="text-white text-decoration-none d-flex align-center cursor-pointer"
          @click="goHome"
          style="cursor: pointer;"
        >
          <v-icon class="mr-2">mdi-fruit-grapes</v-icon>
          Hal Yönetim Sistemi
        </div>
      </v-app-bar-title>

      <!-- Menü çubuğunun sağ tarafı - Kullanıcı menüsü -->
      <template #append>
        <!-- Eğer kullanıcı giriş yapmışsa bildirim ve kullanıcı profil menüsünü göster -->
        <div v-if="authStore.isAuthenticated && authStore.halci" class="d-flex align-center mr-4">
          <!-- Bildirim Menüsü -->
          <v-menu location="bottom end" offset-y>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                class="text-white mr-2"
              >
                <v-badge
                  :content="bekleyenTalepSayisi"
                  :model-value="bekleyenTalepSayisi > 0"
                  color="error"
                  overlap
                >
                  <v-icon>mdi-bell</v-icon>
                </v-badge>
              </v-btn>
            </template>
            <v-card min-width="400" max-height="500">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-bell</v-icon>
                <span>Bildirimler</span>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="talepleriYenile"
                  :loading="taleplerYukleniyor"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-list v-if="!taleplerYukleniyor && gelenTalepler.length > 0" class="pa-0" style="max-height: 500px; overflow-y: auto;">
                <v-list-item
                  v-for="talep in gelenTalepler"
                  :key="talep.id"
                  class="border-b"
                  :class="{ 'bg-grey-lighten-4': acikBildirimler[talep.id] }"
                  @click="toggleBildirimDetay(talep.id)"
                >
                  <template #prepend>
                    <v-avatar
                      :color="talep.urunTipi === 'Sebze' ? 'green' : 'orange'"
                      size="32"
                      class="mr-2"
                    >
                      <v-icon color="white" size="18">
                        {{ talep.urunTipi === 'Sebze' ? 'mdi-carrot' : 'mdi-apple' }}
                      </v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="font-weight-medium text-body-1">
                    {{ talep.urunAdi }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle class="text-caption text-medium-emphasis">
                    {{ talep.miktar }} {{ talep.birim }} • {{ talep.fiyatTeklifi || talep.birimFiyat }} ₺
                  </v-list-item-subtitle>
                  
                  <template #append>
                    <v-icon size="small" :class="{ 'rotate-180': acikBildirimler[talep.id] }">
                      mdi-chevron-down
                    </v-icon>
                  </template>
                  
                  <!-- Detaylar (expandable) -->
                  <v-expand-transition>
                    <div v-if="acikBildirimler[talep.id]" class="pa-3 bg-grey-lighten-5">
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-chip size="x-small" color="primary" variant="flat" class="mr-2">
                            {{ talep.kalite }}
                          </v-chip>
                          <span class="text-caption text-medium-emphasis">
                            {{ talep.talepTarihi }} {{ talep.talepSaati }}
                          </span>
                        </div>
                        
                        <v-divider class="my-2"></v-divider>
                        
                        <div class="mb-2">
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" class="mr-1" color="primary">mdi-account</v-icon>
                            <span class="text-caption"><strong>Alıcı:</strong></span>
                            <span class="text-caption font-weight-bold ml-1">{{ talep.aliciSirketAdi }}</span>
                          </div>
                          <div v-if="talep.aliciHalciAdSoyad" class="text-caption text-medium-emphasis ml-5">
                            {{ talep.aliciHalciAdSoyad }}
                          </div>
                        </div>
                        
                        <div class="mb-2">
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" class="mr-1" color="primary">mdi-scale-balance</v-icon>
                            <span class="text-caption"><strong>Miktar:</strong></span>
                            <span class="text-caption font-weight-bold ml-1 text-primary">
                              {{ talep.miktar }} {{ talep.birim }}
                            </span>
                          </div>
                        </div>
                        
                        <div class="mb-2" v-if="talep.fiyatTeklifi">
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" class="mr-1" color="success">mdi-currency-try</v-icon>
                            <span class="text-caption"><strong>Fiyat Teklifi:</strong></span>
                            <span class="text-caption font-weight-bold ml-1 text-success">
                              {{ talep.fiyatTeklifi }} ₺ / {{ talep.birim }}
                            </span>
                          </div>
                          <div class="text-caption text-medium-emphasis ml-5">
                            Satıcı Fiyatı: {{ talep.birimFiyat }} ₺ / {{ talep.birim }}
                          </div>
                        </div>
                        
                        <div v-else>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" class="mr-1" color="info">mdi-currency-try</v-icon>
                            <span class="text-caption"><strong>Birim Fiyat:</strong></span>
                            <span class="text-caption font-weight-bold ml-1 text-info">
                              {{ talep.birimFiyat }} ₺ / {{ talep.birim }}
                            </span>
                          </div>
                        </div>
                        
                        <v-divider class="my-2"></v-divider>
                        
                        <div class="d-flex align-center justify-space-between mb-2">
                          <div class="d-flex align-center">
                            <v-icon size="16" class="mr-1" color="warning">mdi-cash-multiple</v-icon>
                            <span class="text-caption"><strong>Toplam:</strong></span>
                          </div>
                          <span class="text-body-2 font-weight-bold text-warning">
                            {{ talep.toplamTutar?.toFixed(2) || (talep.miktar * (talep.fiyatTeklifi || talep.birimFiyat)).toFixed(2) }} ₺
                          </span>
                        </div>
                        
                        <div v-if="talep.notlar" class="mt-2 pt-2 border-t">
                          <div class="d-flex align-start">
                            <v-icon size="14" class="mr-1 mt-1" color="grey">mdi-note-text</v-icon>
                            <div>
                              <span class="text-caption font-weight-medium">Notlar:</span>
                              <p class="text-caption text-medium-emphasis mb-0">{{ talep.notlar }}</p>
                            </div>
                          </div>
                        </div>
                        
                        <v-divider class="my-3"></v-divider>
                        
                        <div class="d-flex justify-space-between">
                          <v-btn
                            color="success"
                            size="x-small"
                            prepend-icon="mdi-check"
                            @click.stop="talepOnayla(talep)"
                            :loading="talepIsleniyor === talep.id"
                            variant="flat"
                          >
                            Onayla
                          </v-btn>
                          <v-btn
                            color="error"
                            size="x-small"
                            prepend-icon="mdi-close"
                            @click.stop="talepReddet(talep)"
                            :loading="talepIsleniyor === talep.id"
                            variant="flat"
                          >
                            Reddet
                          </v-btn>
                        </div>
                      </v-card>
                    </div>
                  </v-expand-transition>
                </v-list-item>
              </v-list>
              <v-card-text v-else-if="!taleplerYukleniyor && gelenTalepler.length === 0" class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-bell-off</v-icon>
                <p class="text-body-1">Yeni bildirim yok</p>
              </v-card-text>
              <v-card-text v-else class="text-center pa-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-card-text>
            </v-card>
          </v-menu>

          <!-- Açılır menü (dropdown) -->
          <v-menu location="bottom end">
            <!-- Menüyü açan buton -->
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                class="text-white"
              >
                <!-- Kullanıcı avatarı - Şirket adının ilk harfleri -->
                <v-avatar size="32" class="mr-2">
                  <span>{{ getCompanyInitials }}</span>
                </v-avatar>
                <!-- Şirket adı (sadece orta ve büyük ekranlarda görünür) -->
                <span class="d-none d-md-inline">{{ getCapitalizedCompanyName }}</span>
                <v-icon class="ml-2">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <!-- Menü içeriği -->
            <v-list>
              <!-- Kullanıcı adı ve email -->
              <v-list-item>
                <v-list-item-title class="font-weight-bold">
                  {{ getCapitalizedHalciName }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ authStore.halci.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <!-- Şirket bilgileri -->
              <v-list-item>
                <v-list-item-title class="text-caption">Şirket</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.halci.sirketAdi }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption">Vergi No</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.halci.vergiNumarasi }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <!-- Çıkış yap butonu -->
              <v-list-item @click="handleLogout" class="text-error">
                <v-list-item-title class="d-flex align-center">
                  <v-icon class="mr-2">mdi-logout</v-icon>
                  Çıkış Yap
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <!-- Eğer kullanıcı giriş yapmamışsa ana sayfa butonu göster -->
        <v-btn
          v-else
          icon
          variant="text"
          @click="goHome"
        >
          <v-icon>mdi-home</v-icon>
          <v-tooltip activator="parent" location="bottom">Ana Sayfa</v-tooltip>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Ana içerik alanı - Router ile sayfa içerikleri buraya yüklenir -->
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-app>
</template>

<!-- 
  App.vue - Ana Uygulama Bileşeni
  Bu bileşen tüm sayfaları saran ana layout'u sağlar
  Üst menü çubuğu ve sayfa içeriklerini gösterir
-->
<script setup>
// Vue 3 Composition API - computed property için
import { computed, ref, onMounted, watch } from 'vue'
// Vue Router - sayfa yönlendirme için
import { useRouter, useRoute } from 'vue-router'
// Auth store - kullanıcı oturum bilgileri için
import { useAuthStore } from '@/stores/auth'
// API servisleri
import { talepService, satisService, urunService, ciftciService } from '@/services/api'

// Router ve route instance'larını alıyoruz
const router = useRouter() // Programatik yönlendirme için
const route = useRoute() // Mevcut sayfa bilgileri için
// Auth store'unu kullanıyoruz
const authStore = useAuthStore()

// Bildirim sistemi için reactive değişkenler
const gelenTalepler = ref([])
const taleplerYukleniyor = ref(false)
const talepIsleniyor = ref(null)
const acikBildirimler = ref({}) // Açık olan bildirimlerin ID'lerini tutar

// Bekleyen talep sayısı
const bekleyenTalepSayisi = computed(() => {
  return gelenTalepler.value.filter(t => t.durum === 'Beklemede').length
})

// Üst menü çubuğunun gösterilip gösterilmeyeceğini belirler
// Login ve Register sayfalarında menü çubuğu gizlenir
const showAppBar = computed(() => {
  return route.name !== 'Login' && route.name !== 'Register'
})

// Kullanıcı adının ilk harflerini alır (avatar için)
// Örnek: "Ahmet Yılmaz" -> "AY"
const getInitials = computed(() => {
  if (!authStore.halci) return 'H' // Eğer halci yoksa varsayılan 'H'
  const ad = authStore.halci.ad?.charAt(0) || '' // Adın ilk harfi
  const soyad = authStore.halci.soyad?.charAt(0) || '' // Soyadın ilk harfi
  return (ad + soyad).toUpperCase() || 'H' // Büyük harfe çevir ve birleştir
})

// Şirket adının ilk harflerini alır (avatar için)
// Örnek: "Duman Tarım" -> "DT"
const getCompanyInitials = computed(() => {
  if (!authStore.halci?.sirketAdi) return 'Ş' // Eğer şirket adı yoksa varsayılan 'Ş'
  const words = authStore.halci.sirketAdi.trim().split(/\s+/) // Kelimelere ayır
  if (words.length === 0) return 'Ş'
  // İlk iki kelimenin ilk harflerini al
  const first = words[0]?.charAt(0) || ''
  const second = words[1]?.charAt(0) || ''
  return (first + second).toUpperCase() || 'Ş' // Büyük harfe çevir ve birleştir
})

// Şirket adını baş harfleri büyük olacak şekilde formatlar
// Örnek: "duman tarım" -> "Duman Tarım"
const getCapitalizedCompanyName = computed(() => {
  if (!authStore.halci?.sirketAdi) return ''
  return authStore.halci.sirketAdi
    .split(' ')
    .map(word => {
      if (!word) return ''
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
    })
    .join(' ')
})

// Halci ad ve soyadını baş harfleri büyük olacak şekilde formatlar
// Örnek: "orçun şanlı" -> "Orçun Şanlı"
const getCapitalizedHalciName = computed(() => {
  if (!authStore.halci) return ''
  const ad = authStore.halci.ad || ''
  const soyad = authStore.halci.soyad || ''
  const capitalizeWord = (word) => {
    if (!word) return ''
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  }
  const adCapitalized = capitalizeWord(ad)
  const soyadCapitalized = capitalizeWord(soyad)
  return `${adCapitalized} ${soyadCapitalized}`.trim()
})

// Ana sayfaya yönlendirme fonksiyonu
const goHome = () => {
  if (authStore.isAuthenticated) {
    // Eğer giriş yapılmışsa ana sayfaya git
    router.push('/')
  } else {
    // Eğer giriş yapılmamışsa login sayfasına git
    router.push('/login')
  }
}

// Çıkış yapma fonksiyonu
const handleLogout = () => {
  authStore.logout() // Oturumu kapat (localStorage temizlenir)
  router.push('/login') // Login sayfasına yönlendir
}

/**
 * Gelen talepleri getirme fonksiyonu
 */
const talepleriGetir = async () => {
  if (!authStore.halci) return
  
  taleplerYukleniyor.value = true
  try {
    const tumTalepler = await talepService.getBySaticiHalciId(authStore.halci.id)
    // Sadece beklemede olan talepleri göster
    gelenTalepler.value = tumTalepler.filter(t => t.durum === 'Beklemede')
  } catch (error) {
    console.error('Talepler yüklenirken hata:', error)
  } finally {
    taleplerYukleniyor.value = false
  }
}

/**
 * Talepleri yenileme fonksiyonu
 */
const talepleriYenile = async () => {
  await talepleriGetir()
}

/**
 * Bildirim detaylarını açma/kapama fonksiyonu
 */
const toggleBildirimDetay = (talepId) => {
  acikBildirimler.value[talepId] = !acikBildirimler.value[talepId]
}

/**
 * Talep onaylama fonksiyonu
 */
const talepOnayla = async (talep) => {
  if (!authStore.halci) return
  
  talepIsleniyor.value = talep.id
  
  try {
    // Ürün miktarını kontrol et
    const urun = await urunService.getById(talep.urunId)
    
    if (urun.miktar < talep.miktar) {
      alert('Yeterli stok bulunmamaktadır.')
      talepIsleniyor.value = null
      return
    }

    // Fiyat teklifi varsa onu kullan, yoksa satıcının fiyatını kullan
    const kabulEdilenFiyat = talep.fiyatTeklifi || talep.birimFiyat
    const kabulEdilenToplam = talep.toplamTutar || (talep.miktar * kabulEdilenFiyat)

    // Satış kaydı oluştur (kullanıcı bilgileri ile birlikte)
    const satisTarihi = new Date().toISOString().split('T')[0]
    // Ürün adını talep'ten veya urun'den al (güvenli erişim)
    const urunAdi = talep.urunAdi || urun.urunAdi || 'Bilinmeyen Ürün'
    const kalite = talep.kalite || urun.kalite || 'A Sınıfı'
    const birim = talep.birim || urun.birim || 'kg'
    
    const satis = {
      halciId: authStore.halci.id,
      ciftciId: urun.ciftciId,
      urunId: talep.urunId,
      urunAdi: urunAdi, // Ürün adını güvenli şekilde al
      miktar: talep.miktar,
      birim: birim,
      birimFiyat: kabulEdilenFiyat, // Fiyat teklifi varsa onu kullan
      toplamTutar: kabulEdilenToplam,
      satisTarihi: satisTarihi,
      satisSaati: new Date().toLocaleTimeString('tr-TR'),
      tarih: satisTarihi, // Geçmiş satışlar için (tarih alanı)
      kalite: kalite,
      durum: 'Tamamlandı',
      // Alıcı bilgileri (kullanıcı bilgileri)
      aliciHalciId: talep.aliciHalciId,
      aliciSirketAdi: talep.aliciSirketAdi || '',
      sirketAdi: talep.aliciSirketAdi || '', // Geçmiş satışlar için
      sirketTelefon: talep.aliciSirketTelefon || '',
      sirketAdres: talep.aliciSirketAdres || '',
      sirketVergiNo: talep.aliciSirketVergiNo || '',
      fiyatTeklifi: talep.fiyatTeklifi, // Fiyat teklifini de kaydet
      saticiFiyati: talep.birimFiyat // Satıcının orijinal fiyatını da kaydet
    }

    await satisService.create(satis)

    // Ürün miktarını güncelle
    const yeniMiktar = urun.miktar - talep.miktar
    const guncellenmisUrun = {
      ...urun,
      miktar: yeniMiktar
    }

    if (yeniMiktar <= 0) {
      guncellenmisUrun.durum = 'Tedarik Edildi'
    }

    await urunService.update(urun.id, guncellenmisUrun)

    // Alıcı halcinin stoğuna ürün ekle (Stok Yönetimi çiftçisine)
    try {
      // Alıcı halcinin çiftçilerini getir
      const aliciCiftciler = await ciftciService.getByHalciId(talep.aliciHalciId)
      
      // "Stok Yönetimi" çiftçisini bul veya oluştur
      let stokYonetimiCiftci = aliciCiftciler.find(c => c.adSoyad === 'Stok Yönetimi')
      
      if (!stokYonetimiCiftci) {
        // "Stok Yönetimi" çiftçisi yoksa oluştur
        stokYonetimiCiftci = await ciftciService.create({
          adSoyad: 'Stok Yönetimi',
          telefon: '00000000000',
          tcKimlik: '00000000000',
          adres: 'Sanal Stok Adresi',
          notlar: 'Sistem tarafından otomatik oluşturulan stok yönetim çiftçisi. Satın alınan ürünler buraya eklenir.',
          aktif: true,
          kayitTarihi: new Date().toISOString().split('T')[0],
          halciId: talep.aliciHalciId
        })
      }

      // Alıcı halcinin stoğuna yeni ürün ekle (Stok Yönetimi çiftçisine)
      const yeniUrun = {
        ciftciId: stokYonetimiCiftci.id,
        urunAdi: urunAdi, // Ürün adını güvenli şekilde al
        urunTipi: talep.urunTipi || urun.urunTipi || 'Sebze',
        miktar: talep.miktar,
        birim: birim,
        fiyat: kabulEdilenFiyat, // Kabul edilen fiyat (teklif veya satıcı fiyatı)
        kalite: kalite,
        gelisTarihi: new Date().toISOString().split('T')[0],
        sonKullanimTarihi: urun.sonKullanimTarihi || '',
        durum: 'Onaylandı',
        notlar: `Satın alındı - ${talep.saticiSirketAdi} (${talep.saticiHalciAdSoyad})'dan`
      }

      await urunService.create(yeniUrun)
    } catch (error) {
      console.error('Alıcı stoğuna ürün eklenirken hata:', error)
      // Hata olsa bile satış kaydı oluşturuldu, sadece uyarı ver
      alert('Talep onaylandı ve satış kaydı oluşturuldu, ancak alıcı stoğuna ürün eklenirken bir hata oluştu.')
    }

    // Talebi güncelle
    const guncellenmisTalep = {
      ...talep,
      durum: 'Onaylandı',
      onayTarihi: new Date().toISOString().split('T')[0],
      onaySaati: new Date().toLocaleTimeString('tr-TR')
    }

    await talepService.update(talep.id, guncellenmisTalep)

    // Talepleri yenile
    await talepleriGetir()
    
    alert('Talep onaylandı, satış kaydı oluşturuldu ve ürün alıcı stoğuna eklendi!')
  } catch (error) {
    console.error('Talep onaylanırken hata:', error)
    alert(error.message || 'Talep onaylanırken bir hata oluştu.')
  } finally {
    talepIsleniyor.value = null
  }
}

/**
 * Talep reddetme fonksiyonu
 */
const talepReddet = async (talep) => {
  if (!confirm('Bu talebi reddetmek istediğinize emin misiniz?')) {
    return
  }

  talepIsleniyor.value = talep.id

  try {
    const guncellenmisTalep = {
      ...talep,
      durum: 'Reddedildi',
      redTarihi: new Date().toISOString().split('T')[0],
      redSaati: new Date().toLocaleTimeString('tr-TR')
    }

    await talepService.update(talep.id, guncellenmisTalep)

    // Talepleri yenile
    await talepleriGetir()
    
    alert('Talep reddedildi.')
  } catch (error) {
    console.error('Talep reddedilirken hata:', error)
    alert('Talep reddedilirken bir hata oluştu.')
  } finally {
    talepIsleniyor.value = null
  }
}

// Sayfa yüklendiğinde ve halci değiştiğinde talepleri getir
onMounted(() => {
  if (authStore.halci) {
    talepleriGetir()
  }
})

// Halci değiştiğinde talepleri yenile
watch(() => authStore.halci, (newHalci) => {
  if (newHalci) {
    talepleriGetir()
  } else {
    gelenTalepler.value = []
  }
})

// Her 30 saniyede bir talepleri otomatik yenile
setInterval(() => {
  if (authStore.halci) {
    talepleriGetir()
  }
}, 30000)
</script>

<style>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.light-theme {
  background-color: #FAFAFA !important;
}

.app-container {
  display: flex;
  flex-direction: column;
}

.main-content {
  background-color: #FAFAFA;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 0;
}

.v-container {
  background-color: transparent;
}

.v-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px);
}

.v-btn {
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500;
}

.v-text-field {
  border-radius: 8px;
}

.v-text-field .v-field {
  border-radius: 8px;
}

.v-app-bar-title a {
  color: white;
  text-decoration: none;
}

.v-app-bar-title a:hover {
  opacity: 0.9;
}
</style>
