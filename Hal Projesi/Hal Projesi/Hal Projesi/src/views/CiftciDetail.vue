<!-- 
  CiftciDetail.vue - Çiftçi Detay Sayfası
  Belirli bir çiftçinin bilgilerini ve ürünlerini gösterir
  Ürün ekleme, düzenleme, silme işlemlerini yönetir
-->
<template>
  <v-container fluid>
    <v-row v-if="yukleniyor">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="!ciftci">
      <v-col cols="12">
        <v-card class="text-center pa-8">
          <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Çiftçi bulunamadı</h3>
          <v-btn color="primary" @click="anaSayfayaDon">Ana Sayfaya Dön</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Üst Başlık ve Geri Butonu -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn
              icon
              variant="text"
              class="mr-3"
              @click="anaSayfayaDon"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div class="flex-grow-1">
              <h1 class="text-h4 font-weight-bold">{{ capitalizeName(ciftci.adSoyad) }}</h1>
              <p class="text-body-2 text-medium-emphasis">Çiftçi Profili ve Ürün Takibi</p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-package-variant-plus"
              @click="urunDialogunuAc"
            >
              Ürün Ekle
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- Çiftçi Bilgileri -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-avatar
                color="primary"
                size="64"
                class="mr-3"
              >
                <span class="text-h4">{{ ciftci.adSoyad?.charAt(0)?.toUpperCase() || '?' }}</span>
              </v-avatar>
              <div>
                <div class="text-h6">{{ capitalizeName(ciftci.adSoyad) }}</div>
                <v-chip
                  :color="ciftci.aktif ? 'success' : 'grey'"
                  size="small"
                  variant="flat"
                >
                  {{ ciftci.aktif ? 'Aktif' : 'Pasif' }}
                </v-chip>
              </div>
            </v-card-title>

            <v-card-text>
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon size="20" class="mr-2" color="primary">mdi-phone</v-icon>
                  <span class="text-body-1">{{ ciftci.telefon }}</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon size="20" class="mr-2" color="primary">mdi-card-account-details</v-icon>
                  <span class="text-body-1">{{ ciftci.tcKimlik }}</span>
                </div>
                <div class="d-flex align-start mb-2">
                  <v-icon size="20" class="mr-2 mt-1" color="primary">mdi-map-marker</v-icon>
                  <span class="text-body-1">{{ ciftci.adres }}</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon size="20" class="mr-2" color="primary">mdi-calendar</v-icon>
                  <span class="text-body-1">Kayıt: {{ tarihiFormatla(ciftci.kayitTarihi) }}</span>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div v-if="ciftci.notlar">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">Notlar</h3>
                <p class="text-body-2">{{ ciftci.notlar }}</p>
              </div>

              <v-btn
                block
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                class="mt-4"
                @click="ciftciDuzenleDialogunuAc"
              >
                Bilgileri Düzenle
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- İstatistikler -->
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-chart-box</v-icon>
              İstatistikler
            </v-card-title>
            <v-card-text>
              <div class="text-center">
                <div class="text-h3 font-weight-bold text-primary">{{ urunler.length }}</div>
                <div class="text-body-2 text-medium-emphasis">Toplam Ürün</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Ürünler Listesi -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-package-variant</v-icon>
              Ürünler ({{ urunler.length }})
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text v-if="urunlerYukleniyor" class="text-center pa-8">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-card-text>

            <v-card-text v-else-if="urunler.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
              <h3 class="text-h6 mb-2">Henüz ürün kaydı yok</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">Bu çiftçi için ilk ürünü ekleyin</p>
              <v-btn color="primary" @click="urunDialogunuAc">Ürün Ekle</v-btn>
            </v-card-text>

            <v-card-text v-else>
              <v-row>
                <v-col
                  v-for="urun in urunler"
                  :key="urun.id"
                  cols="12"
                  sm="6"
                  lg="4"
                >
                  <v-card
                    class="urun-card"
                    hover
                  >
                    <v-card-title class="d-flex align-center">
                      <v-avatar
                        :color="urun.urunTipi === 'Sebze' ? 'green' : 'orange'"
                        size="40"
                        class="mr-3"
                      >
                        <v-icon color="white">
                          {{ urun.urunTipi === 'Sebze' ? 'mdi-carrot' : 'mdi-apple' }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-h6">{{ urun.urunAdi }}</div>
                      </div>
                    </v-card-title>

                    <v-card-text>
                      <div class="mb-2">
                        <span class="text-h6 font-weight-bold text-primary">{{ urun.fiyat }} ₺</span>
                        <span class="text-body-2 text-medium-emphasis"> / {{ urun.birim }}</span>
                      </div>
                      <div class="mb-2">
                        <span class="text-body-2 font-weight-medium">Miktar: </span>
                        <span class="text-body-2">{{ urun.miktar }} {{ urun.birim }}</span>
                      </div>
                      <div class="mb-2">
                        <v-chip size="small" variant="outlined" class="mr-2">{{ urun.kalite }}</v-chip>
                        <v-chip
                          size="small"
                          :color="durumRenginiAl(urun.durum)"
                          variant="flat"
                        >
                          {{ urun.durum }}
                        </v-chip>
                      </div>
                      <v-divider class="my-2"></v-divider>
                      <div class="text-caption text-medium-emphasis mb-1">
                        <v-icon size="14" class="mr-1">mdi-calendar-arrow-right</v-icon>
                        Geliş: {{ tarihiFormatla(urun.gelisTarihi) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        <v-icon size="14" class="mr-1">mdi-calendar-alert</v-icon>
                        SKT: {{ tarihiFormatla(urun.sonKullanimTarihi) }}
                      </div>
                      <div v-if="urun.notlar" class="mt-3 pt-2 border-t">
                        <div class="text-body-2">
                          <v-icon size="16" class="mr-1">mdi-note-text</v-icon>
                          {{ urun.notlar }}
                        </div>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="info"
                        @click="fisDialogunuAc(urun)"
                      >
                        <v-icon>mdi-receipt</v-icon>
                        <v-tooltip activator="parent" location="top">Fiş</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        @click="urunDuzenleDialogunuAc(urun)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="top">Düzenle</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="urunuSilOnayAc(urun)"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top">Sil</v-tooltip>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Ürün Ekleme/Düzenleme Dialog -->
    <v-dialog v-model="urunDialogu" max-width="700" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h5">{{ duzenlenenUrun ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="urunDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="urunFormuRef" v-model="urunGecerli">
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="urunFormu.urunAdi"
                  label="Ürün Çeşidi *"
                  :items="urunCesitleri"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-package-variant"
                  placeholder="İsimle ara veya seçin"
                  clearable
                  variant="outlined"
                  density="comfortable"
                  no-data-text="Ürün bulunamadı"
                  :menu-props="{ maxHeight: 320 }"
                  auto-select-first
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="urunFormu.miktar"
                  label="Miktar *"
                  type="number"
                  :rules="[rules.required, rules.positive]"
                  prepend-inner-icon="mdi-scale-balance"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="urunFormu.birim"
                  label="Birim *"
                  :items="['kg', 'adet', 'paket', 'demet']"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-weight"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="urunFormu.fiyat"
                  label="Fiyat (₺) *"
                  type="number"
                  step="0.01"
                  :rules="[rules.required, rules.positive]"
                  prepend-inner-icon="mdi-currency-try"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="urunFormu.kalite"
                  label="Kalite *"
                  :items="['A Sınıfı', 'B Sınıfı', 'C Sınıfı', 'D Sınıfı']"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-star"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="urunFormu.gelisTarihi"
                  label="Geliş Tarihi *"
                  type="date"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-calendar-arrow-right"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="urunFormu.notlar"
                  label="Notlar"
                  rows="3"
                  prepend-inner-icon="mdi-note-text"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="urunDialogunuKapat">İptal</v-btn>
          <v-btn
            color="primary"
            :disabled="!urunGecerli || urunKaydediliyor"
            :loading="urunKaydediliyor"
            @click="urunuKaydet"
          >
            Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Çiftçi Düzenleme Dialog (Home.vue'daki gibi) -->
    <v-dialog v-model="duzenleDialogu" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h5">Çiftçi Bilgilerini Düzenle</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="duzenleDialogu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="editFormRef" v-model="duzenleGecerli">
            <v-text-field
              v-model="ciftciDuzenleFormu.adSoyad"
              label="Ad Soyad *"
              :rules="[rules.required, rules.adSoyad]"
              prepend-inner-icon="mdi-account"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="ciftciDuzenleFormu.telefon"
              label="Telefon *"
              :rules="[rules.required, rules.telefon]"
              prepend-inner-icon="mdi-phone"
              maxlength="11"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="ciftciDuzenleFormu.tcKimlik"
              label="TC Kimlik No *"
              :rules="[rules.required, rules.tcKimlik]"
              prepend-inner-icon="mdi-card-account-details"
              maxlength="11"
              inputmode="numeric"
              @input="tcKimlikFormatla"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="ciftciDuzenleFormu.adres"
              label="Adres *"
              :rules="[rules.required, rules.adres]"
              prepend-inner-icon="mdi-map-marker"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-textarea
              v-model="ciftciDuzenleFormu.notlar"
              label="Notlar"
              :rules="[rules.notlar]"
              prepend-inner-icon="mdi-note-text"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-switch
              v-model="ciftciDuzenleFormu.aktif"
              label="Aktif"
              color="success"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            :disabled="ciftciKaydediliyor || ciftciSiliniyor"
            :loading="ciftciSiliniyor"
            @click="ciftciyiSil"
          >
            Çiftçiyi Sil
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="duzenleDialogu = false">İptal</v-btn>
          <v-btn
            color="primary"
            :disabled="!duzenleGecerli || ciftciKaydediliyor || ciftciSiliniyor"
            :loading="ciftciKaydediliyor"
            @click="ciftciyiKaydet"
          >
            Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Çiftçi Silme Onay Dialog -->
    <v-dialog v-model="ciftciSilmeOnayDialogu" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-h5">Çiftçiyi Sil</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-6">
          <div class="text-center mb-4">
            <v-icon size="64" color="error" class="mb-4">mdi-delete-alert</v-icon>
          </div>
          <p class="text-body-1 text-center mb-2">
            <strong>"{{ capitalizeName(ciftci?.adSoyad || '') }}"</strong> adlı çiftçiyi silmek istediğinize emin misiniz?
          </p>
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-body-2">
              <strong>Dikkat:</strong> Bu işlem geri alınamaz ve çiftçinin tüm ürünleri de silinecektir.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="ciftciSilmeOnayDialogu = false"
            :disabled="ciftciSiliniyor"
          >
            İptal
          </v-btn>
          <v-btn
            color="error"
            :disabled="ciftciSiliniyor"
            :loading="ciftciSiliniyor"
            @click="ciftciyiSilOnayla"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ürün Silme Onay Dialog -->
    <v-dialog v-model="urunSilmeOnayDialogu" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-h5">Ürünü Sil</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-6">
          <div class="text-center mb-4">
            <v-icon size="64" color="error" class="mb-4">mdi-delete-alert</v-icon>
          </div>
          <p class="text-body-1 text-center mb-2">
            <strong>"{{ secilenSilinecekUrun?.urunAdi || '' }}"</strong> adlı ürünü silmek istediğinize emin misiniz?
          </p>
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-body-2">
              <strong>Dikkat:</strong> Bu işlem geri alınamaz.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="urunSilmeOnayDialogu = false"
            :disabled="urunSiliniyor"
          >
            İptal
          </v-btn>
          <v-btn
            color="error"
            :disabled="urunSiliniyor"
            :loading="urunSiliniyor"
            @click="urunuSilOnayla"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Fiş Dialog -->
    <v-dialog v-model="fisDialogu" max-width="700" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-receipt</v-icon>
          <span class="text-h5">Ürün Fişi</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="fisDialogu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fis-content">
          <!-- Fiş Başlık -->
          <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-2">{{ halci?.sirketAdi || 'Hal Yönetim Sistemi' }}</h2>
            <p class="text-body-2 text-medium-emphasis">{{ halci?.adres || '' }}</p>
            <p class="text-body-2 text-medium-emphasis">Tel: {{ halci?.telefon || '' }}</p>
            <v-divider class="my-4"></v-divider>
            <p class="text-body-1 font-weight-bold">ÜRÜN FİŞİ</p>
            <p class="text-caption">{{ new Date().toLocaleDateString('tr-TR') }} {{ new Date().toLocaleTimeString('tr-TR') }}</p>
          </div>

          <!-- Çiftçi Bilgileri -->
          <div class="mb-4" v-if="ciftci">
            <h3 class="text-h6 font-weight-bold mb-3">Çiftçi Bilgileri</h3>
            <div class="mb-2">
              <span class="font-weight-medium">Ad Soyad:</span>
              <span class="ml-2">{{ capitalizeName(ciftci.adSoyad) }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Telefon:</span>
              <span class="ml-2">{{ ciftci.telefon }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">TC Kimlik:</span>
              <span class="ml-2">{{ ciftci.tcKimlik }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Adres:</span>
              <span class="ml-2">{{ ciftci.adres }}</span>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Ürün Bilgileri -->
          <div class="mb-4" v-if="secilenFisUrunu">
            <h3 class="text-h6 font-weight-bold mb-3">Ürün Bilgileri</h3>
            <div class="mb-2">
              <span class="font-weight-medium">Ürün Adı:</span>
              <span class="ml-2">{{ secilenFisUrunu.urunAdi }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Birim:</span>
              <span class="ml-2">{{ secilenFisUrunu.birim }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Miktar:</span>
              <span class="ml-2">{{ secilenFisUrunu.miktar }} {{ secilenFisUrunu.birim }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Kalite:</span>
              <span class="ml-2">{{ secilenFisUrunu.kalite || '-' }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Fiyat:</span>
              <span class="ml-2">{{ secilenFisUrunu.fiyat ? secilenFisUrunu.fiyat.toFixed(2) + ' ₺' : '-' }}</span>
            </div>
            <div class="mb-2">
              <span class="font-weight-medium">Geliş Tarihi:</span>
              <span class="ml-2">{{ tarihiFormatla(secilenFisUrunu.gelisTarihi) }}</span>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Özet -->
          <div class="text-right" v-if="secilenFisUrunu">
            <div class="mb-2">
              <span class="font-weight-bold text-h6">Miktar: {{ secilenFisUrunu.miktar }} {{ secilenFisUrunu.birim }}</span>
            </div>
            <div v-if="secilenFisUrunu.fiyat" class="mb-2">
              <span class="font-weight-bold text-h6">Toplam: {{ (secilenFisUrunu.miktar * secilenFisUrunu.fiyat).toFixed(2) }} ₺</span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="fisDialogu = false">Kapat</v-btn>
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-printer" @click="fisiYazdir">
            Yazdır
          </v-btn>
          <v-btn color="success" variant="outlined" prepend-icon="mdi-download" @click="fisiIndir">
            İndir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
// Vue 3 Composition API
import { ref, computed, onMounted, nextTick, watch } from 'vue'
// Vue Router - sayfa parametrelerini ve yönlendirme için
import { useRoute, useRouter } from 'vue-router'
// API servisleri - çiftçi ve ürün işlemleri için
import { ciftciService, urunService } from '@/services/api'
// Auth store - kullanıcı bilgileri için
import { useAuthStore } from '@/stores/auth'

// Router instance'ları
const route = useRoute() // Mevcut sayfa bilgileri ve parametreleri
const router = useRouter() // Programatik yönlendirme
const authStore = useAuthStore()

// Computed ve reactive değişkenler
const halci = computed(() => authStore.halci) // Giriş yapan halci
const ciftci = ref(null) // Çiftçi bilgileri
const urunler = ref([]) // Çiftçinin ürün listesi
const yukleniyor = ref(false) // Çiftçi yüklenme durumu
const urunlerYukleniyor = ref(false) // Ürünler yüklenme durumu
const urunDialogu = ref(false)
const duzenleDialogu = ref(false)
const duzenlenenUrun = ref(null)
const urunFormuRef = ref(null)
const urunGecerli = ref(false)
const duzenleGecerli = ref(false)
const urunKaydediliyor = ref(false)
const ciftciKaydediliyor = ref(false)
const ciftciSiliniyor = ref(false)
const ciftciSilmeOnayDialogu = ref(false)
const urunSilmeOnayDialogu = ref(false)
const secilenSilinecekUrun = ref(null)
const urunSiliniyor = ref(false)
const fisDialogu = ref(false)
const secilenFisUrunu = ref(null)
const editFormRef = ref(null)

// Tüm ürünler listesi (alfabetik sıralı)
const urunCesitleri = [
  'African Cherry Orange', 'Ahududu', 'Ackee', 'Alligator Apple', 'Ananas', 
  'Araza Fruit', 'Armut', 'Aronya', 'Avakado', 'Ayşe Fasulye',
  'Babaco', 'Bacuri', 'Bael Fruit', 'Barbados Kirazı', 'Bezelye', 
  'Beyaz Soğan', 'Beyaz Turp', 'Biberiye', 'Bilimbi', 'Black Sapote (Çikolata Meyvesi)',
  'Böğürtlen', 'Breadfruit', 'Brüksel Lahanası', 'Brokoli',
  'Canistel (Eggfruit)', 'Cherimoya', 'Çekirdekli Üzüm', 'Çekirdeksiz Üzüm', 
  'Çilek', 'Çin Lahanası', 'Cupuaçu', 'Custard Apple',
  'Dereotu', 'Dolma Biber', 'Domates', 'Dut', 'Düz Marul',
  'Ejder Meyvesi', 'Enginar', 'Erik', 'Feijoa',
  'Fesleğen', 'Fiddleheads', 'Göbek Marul', 'Greyfurt', 'Guava',
  'Hardal Otu', 'Havuç', 'Hurma (Taze)', 'Ispanak',
  'Jackfruit', 'Jabuticaba', 'Jalapeño', 'Jambul Fruit', 'Jicama',
  'Kapya Biber', 'Karadut', 'Karnabahar', 'Karpuz', 'Kavun', 
  'Kayısı', 'Kekik', 'Kereviz', 'Kereviz Kökü', 'Kereviz Sapı',
  'Kestane', 'Kişniş', 'Kiraz', 'Kırmızı Elma', 'Kırmızı Soğan', 
  'Kırmızı Turp', 'Kıvırcık Marul', 'Kiwano (Horned Melon)', 'Kivi',
  'Lahana', 'Limon', 'Lime Limon', 'Longan', 'Lychee',
  'Mandalina', 'Mango', 'Maydanoz', 'Miracle Fruit', 'Muz',
  'Nane', 'Naranjilla', 'Nar', 'Nektarin',
  'Olive Fruit Tropikal Türleri', 'Pancar', 'Papaya',
  'Passion Fruit', 'Pastırma Turbu', 'Patates', 'Patlıcan', 
  'Pawpaw', 'Paze', 'Pepino', 'Pequi', 'Pırasa',
  'Purple Mangosteen', 'Rambutan', 'Roka', 'Salatalık',
  'Sapodilla (Sapote)', 'Sarı Elma', 'Sarımsak', 'Semizotu', 
  'Şalgam', 'Şeftali', 'Sivri Biber', 'Soursop',
  'Sugar Apple', 'Su Teresi', 'Tamarind (Ekşi Meyve)', 'Tatlı Mısır', 
  'Taze Bakla', 'Taze Fasulye', 'Taze Soğan', 'Turmeric',
  'White Sapote', 'Yaban Havucu', 'Yaban Mersini', 'Yeşil Elma',
  'Yer Elması', 'Yıldız Meyvesi', 'Zencefil'
].sort((a, b) => a.localeCompare(b, 'tr'))

const urunFormu = ref({
  urunAdi: '',
  urunTipi: 'Sebze', // Varsayılan değer (geriye dönük uyumluluk için)
  miktar: null,
  birim: 'kg',
  fiyat: null,
  kalite: 'A Sınıfı',
  gelisTarihi: new Date().toISOString().split('T')[0],
  sonKullanimTarihi: '',
  durum: 'Beklemede',
  notlar: '',
  ciftciId: null
})


const ciftciDuzenleFormu = ref({
  adSoyad: '',
  telefon: '',
  tcKimlik: '',
  adres: '',
  notlar: '',
  aktif: true
})

const rules = {
  required: (value) => !!value || 'Bu alan zorunludur',
  positive: (value) => (value && value > 0) || 'Pozitif bir değer giriniz',
  adSoyad: (value) => {
    if (!value) return true
    const trimmed = value.trim()
    if (trimmed.length < 2) {
      return 'Ad Soyad en az 2 karakter olmalıdır'
    }
    if (trimmed.length > 100) {
      return 'Ad Soyad en fazla 100 karakter olabilir'
    }
    // Türkçe karakterler dahil sadece harf ve boşluk
    const pattern = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/
    return pattern.test(trimmed) || 'Sadece harf ve boşluk karakterleri kullanılabilir'
  },
  tcKimlik: (value) => {
    if (!value) return true
    const cleaned = value.replace(/\D/g, '') // Sadece rakamları al
    if (cleaned.length === 0) return true // Boşsa geçerli (required kuralı zaten var)
    if (cleaned.length !== 11) {
      return 'TC Kimlik No tam 11 haneli olmalıdır'
    }
    // TC Kimlik No algoritması kontrolü (basit kontrol - ilk hane 0 olamaz)
    if (cleaned.startsWith('0')) {
      return 'TC Kimlik No 0 ile başlayamaz'
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
  notlar: (value) => {
    if (!value) return true // Notlar zorunlu değil
    const trimmed = value.trim()
    if (trimmed.length > 500) {
      return 'Notlar en fazla 500 karakter olabilir'
    }
    return true
  }
}


/**
 * Ana sayfaya dönme fonksiyonu
 * Geri butonuna tıklandığında çalışır
 */
const anaSayfayaDon = () => {
  // Önce state'i temizle
  ciftci.value = null
  urunler.value = []
  urunDialogu.value = false
  fisDialogu.value = false
  duzenleDialogu.value = false
  // Ana sayfaya git
  router.push({ name: 'Home' })
}

/**
 * Çiftçi bilgilerini getirme fonksiyonu
 * URL'deki ID'ye göre çiftçiyi API'den çeker
 * Güvenlik kontrolü yapar - sadece kendi çiftçisini görebilir
 */
const ciftciyiGetir = async () => {
  // Eğer halci giriş yapmamışsa login sayfasına yönlendir
  if (!halci.value) {
    router.push('/login')
    return
  }
  
  yukleniyor.value = true
  try {
    // URL'den çiftçi ID'sini al ve sayıya çevir
    const ciftciId = parseInt(route.params.id)
    // API'den çiftçi bilgilerini çek
    const fetchedCiftci = await ciftciService.getById(ciftciId)
    
    // Güvenlik kontrolü - sadece kendi çiftçisini görebilir
    // Eğer çiftçi başka bir halci'ye aitse ana sayfaya yönlendir
    if (fetchedCiftci.halciId !== halci.value.id) {
      yukleniyor.value = false
      anaSayfayaDon()
      return
    }
    
    // Çiftçi bilgilerini kaydet
    ciftci.value = fetchedCiftci
    // Çiftçinin ürünlerini de getir
    await urunleriGetir()
  } catch (error) {
    console.error('Çiftçi yüklenirken hata:', error)
    ciftci.value = null
    // 404 hatası durumunda çiftçi bulunamadı mesajı gösterilecek
    // Diğer hatalarda ana sayfaya yönlendir
    if (error.response?.status && error.response.status !== 404) {
      yukleniyor.value = false
      anaSayfayaDon()
    }
  } finally {
    yukleniyor.value = false
  }
}

/**
 * Çiftçinin ürünlerini getirme fonksiyonu
 * API'den çiftçi ID'sine göre ürünleri çeker
 */
const urunleriGetir = async () => {
  // Eğer çiftçi yoksa işlemi durdur
  if (!ciftci.value) return
  urunlerYukleniyor.value = true
  try {
    // Çiftçi ID'sine göre ürünleri getir
    urunler.value = await urunService.getByCiftciId(ciftci.value.id)
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error)
  } finally {
    urunlerYukleniyor.value = false
  }
}

const urunDialogunuAc = async () => {
  duzenlenenUrun.value = null
  urunFormu.value = {
    urunAdi: '',
    urunTipi: 'Sebze',
    miktar: null,
    birim: 'kg',
    fiyat: null,
    kalite: 'A Sınıfı',
    gelisTarihi: new Date().toISOString().split('T')[0],
    sonKullanimTarihi: '',
    durum: 'Beklemede',
    notlar: '',
    ciftciId: ciftci.value.id
  }
  urunDialogu.value = true
  // Form validation'ı sıfırla - nextTick ile
  await nextTick()
  if (urunFormuRef.value) {
    urunFormuRef.value.resetValidation()
  }
}

const urunDuzenleDialogunuAc = async (urun) => {
  duzenlenenUrun.value = urun
  urunFormu.value = {
    ...urun,
    gelisTarihi: urun.gelisTarihi || new Date().toISOString().split('T')[0],
    sonKullanimTarihi: urun.sonKullanimTarihi || ''
  }
  urunDialogu.value = true
  // Form validation'ı sıfırla - nextTick ile
  await nextTick()
  if (urunFormuRef.value) {
    urunFormuRef.value.resetValidation()
  }
}

const urunDialogunuKapat = () => {
  urunDialogu.value = false
  duzenlenenUrun.value = null
  // Formu resetle
  urunFormu.value = {
    urunAdi: '',
    urunTipi: 'Sebze',
    miktar: null,
    birim: 'kg',
    fiyat: null,
    kalite: 'A Sınıfı',
    gelisTarihi: new Date().toISOString().split('T')[0],
    sonKullanimTarihi: '',
    durum: 'Beklemede',
    notlar: '',
    ciftciId: null
  }
  // Form validation'ı sıfırla
  if (urunFormuRef.value) {
    urunFormuRef.value.resetValidation()
  }
}

const urunuKaydet = async () => {
  if (!urunGecerli.value) return

  urunKaydediliyor.value = true
  try {
    if (duzenlenenUrun.value) {
      await urunService.update(duzenlenenUrun.value.id, urunFormu.value)
    } else {
      await urunService.create(urunFormu.value)
    }
    await urunleriGetir()
    urunDialogunuKapat()
  } catch (error) {
    console.error('Ürün kaydedilirken hata:', error)
    alert(error.message || 'Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    urunKaydediliyor.value = false
  }
}

const urunuSilOnayAc = (urun) => {
  secilenSilinecekUrun.value = urun
  urunSilmeOnayDialogu.value = true
}

const urunuSilOnayla = async () => {
  if (!secilenSilinecekUrun.value) return

  urunSiliniyor.value = true
  try {
    await urunService.delete(secilenSilinecekUrun.value.id)
    await urunleriGetir()
    urunSilmeOnayDialogu.value = false
    secilenSilinecekUrun.value = null
  } catch (error) {
    console.error('Ürün silinirken hata:', error)
    alert('Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    urunSiliniyor.value = false
  }
}

const ciftciDuzenleDialogunuAc = () => {
  ciftciDuzenleFormu.value = {
    adSoyad: ciftci.value.adSoyad,
    telefon: ciftci.value.telefon,
    tcKimlik: ciftci.value.tcKimlik,
    adres: ciftci.value.adres,
    notlar: ciftci.value.notlar || '',
    aktif: ciftci.value.aktif
  }
  duzenleDialogu.value = true
}

/**
 * İsim formatlama fonksiyonu - Her kelimenin ilk harfini büyük yapar
 * Türkçe karakterleri de destekler
 */
const capitalizeName = (str) => {
  if (!str) return ''
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      if (!word) return ''
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
    })
    .join(' ')
}

const tcKimlikFormatla = () => {
  if (ciftciDuzenleFormu.value.tcKimlik == null) return
  ciftciDuzenleFormu.value.tcKimlik = String(ciftciDuzenleFormu.value.tcKimlik).replace(/\D/g, '')
}

const ciftciyiKaydet = async () => {
  if (!duzenleGecerli.value || !halci.value) return

  ciftciKaydediliyor.value = true
  try {
    // Verileri temizle ve formatla
    const telefonTemiz = ciftciDuzenleFormu.value.telefon.replace(/\D/g, '') // Sadece rakamlar
    const tcKimlikTemiz = ciftciDuzenleFormu.value.tcKimlik.replace(/\D/g, '') // Sadece rakamlar
    
    const ciftciData = {
      ...ciftci.value,
      adSoyad: capitalizeName(ciftciDuzenleFormu.value.adSoyad),
      telefon: telefonTemiz,
      tcKimlik: tcKimlikTemiz,
      adres: ciftciDuzenleFormu.value.adres.trim(),
      notlar: ciftciDuzenleFormu.value.notlar ? ciftciDuzenleFormu.value.notlar.trim() : '',
      aktif: ciftciDuzenleFormu.value.aktif,
      halciId: halci.value.id // Halci ID'yi koru
    }
    
    await ciftciService.update(ciftci.value.id, ciftciData)
    await ciftciyiGetir()
    duzenleDialogu.value = false
  } catch (error) {
    console.error('Çiftçi güncellenirken hata:', error)
    alert('Çiftçi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    ciftciKaydediliyor.value = false
  }
}

/**
 * Çiftçiyi silme onay dialog'unu aç
 */
const ciftciyiSil = () => {
  if (!ciftci.value) return
  ciftciSilmeOnayDialogu.value = true
}

/**
 * Çiftçiyi silme işlemini onayla ve gerçekleştir
 * Çiftçiyi ve tüm ürünlerini siler, ardından ana sayfaya yönlendirir
 */
const ciftciyiSilOnayla = async () => {
  if (!ciftci.value) return
  
  ciftciSiliniyor.value = true
  try {
    // Önce çiftçinin tüm ürünlerini sil
    if (urunler.value && urunler.value.length > 0) {
      for (const urun of urunler.value) {
        try {
          await urunService.delete(urun.id)
        } catch (error) {
          console.error(`Ürün silinirken hata (ID: ${urun.id}):`, error)
        }
      }
    }
    
    // Çiftçiyi sil
    await ciftciService.delete(ciftci.value.id)
    
    // Dialog'ları kapat ve ana sayfaya yönlendir
    ciftciSilmeOnayDialogu.value = false
    duzenleDialogu.value = false
    anaSayfayaDon()
  } catch (error) {
    console.error('Çiftçi silinirken hata:', error)
    alert('Çiftçi silinirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    ciftciSiliniyor.value = false
  }
}

const durumRenginiAl = (durum) => {
  const colors = {
    'Beklemede': 'warning',
    'Onaylandı': 'success',
    'Reddedildi': 'error',
    'Tedarik Edildi': 'info'
  }
  return colors[durum] || 'grey'
}

const tarihiFormatla = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR')
}

const fisDialogunuAc = (urun) => {
  secilenFisUrunu.value = urun
  fisDialogu.value = true
}

const fisiYazdir = () => {
  if (!secilenFisUrunu.value || !ciftci.value || !halci.value) return

  // Fiş için HTML içeriği oluştur
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Ürün Fişi</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        h1 {
          font-size: 18px;
          margin: 10px 0;
        }
        .section {
          margin: 20px 0;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
        }
        .info-row {
          margin: 8px 0;
        }
        .info-label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        .summary {
          margin-top: 30px;
          text-align: right;
        }
        .summary-item {
          margin: 8px 0;
          font-weight: bold;
        }
        .divider {
          border-top: 1px solid #ccc;
          margin: 15px 0;
        }
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${halci.value.sirketAdi || 'Hal Yönetim Sistemi'}</div>
        <div>${halci.value.adres || ''}</div>
        <div>Tel: ${halci.value.telefon || ''}</div>
        <div class="divider"></div>
        <h1>ÜRÜN FİŞİ</h1>
        <div>Tarih: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
      </div>

      <div class="section">
        <div class="section-title">Çiftçi Bilgileri</div>
        <div class="info-row">
          <span class="info-label">Ad Soyad:</span>
          <span>${capitalizeName(ciftci.value.adSoyad)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefon:</span>
          <span>${ciftci.value.telefon}</span>
        </div>
        <div class="info-row">
          <span class="info-label">TC Kimlik:</span>
          <span>${ciftci.value.tcKimlik}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Adres:</span>
          <span>${ciftci.value.adres}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Ürün Bilgileri</div>
        <div class="info-row">
          <span class="info-label">Ürün Adı:</span>
          <span>${secilenFisUrunu.value.urunAdi}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Birim:</span>
          <span>${secilenFisUrunu.value.birim}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Miktar:</span>
          <span>${secilenFisUrunu.value.miktar} ${secilenFisUrunu.value.birim}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Kalite:</span>
          <span>${secilenFisUrunu.value.kalite || '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fiyat:</span>
          <span>${secilenFisUrunu.value.fiyat ? secilenFisUrunu.value.fiyat.toFixed(2) + ' ₺' : '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Geliş Tarihi:</span>
          <span>${tarihiFormatla(secilenFisUrunu.value.gelisTarihi)}</span>
        </div>
      </div>

      <div class="summary">
        <div class="summary-item">Miktar: ${secilenFisUrunu.value.miktar} ${secilenFisUrunu.value.birim}</div>
        ${secilenFisUrunu.value.fiyat ? `<div class="summary-item">Toplam: ${(secilenFisUrunu.value.miktar * secilenFisUrunu.value.fiyat).toFixed(2)} ₺</div>` : ''}
      </div>
    </body>
    </html>
  `

  // Yeni pencere aç
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('Popup engelleyici nedeniyle yazdırma penceresi açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.')
    return
  }

  // HTML içeriğini yaz
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Sayfa yüklendikten sonra yazdır
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Yazdırdıktan sonra pencereyi kapat (isteğe bağlı)
      // printWindow.close()
    }, 250)
  }
}

const fisiIndir = () => {
  if (!secilenFisUrunu.value || !ciftci.value) return

  // Word dosyası için HTML içeriği oluştur
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Ürün Fişi</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 40px;
          direction: ltr;
        }
        h1 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 10px;
        }
        h2 {
          font-size: 18px;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .info-row {
          margin: 10px 0;
          line-height: 1.6;
        }
        .info-label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        .summary {
          margin-top: 30px;
          text-align: right;
          font-size: 16px;
        }
        .summary-item {
          margin: 10px 0;
          font-weight: bold;
        }
        .divider {
          border-top: 1px solid #ccc;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${halci.value?.sirketAdi || 'Hal Yönetim Sistemi'}</div>
        <div>${halci.value?.adres || ''}</div>
        <div>Tel: ${halci.value?.telefon || ''}</div>
        <div class="divider"></div>
        <h1>ÜRÜN FİŞİ</h1>
        <div>Tarih: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
      </div>

      <h2>Çiftçi Bilgileri</h2>
      <div class="info-row">
        <span class="info-label">Ad Soyad:</span>
        <span>${capitalizeName(ciftci.value.adSoyad)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Telefon:</span>
        <span>${ciftci.value.telefon}</span>
      </div>
      <div class="info-row">
        <span class="info-label">TC Kimlik:</span>
        <span>${ciftci.value.tcKimlik}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Adres:</span>
        <span>${ciftci.value.adres}</span>
      </div>

      <h2>Ürün Bilgileri</h2>
      <div class="info-row">
        <span class="info-label">Ürün Adı:</span>
        <span>${secilenFisUrunu.value.urunAdi}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Birim:</span>
        <span>${secilenFisUrunu.value.birim}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Miktar:</span>
        <span>${secilenFisUrunu.value.miktar} ${secilenFisUrunu.value.birim}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Kalite:</span>
        <span>${secilenFisUrunu.value.kalite || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fiyat:</span>
        <span>${secilenFisUrunu.value.fiyat ? secilenFisUrunu.value.fiyat.toFixed(2) + ' ₺' : '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Geliş Tarihi:</span>
        <span>${tarihiFormatla(secilenFisUrunu.value.gelisTarihi)}</span>
      </div>

      <div class="summary">
        <div class="summary-item">Miktar: ${secilenFisUrunu.value.miktar} ${secilenFisUrunu.value.birim}</div>
        ${secilenFisUrunu.value.fiyat ? `<div class="summary-item">Toplam: ${(secilenFisUrunu.value.miktar * secilenFisUrunu.value.fiyat).toFixed(2)} ₺</div>` : ''}
      </div>
    </body>
    </html>
  `

  // Blob oluştur
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  })

  // Dosya adı oluştur
  const fileName = `Fis_${ciftci.value.adSoyad.replace(/\s+/g, '_')}_${secilenFisUrunu.value.urunAdi}_${new Date().toISOString().split('T')[0]}.doc`

  // İndirme linki oluştur ve tıkla
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Route parametresi değişikliklerini izle
 * Aynı component farklı ID ile çağrıldığında çiftçi bilgilerini yeniden yükle
 */
watch(
  () => route.params.id,
  (newId, oldId) => {
    // Eğer ID değiştiyse ve geçerli bir ID ise
    if (newId && newId !== oldId) {
      // State'i temizle
      ciftci.value = null
      urunler.value = []
      // Yeni çiftçi bilgilerini yükle
      ciftciyiGetir()
    }
  },
  { immediate: false }
)

/**
 * Component mount edildiğinde çalışır
 * Sayfa yüklendiğinde çiftçi bilgilerini getirir
 */
onMounted(() => {
  ciftciyiGetir() // Çiftçi bilgilerini getir
})
</script>

<style scoped>
.urun-card {
  height: 100%;
  transition: transform 0.2s;
}

.urun-card:hover {
  transform: translateY(-2px);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.fis-content {
  font-family: 'Courier New', monospace;
}

</style>

