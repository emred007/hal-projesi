<!-- 
  Home.vue - Ana Sayfa
  Halci'nin çiftçilerini listeler, yeni çiftçi ekleyebilir, stok görüntüleyebilir ve satış yapabilir
-->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ halci ? getCapitalizedHalciName : 'Hal Yönetim Sistemi' }}</h1>
            <p class="text-body-1 text-medium-emphasis">{{ halci ? halci.sirketAdi : 'Çiftçi ve Ürün Takibi' }}</p>
          </div>
          <div class="d-flex">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-account-plus"
              @click="ciftciDialogunuAc"
              class="mr-2"
            >
              Yeni Çiftçi Ekle
            </v-btn>
            <v-btn
              color="info"
              size="large"
              prepend-icon="mdi-package-variant"
              @click="stokDialogunuAc"
              class="mr-2"
            >
              Stok
            </v-btn>
            <v-btn
              color="warning"
              size="large"
              prepend-icon="mdi-cart-arrow-down"
              @click="urunSatinAlDialogunuAc"
              class="mr-2"
            >
              Ürün Satın Al
            </v-btn>
            <v-btn
              color="success"
              size="large"
              prepend-icon="mdi-history"
              @click="gecmisSatislarDialogunuAc"
              class="mr-2"
            >
              Geçmiş Satışlar
            </v-btn>
            <v-btn
              color="error"
              size="large"
              prepend-icon="mdi-logout"
              @click="cikisYap"
            >
              Çıkış Yap
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="yukleniyor">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Yükleniyor...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="ciftciler.length === 0">
      <v-col cols="12">
        <v-card class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-off</v-icon>
          <h3 class="text-h6 mb-2">Henüz çiftçi kaydı yok</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">İlk çiftçiyi eklemek için yukarıdaki butona tıklayın</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="ciftci in ciftciler"
        :key="ciftci.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="ciftci-card"
          hover
          @click="ciftciDetayinaGit(ciftci.id)"
        >
          <v-card-title class="d-flex align-center">
            <v-avatar
              color="primary"
              size="48"
              class="mr-3"
            >
              <span class="text-h6">{{ ciftci.adSoyad.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h6">{{ capitalizeName(ciftci.adSoyad) }}</div>
              <div class="text-caption text-medium-emphasis">
                <v-icon size="14" class="mr-1">mdi-phone</v-icon>
                {{ ciftci.telefon }}
              </div>
            </div>
            <v-chip
              :color="ciftci.aktif ? 'success' : 'grey'"
              size="small"
              variant="flat"
            >
              {{ ciftci.aktif ? 'Aktif' : 'Pasif' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="mb-2">
              <v-icon size="16" class="mr-2">mdi-map-marker</v-icon>
              <span class="text-body-2">{{ ciftci.adres }}</span>
            </div>
            <div class="mb-2">
              <v-icon size="16" class="mr-2">mdi-calendar</v-icon>
              <span class="text-body-2">Kayıt: {{ tarihiFormatla(ciftci.kayitTarihi) }}</span>
            </div>
            <div v-if="ciftci.notlar" class="mt-3">
              <p class="text-caption text-medium-emphasis">{{ ciftci.notlar }}</p>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-account"
              @click.stop="ciftciDetayinaGit(ciftci.id)"
            >
              Profile Git
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Çiftçi Ekleme/Düzenleme Dialog -->
    <v-dialog v-model="ciftciDialogu" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h5">{{ duzenlenenCiftci ? 'Çiftçi Düzenle' : 'Yeni Çiftçi Ekle' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="ciftciDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="ciftciFormuRef" v-model="gecerli">
            <v-text-field
              v-model="ciftciFormu.adSoyad"
              label="Ad Soyad *"
              :rules="[rules.required, rules.adSoyad]"
              prepend-inner-icon="mdi-account"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="ciftciFormu.telefon"
              label="Telefon *"
              :rules="[rules.required, rules.telefon]"
              prepend-inner-icon="mdi-phone"
              maxlength="11"
              @input="telefonuFormatla('ciftciFormu', 'telefon')"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="ciftciFormu.tcKimlik"
              label="TC Kimlik No *"
              :rules="[rules.required, rules.tcKimlik]"
              prepend-inner-icon="mdi-card-account-details"
              maxlength="11"
              inputmode="numeric"
              @input="sadeceRakamFormatla('ciftciFormu', 'tcKimlik')"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="ciftciFormu.adres"
              label="Adres *"
              :rules="[rules.required, rules.adres]"
              prepend-inner-icon="mdi-map-marker"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-textarea
              v-model="ciftciFormu.notlar"
              label="Notlar"
              :rules="[rules.notlar]"
              prepend-inner-icon="mdi-note-text"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-switch
              v-model="ciftciFormu.aktif"
              label="Aktif"
              color="success"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="ciftciDialogunuKapat">İptal</v-btn>
          <v-btn
            color="primary"
            :disabled="!gecerli || kaydediliyor"
            :loading="kaydediliyor"
            @click="ciftciKaydet"
          >
            Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Stok Dialog -->
    <v-dialog v-model="stokDialogu" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          <span class="text-h5">Toplam Stok</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="stokDialogu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text v-if="stokYukleniyor" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <p class="mt-4">Stok bilgileri yükleniyor...</p>
        </v-card-text>

        <v-card-text v-else-if="toplamStok.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
          <h3 class="text-h6 mb-2">Henüz stok kaydı yok</h3>
        </v-card-text>

        <v-card-text v-else class="pa-0">
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Ürün Adı</th>
                <th class="text-left">Kalite</th>
                <th class="text-right">Toplam Miktar</th>
                <th class="text-left">Birim</th>
                <th class="text-right">Birim Fiyat</th>
                <th class="text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(stok, index) in toplamStok" :key="stok.urunAdi + '_' + stok.birim + '_' + stok.kalite">
                <tr>
                  <td>
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        @click="acikStokDetaylari[index] = !acikStokDetaylari[index]"
                        class="mr-1"
                      >
                        <v-icon size="16">
                          {{ acikStokDetaylari[index] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                        </v-icon>
                      </v-btn>
                      <v-avatar
                        :color="stok.urunTipi === 'Sebze' ? 'green' : 'orange'"
                        size="32"
                        class="mr-2"
                      >
                        <v-icon color="white" size="18">
                          {{ stok.urunTipi === 'Sebze' ? 'mdi-carrot' : 'mdi-apple' }}
                        </v-icon>
                      </v-avatar>
                      <span class="font-weight-medium">{{ stok.urunAdi }}</span>
                    </div>
                  </td>
                  <td>
                    <v-chip size="small" variant="outlined">{{ stok.kalite }}</v-chip>
                  </td>
                  <td class="text-right">
                    <span class="font-weight-bold">{{ stok.toplamMiktar }}</span>
                  </td>
                  <td>{{ stok.birim }}</td>
                  <td class="text-right">
                    <div v-if="stok.minFiyat === stok.maxFiyat">
                      <span class="text-primary font-weight-bold">{{ stok.ortalamaFiyat?.toFixed(2) || '-' }} ₺</span>
                    </div>
                    <div v-else>
                      <span class="text-primary font-weight-bold">{{ stok.ortalamaFiyat?.toFixed(2) || '-' }} ₺</span>
                      <div class="text-caption text-medium-emphasis">
                        ({{ stok.minFiyat?.toFixed(2) }} - {{ stok.maxFiyat?.toFixed(2) }} ₺)
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-btn
                      size="small"
                      color="success"
                      prepend-icon="mdi-minus"
                      @click="satisDialogunuAc(stok)"
                      :disabled="stok.toplamMiktar <= 0"
                    >
                      Satış
                    </v-btn>
                  </td>
                </tr>
                <!-- Detaylı Bilgiler Satırı -->
                <tr v-if="acikStokDetaylari[index]">
                  <td colspan="6" class="pa-0">
                    <v-card variant="outlined" class="ma-2">
                      <v-card-text>
                        <div class="text-subtitle-2 font-weight-bold mb-3">Ürün Detayları</div>
                        <v-table density="compact">
                          <thead>
                            <tr>
                              <th>Çiftçi</th>
                              <th>Miktar</th>
                              <th>Birim Fiyat</th>
                              <th>Geliş Tarihi</th>
                              <th>SKT</th>
                              <th>Durum</th>
                              <th>Kaynak</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(detay, detayIndex) in stok.urunDetaylari" :key="detayIndex">
                              <td>
                                <span class="text-body-2">{{ capitalizeName(detay.ciftciAdSoyad) }}</span>
                              </td>
                              <td><strong>{{ detay.miktar }}</strong></td>
                              <td><strong class="text-primary">{{ detay.fiyat?.toFixed(2) || '-' }} ₺</strong></td>
                              <td>{{ detay.gelisTarihi ? tarihiFormatla(detay.gelisTarihi) : '-' }}</td>
                              <td>{{ detay.sonKullanimTarihi ? tarihiFormatla(detay.sonKullanimTarihi) : '-' }}</td>
                              <td>
                                <v-chip
                                  size="x-small"
                                  :color="durumRenginiAl(detay.durum)"
                                  variant="flat"
                                >
                                  {{ detay.durum }}
                                </v-chip>
                              </td>
                              <td>
                                <v-chip
                                  v-if="detay.satinAlindiMi"
                                  size="x-small"
                                  color="warning"
                                  variant="flat"
                                  prepend-icon="mdi-cart-arrow-down"
                                >
                                  Satın Alındı
                                </v-chip>
                                <v-chip
                                  v-else
                                  size="x-small"
                                  color="info"
                                  variant="flat"
                                  prepend-icon="mdi-package-variant"
                                >
                                  Çiftçi
                                </v-chip>
                              </td>
                            </tr>
                          </tbody>
                        </v-table>
                        <div v-if="stok.urunDetaylari.some(d => d.notlar)" class="mt-3">
                          <div class="text-caption font-weight-medium mb-1">Notlar:</div>
                          <div
                            v-for="(detay, detayIndex) in stok.urunDetaylari.filter(d => d.notlar)"
                            :key="detayIndex"
                            class="text-caption text-medium-emphasis mb-1"
                          >
                            • {{ detay.notlar }}
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="stokDialogu = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Satış Dialog -->
    <v-dialog v-model="satisDialogu" max-width="700" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-cart-minus</v-icon>
          <span class="text-h5">Satış Yap</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="satisDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-form ref="satisFormuRef" v-model="satisGecerli">
            <div class="mb-4">
              <v-card variant="outlined" class="pa-3">
                <div class="d-flex align-center mb-2">
                  <v-avatar
                    :color="secilenStok?.urunTipi === 'Sebze' ? 'green' : 'orange'"
                    size="40"
                    class="mr-3"
                  >
                    <v-icon color="white">
                      {{ secilenStok?.urunTipi === 'Sebze' ? 'mdi-carrot' : 'mdi-apple' }}
                    </v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <p class="text-body-1 mb-1 font-weight-bold">{{ secilenStok?.urunAdi }}</p>
                    <div class="d-flex align-center">
                      <v-chip size="small" variant="outlined" class="mr-2">{{ secilenStok?.kalite }}</v-chip>
                      <span class="text-body-2 text-medium-emphasis">{{ secilenStok?.birim }}</span>
                    </div>
                  </div>
                </div>
                <v-divider class="my-2"></v-divider>
                <p class="text-body-2 mb-0">
                  <strong>Mevcut Stok:</strong> 
                  <span class="text-primary font-weight-bold">{{ secilenStok?.toplamMiktar }} {{ secilenStok?.birim }}</span>
                </p>
                <p v-if="secilenStok?.ortalamaFiyat" class="text-body-2 mb-0 mt-1">
                  <strong>Ortalama Birim Fiyat:</strong> 
                  <span class="text-primary font-weight-bold">{{ secilenStok.ortalamaFiyat.toFixed(2) }} ₺</span>
                </p>
              </v-card>
            </div>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 font-weight-bold mb-3">Satış Miktarı</h3>
            <v-text-field
              v-model.number="satisFormu.miktar"
              label="Satış Miktarı *"
              type="number"
              :rules="[rules.required, rules.positive, rules.maxStok]"
              prepend-inner-icon="mdi-scale-balance"
              :max="secilenStok?.toplamMiktar"
              :min="1"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="satisFormu.fiyat"
              label="Birim Fiyat (₺) *"
              type="number"
              :rules="[rules.required, rules.positive]"
              prepend-inner-icon="mdi-currency-try"
              :min="0"
              step="0.01"
              class="mb-4"
            ></v-text-field>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 font-weight-bold mb-3">Müşteri Şirket Bilgileri</h3>
            <v-text-field
              v-model="satisFormu.sirketAdi"
              label="Şirket Adı *"
              :rules="[rules.required]"
              prepend-inner-icon="mdi-office-building"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="satisFormu.sirketTelefon"
              label="Şirket Telefonu *"
              :rules="[rules.required, rules.telefon]"
              prepend-inner-icon="mdi-phone"
              maxlength="11"
              @input="telefonuFormatla('satisFormu', 'sirketTelefon')"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="satisFormu.sirketAdres"
              label="Şirket Adresi"
              :rules="[rules.adres]"
              prepend-inner-icon="mdi-map-marker"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-text-field
              v-model="satisFormu.sirketVergiNo"
              label="Vergi Numarası"
              :rules="[rules.vergiNo]"
              prepend-inner-icon="mdi-card-account-details"
              maxlength="10"
              class="mb-3"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="satisDialogunuKapat">İptal</v-btn>
          <v-btn
            color="success"
            :disabled="!satisGecerli || satisKaydediliyor"
            :loading="satisKaydediliyor"
            @click="satisYap"
          >
            Satış Yap
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Geçmiş Satışlar Dialog -->
    <v-dialog v-model="gecmisSatislarDialogu" max-width="1200" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-history</v-icon>
          <span class="text-h5">Geçmiş Satışlar</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="gecmisSatislarDialogu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-progress-circular
            v-if="gecmisSatislarYukleniyor"
            indeterminate
            color="primary"
            class="d-block mx-auto my-8"
          ></v-progress-circular>

          <div v-else-if="gecmisSatislar.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-off</v-icon>
            <h3 class="text-h6 mb-2">Henüz satış kaydı yok</h3>
            <p class="text-body-2 text-medium-emphasis">Yapılan satışlar burada görüntülenecektir</p>
          </div>

          <v-table v-else>
            <thead>
              <tr>
                <th class="text-left">Tarih</th>
                <th class="text-left">Ürün</th>
                <th class="text-right">Miktar</th>
                <th class="text-left">Birim</th>
                <th class="text-left">Müşteri Şirket</th>
                <th class="text-left">Telefon</th>
                <th class="text-left">Vergi No</th>
                <th class="text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="satis in gecmisSatislar" :key="satis.id">
                <td>{{ tarihiFormatla(satis.tarih) }}</td>
                <td class="font-weight-medium">{{ satis.urunAdi }}</td>
                <td class="text-right">{{ satis.miktar }}</td>
                <td>{{ satis.birim }}</td>
                <td>{{ satis.sirketAdi }}</td>
                <td>{{ satis.sirketTelefon }}</td>
                <td>{{ satis.sirketVergiNo || '-' }}</td>
                <td class="text-center">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-file-document-outline"
                    @click="faturayiIndir(satis)"
                  >
                    Fatura
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="gecmisSatislarDialogu = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Çiftçi Detay Dialog -->
    <v-dialog v-model="ciftciDetayDialogu" max-width="700" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-account</v-icon>
          <span class="text-h5">Çiftçi Detayları</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="ciftciDetayDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text v-if="secilenCiftciDetay" class="pa-6">
          <!-- Çiftçi Başlık -->
          <div class="d-flex align-center mb-6">
            <v-avatar
              color="primary"
              size="80"
              class="mr-4"
            >
              <span class="text-h4">{{ secilenCiftciDetay.adSoyad.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <h2 class="text-h5 font-weight-bold mb-2">{{ capitalizeName(secilenCiftciDetay.adSoyad) }}</h2>
              <v-chip
                :color="secilenCiftciDetay.aktif ? 'success' : 'grey'"
                size="small"
                variant="flat"
              >
                {{ secilenCiftciDetay.aktif ? 'Aktif' : 'Pasif' }}
              </v-chip>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Çiftçi Bilgileri -->
          <div class="mb-4">
            <h3 class="text-h6 font-weight-bold mb-3">Kişisel Bilgiler</h3>
            <div class="mb-3">
              <div class="d-flex align-center mb-2">
                <v-icon size="20" class="mr-3" color="primary">mdi-phone</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Telefon</div>
                  <div class="text-body-1">{{ secilenCiftciDetay.telefon }}</div>
                </div>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="20" class="mr-3" color="primary">mdi-card-account-details</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">TC Kimlik No</div>
                  <div class="text-body-1">{{ secilenCiftciDetay.tcKimlik }}</div>
                </div>
              </div>
              <div class="d-flex align-start mb-2">
                <v-icon size="20" class="mr-3 mt-1" color="primary">mdi-map-marker</v-icon>
                <div class="flex-grow-1">
                  <div class="text-caption text-medium-emphasis">Adres</div>
                  <div class="text-body-1">{{ secilenCiftciDetay.adres }}</div>
                </div>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="20" class="mr-3" color="primary">mdi-calendar</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Kayıt Tarihi</div>
                  <div class="text-body-1">{{ tarihiFormatla(secilenCiftciDetay.kayitTarihi) }}</div>
                </div>
              </div>
            </div>
          </div>

          <v-divider class="my-4" v-if="secilenCiftciDetay.notlar"></v-divider>

          <!-- Notlar -->
          <div v-if="secilenCiftciDetay.notlar" class="mb-4">
            <h3 class="text-h6 font-weight-bold mb-3">Notlar</h3>
            <p class="text-body-1">{{ secilenCiftciDetay.notlar }}</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-right"
            @click="ciftciDetaySayfasinaGit"
          >
            Detay Sayfasına Git
          </v-btn>
          <v-btn color="primary" variant="outlined" @click="ciftciDetayDialogunuKapat">
            Kapat
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ürün Satın Al - Ürün Seçme Dialog -->
    <v-dialog v-model="urunSecmeDialogu" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-cart-arrow-down</v-icon>
          <span class="text-h5">Ürün Seç</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="urunSecmeDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-6">
          <v-form ref="urunSecmeFormuRef" v-model="urunSecmeGecerli">
            <v-autocomplete
              v-model="secilenUrunAdi"
              label="Ürün Adı *"
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
              class="mb-4"
            ></v-autocomplete>

            <v-select
              v-model="secilenKalite"
              label="Kalite *"
              :items="['A Sınıfı', 'B Sınıfı', 'C Sınıfı', 'D Sınıfı']"
              :rules="[rules.required]"
              prepend-inner-icon="mdi-star"
              placeholder="Kalite seçin"
              clearable
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="urunSecmeDialogunuKapat">İptal</v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-magnify"
            :disabled="!urunSecmeGecerli"
            @click="halciStoklariniGetir"
          >
            Halcileri Bul
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Halci Stok Listesi Dialog -->
    <v-dialog v-model="halciStoklariDialogu" max-width="900" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-store</v-icon>
          <span class="text-h5">{{ secilenUrunAdi }} - {{ secilenKalite }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="halciStoklariDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text v-if="halciStoklariYukleniyor" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Halci stokları yükleniyor...</p>
        </v-card-text>

        <v-card-text v-else-if="halciStoklari.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
          <h3 class="text-h6 mb-2">Ürün bulunamadı</h3>
          <p class="text-body-2 text-medium-emphasis">Seçilen kriterlere uygun ürün bulunamadı.</p>
        </v-card-text>

        <v-card-text v-else class="pt-6">
          <v-table>
            <thead>
              <tr>
                <th>Halci</th>
                <th>Şirket Adı</th>
                <th>Miktar</th>
                <th>Birim</th>
                <th>Birim Fiyat</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stok in halciStoklari" :key="stok.halciId">
                <td>{{ stok.halciAdSoyad }}</td>
                <td>{{ stok.sirketAdi }}</td>
                <td><strong>{{ stok.miktar }}</strong></td>
                <td>{{ stok.birim }}</td>
                <td><strong class="text-primary">{{ stok.fiyat }} ₺</strong></td>
                <td>
                  <v-btn
                    color="warning"
                    size="small"
                    prepend-icon="mdi-cart-plus"
                    @click="talepDialogunuAc(stok)"
                  >
                    Talep Gönder
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="halciStoklariDialogunuKapat">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Satın Alma Talebi Dialog -->
    <v-dialog v-model="talepDialogu" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-cart-arrow-down</v-icon>
          <span class="text-h5">Satın Alma Talebi</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="talepDialogunuKapat">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-6" v-if="secilenSaticiHalci">
          <div class="mb-4">
            <v-card variant="outlined" class="pa-4">
              <div class="mb-2">
                <span class="font-weight-medium">Halci:</span>
                <span class="ml-2">{{ secilenSaticiHalci.halciAdSoyad }}</span>
              </div>
              <div class="mb-2">
                <span class="font-weight-medium">Şirket:</span>
                <span class="ml-2">{{ secilenSaticiHalci.sirketAdi }}</span>
              </div>
              <div class="mb-2">
                <span class="font-weight-medium">Ürün:</span>
                <span class="ml-2">{{ secilenUrunAdi }} - {{ secilenKalite }}</span>
              </div>
              <div class="mb-2">
                <span class="font-weight-medium">Mevcut Stok:</span>
                <span class="ml-2"><strong>{{ secilenSaticiHalci.miktar }} {{ secilenSaticiHalci.birim }}</strong></span>
              </div>
              <div>
                <span class="font-weight-medium">Birim Fiyat:</span>
                <span class="ml-2"><strong class="text-primary">{{ secilenSaticiHalci.fiyat }} ₺</strong></span>
              </div>
            </v-card>
          </div>

          <v-form ref="talepFormuRef" v-model="talepGecerli">
            <v-text-field
              v-model.number="talepFormu.miktar"
              label="Talep Miktarı *"
              type="number"
              :rules="[
                rules.required,
                rules.positive,
                (v) => {
                  if (!secilenSaticiHalci) return true
                  if (v > secilenSaticiHalci.miktar) {
                    return `Maksimum ${secilenSaticiHalci.miktar} ${secilenSaticiHalci.birim} talep edebilirsiniz`
                  }
                  return true
                }
              ]"
              :max="secilenSaticiHalci?.miktar"
              :min="0.01"
              :step="0.01"
              prepend-inner-icon="mdi-scale-balance"
              suffix="birim"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="talepFormu.fiyatTeklifi"
              label="Fiyat Teklifi (Birim Fiyat) *"
              type="number"
              :rules="[
                rules.required,
                rules.positive
              ]"
              :min="0.01"
              :step="0.01"
              prepend-inner-icon="mdi-currency-try"
              suffix="₺ / birim"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Ürün için teklif etmek istediğiniz birim fiyat"
              persistent-hint
            ></v-text-field>

            <v-textarea
              v-model="talepFormu.notlar"
              label="Notlar (Opsiyonel)"
              prepend-inner-icon="mdi-note-text"
              rows="3"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-textarea>

            <v-alert
              v-if="talepFormu.miktar && talepFormu.miktar > 0 && talepFormu.fiyatTeklifi && talepFormu.fiyatTeklifi > 0"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-4"
            >
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-medium">Teklif Toplam:</span>
                <span class="text-h6 text-primary font-weight-bold">
                  {{ (talepFormu.miktar * (talepFormu.fiyatTeklifi || 0)).toFixed(2) }} ₺
                </span>
              </div>
              <div v-if="secilenSaticiHalci" class="mt-2 text-caption">
                Satıcı Fiyatı: {{ secilenSaticiHalci.fiyat }} ₺ / {{ secilenSaticiHalci.birim }} 
                (Toplam: {{ (talepFormu.miktar * (secilenSaticiHalci.fiyat || 0)).toFixed(2) }} ₺)
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="talepDialogunuKapat" :disabled="talepGonderiliyor">
            İptal
          </v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-send"
            :disabled="!talepGecerli || talepGonderiliyor"
            :loading="talepGonderiliyor"
            @click="talepGonder"
          >
            Talep Gönder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
// Vue 3 Composition API
import { ref, onMounted, computed } from 'vue'
// Vue Router - sayfa yönlendirme
import { useRouter } from 'vue-router'
// API servisleri - CRUD işlemleri için
import { ciftciService, urunService, satisService, talepService, halciService } from '@/services/api'
// Auth store - kullanıcı bilgileri için
import { useAuthStore } from '@/stores/auth'

// Router ve auth store instance'ları
const router = useRouter()
const authStore = useAuthStore()

// Computed property - Giriş yapan halci bilgileri
const halci = computed(() => authStore.halci)

// Halci ad ve soyadını baş harfleri büyük olacak şekilde formatlar
// Örnek: "orçun şanlı" -> "Orçun Şanlı"
const getCapitalizedHalciName = computed(() => {
  if (!halci.value) return ''
  const ad = halci.value.ad || ''
  const soyad = halci.value.soyad || ''
  const capitalizeWord = (word) => {
    if (!word) return ''
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  }
  const adCapitalized = capitalizeWord(ad)
  const soyadCapitalized = capitalizeWord(soyad)
  return `${adCapitalized} ${soyadCapitalized}`.trim()
})

// Reactive değişkenler
const ciftciler = ref([]) // Çiftçi listesi
const yukleniyor = ref(false) // Yüklenme durumu
const ciftciDialogu = ref(false)
const duzenlenenCiftci = ref(null)
const gecerli = ref(false)
const kaydediliyor = ref(false)
const ciftciFormuRef = ref(null)
const stokDialogu = ref(false)
const stokYukleniyor = ref(false)
const toplamStok = ref([])
const halciUrunleri = ref([]) // Stok hesaplamak için ürün detaylarını saklıyoruz
const acikStokDetaylari = ref({}) // Hangi stok detaylarının açık olduğunu tutar
const satisDialogu = ref(false)
const satisGecerli = ref(false)
const satisKaydediliyor = ref(false)
const satisFormuRef = ref(null)
const secilenStok = ref(null)
const satisFormu = ref({
  miktar: null,
  fiyat: null,
  sirketAdi: '',
  sirketTelefon: '',
  sirketAdres: '',
  sirketVergiNo: ''
})
const fisDialogu = ref(false)
const fisYukleniyor = ref(false)
const secilenFisStoku = ref(null)
const fisUrunDetaylari = ref([])
const gecmisSatislarDialogu = ref(false)
const gecmisSatislarYukleniyor = ref(false)
const gecmisSatislar = ref([])
const urunSatinAlDialogu = ref(false)
const urunSecmeDialogu = ref(false)
const urunSecmeGecerli = ref(false)
const urunSecmeFormuRef = ref(null)
const secilenUrunAdi = ref('')
const secilenKalite = ref('')
const halciStoklariYukleniyor = ref(false)
const halciStoklari = ref([])
const halciStoklariDialogu = ref(false)
const talepDialogu = ref(false)
const talepFormu = ref({
  miktar: null,
  fiyatTeklifi: null,
  notlar: ''
})
const talepGonderiliyor = ref(false)
const secilenSaticiHalci = ref(null)
const talepFormuRef = ref(null)
const talepGecerli = ref(false)
const ciftciDetayDialogu = ref(false)
const secilenCiftciDetay = ref(null)
const ciftciFormu = ref({
  adSoyad: '',
  telefon: '',
  tcKimlik: '',
  adres: '',
  notlar: '',
  aktif: true,
  kayitTarihi: new Date().toISOString().split('T')[0],
  halciId: null
})

// Tüm ürünler listesi (alfabetik sıralı) - CiftciDetail.vue'dan alındı
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

const rules = {
  required: (value) => {
    if (typeof value === 'string') {
      return !!value.trim() || 'Bu alan zorunludur'
    }
    return !!value || 'Bu alan zorunludur'
  },
  adSoyad: (value) => {
    if (!value) return true
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return 'Ad Soyad boş olamaz'
    }
    if (trimmed.length < 2) {
      return 'Ad Soyad en az 2 karakter olmalıdır'
    }
    if (trimmed.length > 100) {
      return 'Ad Soyad en fazla 100 karakter olabilir'
    }
    // Türkçe karakterler dahil sadece harf ve boşluk
    const pattern = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/
    if (!pattern.test(trimmed)) {
      return 'Sadece harf ve boşluk karakterleri kullanılabilir'
    }
    return true
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
    if (trimmed.length === 0) {
      return 'Adres boş olamaz'
    }
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
  },
  positive: (value) => (value && value > 0) || 'Pozitif bir değer giriniz',
  maxStok: (value) => {
    if (!value || !secilenStok.value) return true
    if (value > secilenStok.value.toplamMiktar) {
      return `Satış miktarı mevcut stoktan (${secilenStok.value.toplamMiktar}) fazla olamaz`
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
  vergiNo: (value) => {
    if (!value) return true // Vergi numarası opsiyonel
    const cleaned = value.replace(/\D/g, '') // Sadece rakamları al
    if (cleaned.length === 0) return true // Boşsa geçerli (opsiyonel)
    if (cleaned.length !== 10) {
      return 'Vergi numarası tam 10 haneli olmalıdır'
    }
    return true
  }
}

/**
 * Çiftçileri getirme fonksiyonu
 * API'den tüm çiftçileri çeker ve sadece giriş yapan halci'nin çiftçilerini filtreler
 */
const ciftcileriGetir = async () => {
  // Eğer halci yoksa işlemi durdur
  if (!halci.value) return
  
  yukleniyor.value = true
  try {
    // Tüm çiftçileri API'den çek
    const allCiftciler = await ciftciService.getAll()
    // Sadece giriş yapan halcinin çiftçilerini filtrele ve "Stok Yönetimi" çiftçisini hariç tut
    ciftciler.value = allCiftciler.filter(c => 
      c.halciId === halci.value.id && c.adSoyad !== 'Stok Yönetimi'
    )
  } catch (error) {
    console.error('Çiftçiler yüklenirken hata:', error)
  } finally {
    yukleniyor.value = false
  }
}

const ciftciDialogunuAc = () => {
  if (!halci.value) return
  
  duzenlenenCiftci.value = null
  ciftciFormu.value = {
    adSoyad: '',
    telefon: '',
    tcKimlik: '',
    adres: '',
    notlar: '',
    aktif: true,
    kayitTarihi: new Date().toISOString().split('T')[0],
    halciId: halci.value.id
  }
  // Form validation'ını resetle
  if (ciftciFormuRef.value) {
    setTimeout(() => {
      ciftciFormuRef.value?.resetValidation()
    }, 100)
  }
  ciftciDialogu.value = true
}

const ciftciDialogunuKapat = () => {
  ciftciDialogu.value = false
  duzenlenenCiftci.value = null
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

const ciftciKaydet = async () => {
  if (!halci.value) return
  
  // Form validation'ını kontrol et
  if (ciftciFormuRef.value) {
    const { valid: formValid } = await ciftciFormuRef.value.validate()
    if (!formValid) {
      return
    }
  } else if (!gecerli.value) {
    return
  }

  kaydediliyor.value = true
  try {
    // Verileri temizle ve formatla
    const telefonTemiz = ciftciFormu.value.telefon.replace(/\D/g, '') // Sadece rakamlar
    const tcKimlikTemiz = ciftciFormu.value.tcKimlik.replace(/\D/g, '') // Sadece rakamlar
    
    const ciftciData = {
      ...ciftciFormu.value,
      adSoyad: capitalizeName(ciftciFormu.value.adSoyad),
      telefon: telefonTemiz,
      tcKimlik: tcKimlikTemiz,
      adres: ciftciFormu.value.adres.trim(),
      notlar: ciftciFormu.value.notlar ? ciftciFormu.value.notlar.trim() : '',
      halciId: halci.value.id // Halci ID'yi her zaman ekle
    }
    
    if (duzenlenenCiftci.value) {
      await ciftciService.update(duzenlenenCiftci.value.id, ciftciData)
    } else {
      await ciftciService.create(ciftciData)
    }
    await ciftcileriGetir()
    ciftciDialogunuKapat()
  } catch (error) {
    console.error('Çiftçi kaydedilirken hata:', error)
    alert(error.message || 'Çiftçi kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    kaydediliyor.value = false
  }
}

const cikisYap = () => {
  authStore.logout()
  router.push('/login')
}

const gecmisSatislarDialogunuAc = async () => {
  gecmisSatislarDialogu.value = true
  gecmisSatislarYukleniyor.value = true
  gecmisSatislar.value = []
  
  try {
    if (!halci.value) return
    
    // Halci'nin satışlarını getir
    const allSatislar = await satisService.getByHalciId(halci.value.id)
    
    // Tarihe göre sırala (en yeni önce)
    gecmisSatislar.value = allSatislar.sort((a, b) => 
      new Date(b.tarih) - new Date(a.tarih)
    )
  } catch (error) {
    console.error('Geçmiş satışlar yüklenirken hata:', error)
    alert('Geçmiş satışlar yüklenirken bir hata oluştu.')
  } finally {
    gecmisSatislarYukleniyor.value = false
  }
}

const stokDialogunuAc = async () => {
  stokDialogu.value = true
  acikStokDetaylari.value = {} // Detayları sıfırla
  await stokBilgileriniGetir()
}

/**
 * Stok bilgilerini getirme fonksiyonu
 * Halci'nin tüm çiftçilerinin ürünlerini toplar, ürün adı ve birime göre gruplar
 * Aynı ürün ve birime sahip ürünlerin miktarlarını toplar
 */
const stokBilgileriniGetir = async () => {
  stokYukleniyor.value = true
  toplamStok.value = []
  halciUrunleri.value = []
  
  try {
    if (!halci.value) return
    
    // Halci'nin tüm çiftçilerini getir
    const allCiftciler = await ciftciService.getAll()
    const halciCiftciler = allCiftciler.filter(c => c.halciId === halci.value.id)
    
    // Tüm ürünleri getir
    const allUrunler = await urunService.getAll()
    
    // Halci'nin çiftçilerine ait ürünleri filtrele
    halciUrunleri.value = allUrunler.filter(u => 
      halciCiftciler.some(c => c.id === u.ciftciId)
    )
    
    // Satış kayıtlarını getir (stok hesaplaması için)
    const allSatislar = await satisService.getByHalciId(halci.value.id)
    
    // Satış kayıtlarını ürün adı, birim ve kaliteye göre grupla
    const satisMap = {}
    allSatislar.forEach(satis => {
      const key = `${satis.urunAdi}_${satis.birim}_${satis.kalite || 'A Sınıfı'}`
      if (!satisMap[key]) {
        satisMap[key] = 0
      }
      satisMap[key] += satis.miktar || 0
    })
    
    // Ürünleri ürün adı, birim ve kaliteye göre grupla ve miktarları topla
    const stokMap = {}
    halciUrunleri.value.forEach(urun => {
      // Kalite bilgisini de dahil et
      const key = `${urun.urunAdi}_${urun.birim}_${urun.kalite || 'A Sınıfı'}` // Örnek: "Domates_kg_A Sınıfı"
      if (!stokMap[key]) {
        // İlk kez görülen ürün için yeni grup oluştur
        stokMap[key] = {
          urunAdi: urun.urunAdi,
          urunTipi: urun.urunTipi || 'Sebze',
          birim: urun.birim,
          kalite: urun.kalite || 'A Sınıfı',
          toplamMiktar: 0,
          toplamFiyat: 0, // Toplam fiyat (miktar * fiyat)
          urunDetaylari: [] // Her ürün kaydının detaylarını sakla
        }
      }
      // Miktarı toplam miktara ekle (orijinal miktar - çiftçi profilindeki miktar)
      stokMap[key].toplamMiktar += urun.miktar || 0
      // Toplam fiyatı hesapla (miktar * birim fiyat)
      stokMap[key].toplamFiyat += (urun.miktar || 0) * (urun.fiyat || 0)
      // Çiftçi bilgisini bul
      const ciftci = halciCiftciler.find(c => c.id === urun.ciftciId)
      
      // Ürün detaylarını ekle (orijinal miktar bilgisi ile)
      stokMap[key].urunDetaylari.push({
        id: urun.id,
        ciftciId: urun.ciftciId,
        ciftciAdSoyad: ciftci ? ciftci.adSoyad : 'Bilinmiyor',
        miktar: urun.miktar, // Orijinal miktar (çiftçi profilindeki miktar)
        fiyat: urun.fiyat,
        gelisTarihi: urun.gelisTarihi,
        sonKullanimTarihi: urun.sonKullanimTarihi,
        durum: urun.durum,
        notlar: urun.notlar,
        satinAlindiMi: urun.notlar?.includes('Satın alındı') || false
      })
    })
    
    // Satış kayıtlarını dikkate alarak stok miktarlarını hesapla
    Object.keys(stokMap).forEach(key => {
      const satilanMiktar = satisMap[key] || 0
      // Stok = Orijinal miktar - Satılan miktar
      stokMap[key].toplamMiktar = Math.max(0, stokMap[key].toplamMiktar - satilanMiktar)
    })
    
    // Ortalama fiyatı hesapla ve Map'i array'e çevir
    const stokArray = Object.values(stokMap).map(stok => {
      // Ortalama fiyat = Toplam fiyat / Toplam miktar (orijinal miktar üzerinden)
      // Not: Orijinal toplam fiyatı korumak için, satış sonrası miktar yerine orijinal miktarı kullan
      const orijinalToplamMiktar = stok.urunDetaylari.reduce((sum, detay) => sum + (detay.miktar || 0), 0)
      stok.ortalamaFiyat = orijinalToplamMiktar > 0 ? stok.toplamFiyat / orijinalToplamMiktar : 0
      // En düşük ve en yüksek fiyatları bul
      const fiyatlar = stok.urunDetaylari.map(d => d.fiyat).filter(f => f > 0)
      stok.minFiyat = fiyatlar.length > 0 ? Math.min(...fiyatlar) : 0
      stok.maxFiyat = fiyatlar.length > 0 ? Math.max(...fiyatlar) : 0
      return stok
    })
    
    // Miktarı 0 olan ürünleri filtrele (stokta olmayan ürünler)
    const stoktaOlanUrunler = stokArray.filter(stok => stok.toplamMiktar > 0)
    
    // Alfabetik sırala (Türkçe karakter desteği ile)
    toplamStok.value = stoktaOlanUrunler.sort((a, b) => {
      // Önce ürün adına göre
      const urunKarsilastirma = a.urunAdi.localeCompare(b.urunAdi, 'tr')
      if (urunKarsilastirma !== 0) return urunKarsilastirma
      // Sonra kaliteye göre
      return a.kalite.localeCompare(b.kalite, 'tr')
    })
  } catch (error) {
    console.error('Stok bilgileri yüklenirken hata:', error)
  } finally {
    stokYukleniyor.value = false
  }
}

const satisDialogunuAc = (stok) => {
  secilenStok.value = stok
  satisFormu.value = {
    miktar: null,
    fiyat: null,
    sirketAdi: '',
    sirketTelefon: '',
    sirketAdres: '',
    sirketVergiNo: ''
  }
  satisGecerli.value = false
  if (satisFormuRef.value) {
    satisFormuRef.value.resetValidation()
  }
  satisDialogu.value = true
}

const satisDialogunuKapat = () => {
  satisDialogu.value = false
  secilenStok.value = null
  satisFormu.value = {
    miktar: null,
    fiyat: null,
    sirketAdi: '',
    sirketTelefon: '',
    sirketAdres: '',
    sirketVergiNo: ''
  }
  if (satisFormuRef.value) {
    satisFormuRef.value.resetValidation()
  }
}

/**
 * Satış yapma fonksiyonu
 * Satış kaydı oluşturur ve stoktan ürün düşer
 * FIFO (First In First Out) prensibiyle çalışır - Önce eklenen ürünlerden satış yapılır
 */
const satisYap = async () => {
  // Form geçersizse veya gerekli veriler yoksa işlemi durdur
  if (!satisGecerli.value || !secilenStok.value || !satisFormu.value.miktar) return
  
  satisKaydediliyor.value = true
  try {
    const satilacakMiktar = satisFormu.value.miktar
    
    // Şirket bilgilerini temizle ve kaydet
    const vergiNoTemiz = satisFormu.value.sirketVergiNo ? satisFormu.value.sirketVergiNo.replace(/\D/g, '') : ''
    
    // Satışı veritabanına kaydet
    const satisKaydi = {
      halciId: halci.value.id,
      urunAdi: secilenStok.value.urunAdi,
      kalite: secilenStok.value.kalite || 'A Sınıfı', // Kalite bilgisini de ekle
      miktar: satilacakMiktar,
      birim: secilenStok.value.birim,
      fiyat: satisFormu.value.fiyat,
      sirketAdi: satisFormu.value.sirketAdi,
      sirketTelefon: satisFormu.value.sirketTelefon,
      sirketAdres: satisFormu.value.sirketAdres,
      sirketVergiNo: vergiNoTemiz,
      tarih: new Date().toISOString() // Şu anki tarih ve saat
    }
    
    // Satış kaydını oluştur (ürün miktarlarını değiştirmeden)
    await satisService.create(satisKaydi)
    
    // Stok listesini güncelle (satış kayıtları dikkate alınarak)
    await stokBilgileriniGetir()
    satisDialogunuKapat() // Satış dialog'unu kapat
  } catch (error) {
    console.error('Satış yapılırken hata:', error)
    alert('Satış yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    satisKaydediliyor.value = false
  }
}

const fisDialogunuAc = async (stok) => {
  secilenFisStoku.value = stok
  fisUrunDetaylari.value = []
  fisDialogu.value = true
  fisYukleniyor.value = true
  
  try {
    if (!halci.value) return
    
    // Halci'nin tüm çiftçilerini getir
    const allCiftciler = await ciftciService.getAll()
    const halciCiftciler = allCiftciler.filter(c => c.halciId === halci.value.id)
    
    // Seçilen ürün ve birime sahip tüm ürünleri bul
    const ilgiliUrunler = halciUrunleri.value.filter(u => 
      u.urunAdi === stok.urunAdi && u.birim === stok.birim
    )
    
    // Çiftçi bilgileriyle birleştir
    fisUrunDetaylari.value = ilgiliUrunler.map(urun => {
      const ciftci = halciCiftciler.find(c => c.id === urun.ciftciId)
      return {
        ciftciAdi: ciftci?.adSoyad || 'Bilinmiyor',
        ciftciTelefon: ciftci?.telefon || '-',
        ciftciAdres: ciftci?.adres || '-',
        miktar: urun.miktar,
        birim: urun.birim,
        kalite: urun.kalite,
        fiyat: urun.fiyat,
        gelisTarihi: urun.gelisTarihi
      }
    })
  } catch (error) {
    console.error('Fiş bilgileri yüklenirken hata:', error)
  } finally {
    fisYukleniyor.value = false
  }
}

const printFis = () => {
  window.print()
}

onMounted(() => {
  // Auth kontrolü
  if (!halci.value) {
    router.push('/login')
    return
  }
  ciftcileriGetir()
})

const ciftciDetayinaGit = (id) => {
  router.push(`/ciftci/${id}`)
}

const ciftciDetayDialogunuAc = (ciftci) => {
  secilenCiftciDetay.value = ciftci
  ciftciDetayDialogu.value = true
}

const ciftciDetayDialogunuKapat = () => {
  ciftciDetayDialogu.value = false
  secilenCiftciDetay.value = null
}

const ciftciDetaySayfasinaGit = () => {
  if (secilenCiftciDetay.value) {
    ciftciDetayDialogunuKapat()
    router.push(`/ciftci/${secilenCiftciDetay.value.id}`)
  }
}

/**
 * Ürün satın alma dialogunu açma fonksiyonu
 */
const urunSatinAlDialogunuAc = () => {
  urunSecmeDialogu.value = true
  secilenUrunAdi.value = ''
  secilenKalite.value = ''
}

/**
 * Ürün seçme dialogunu kapatma fonksiyonu
 */
const urunSecmeDialogunuKapat = () => {
  urunSecmeDialogu.value = false
  secilenUrunAdi.value = ''
  secilenKalite.value = ''
  if (urunSecmeFormuRef.value) {
    urunSecmeFormuRef.value.resetValidation()
  }
}

/**
 * Halci stoklarını getirme fonksiyonu
 * Seçilen ürün ve kaliteye sahip halcileri bulur (kendi halcisi hariç)
 */
const halciStoklariniGetir = async () => {
  if (!secilenUrunAdi.value || !secilenKalite.value || !halci.value) {
    return
  }

  halciStoklariYukleniyor.value = true
  halciStoklari.value = []

  try {
    // Tüm halcileri getir
    const halciler = await halciService.getAll()
    
    // Tüm ürünleri getir
    const tumUrunler = await urunService.getAll()

    // Seçilen ürün ve kaliteye sahip ürünleri filtrele (kendi halcisi hariç)
    const filtrelenmisUrunler = tumUrunler.filter(urun => 
      urun.urunAdi === secilenUrunAdi.value &&
      urun.kalite === secilenKalite.value &&
      urun.miktar > 0
    )

    // Her halci için stok bilgilerini topla
    const stokMap = {}
    
    for (const urun of filtrelenmisUrunler) {
      // Ürünün çiftçisini bul
      const ciftci = await ciftciService.getById(urun.ciftciId).catch(() => null)
      if (!ciftci || !ciftci.halciId) continue

      // Kendi halcisi ise atla
      if (ciftci.halciId === halci.value.id) continue

      // Halci bilgilerini al
      const halciBilgisi = halciler.find(h => h.id === ciftci.halciId)
      if (!halciBilgisi) continue

      const key = `${ciftci.halciId}_${urun.birim}`
      
      if (!stokMap[key]) {
        stokMap[key] = {
          halciId: ciftci.halciId,
          halciAdSoyad: `${halciBilgisi.ad} ${halciBilgisi.soyad}`,
          sirketAdi: halciBilgisi.sirketAdi,
          urunAdi: urun.urunAdi,
          urunTipi: urun.urunTipi || 'Sebze', // Ürün tipi (Sebze/Meyve)
          kalite: urun.kalite,
          birim: urun.birim,
          miktar: 0,
          fiyat: urun.fiyat,
          urunId: urun.id
        }
      }

      stokMap[key].miktar += urun.miktar
    }

    halciStoklari.value = Object.values(stokMap)
    
    // Ürün seçme dialogunu kapat, halci stokları dialogunu aç
    urunSecmeDialogunuKapat()
    halciStoklariDialogu.value = true
  } catch (error) {
    console.error('Halci stokları yüklenirken hata:', error)
    alert('Halci stokları yüklenirken bir hata oluştu.')
  } finally {
    halciStoklariYukleniyor.value = false
  }
}

/**
 * Halci stokları dialogunu kapatma fonksiyonu
 */
const halciStoklariDialogunuKapat = () => {
  halciStoklariDialogu.value = false
  halciStoklari.value = []
}

/**
 * Talep dialogunu açma fonksiyonu
 */
const talepDialogunuAc = (stok) => {
  secilenSaticiHalci.value = stok
  talepFormu.value = {
    miktar: null,
    fiyatTeklifi: null,
    notlar: ''
  }
  talepDialogu.value = true
}

/**
 * Talep dialogunu kapatma fonksiyonu
 */
const talepDialogunuKapat = () => {
  talepDialogu.value = false
  secilenSaticiHalci.value = null
  talepFormu.value = {
    miktar: null,
    fiyatTeklifi: null,
    notlar: ''
  }
  if (talepFormuRef.value) {
    talepFormuRef.value.resetValidation()
  }
}

/**
 * Satın alma talebi gönderme fonksiyonu
 */
const talepGonder = async () => {
  if (!talepGecerli.value || !secilenSaticiHalci.value || !halci.value) {
    return
  }

  if (!talepFormu.value.miktar || talepFormu.value.miktar <= 0) {
    alert('Lütfen geçerli bir miktar giriniz.')
    return
  }

  if (!talepFormu.value.fiyatTeklifi || talepFormu.value.fiyatTeklifi <= 0) {
    alert('Lütfen geçerli bir fiyat teklifi giriniz.')
    return
  }

  if (talepFormu.value.miktar > secilenSaticiHalci.value.miktar) {
    alert('Talep miktarı mevcut stoktan fazla olamaz.')
    return
  }

  talepGonderiliyor.value = true

  try {
    // Vergi numarasını temizle (sadece rakamlar)
    const vergiNoTemiz = halci.value.vergiNumarasi ? halci.value.vergiNumarasi.replace(/\D/g, '') : ''
    
    const talep = {
      aliciHalciId: halci.value.id,
      aliciHalciAdSoyad: `${halci.value.ad} ${halci.value.soyad}`,
      aliciSirketAdi: halci.value.sirketAdi,
      aliciSirketTelefon: halci.value.telefon || '',
      aliciSirketAdres: halci.value.adres || '',
      aliciSirketVergiNo: vergiNoTemiz,
      saticiHalciId: secilenSaticiHalci.value.halciId,
      saticiHalciAdSoyad: secilenSaticiHalci.value.halciAdSoyad,
      saticiSirketAdi: secilenSaticiHalci.value.sirketAdi,
      urunId: secilenSaticiHalci.value.urunId,
      urunAdi: secilenUrunAdi.value,
      urunTipi: secilenSaticiHalci.value.urunTipi || 'Sebze', // Ürün tipi
      kalite: secilenKalite.value,
      miktar: talepFormu.value.miktar,
      birim: secilenSaticiHalci.value.birim,
      birimFiyat: secilenSaticiHalci.value.fiyat, // Satıcının fiyatı
      fiyatTeklifi: talepFormu.value.fiyatTeklifi, // Alıcının fiyat teklifi
      toplamTutar: talepFormu.value.miktar * talepFormu.value.fiyatTeklifi, // Teklif edilen toplam
      notlar: talepFormu.value.notlar || '',
      durum: 'Beklemede',
      talepTarihi: new Date().toISOString().split('T')[0],
      talepSaati: new Date().toLocaleTimeString('tr-TR')
    }

    await talepService.create(talep)

    alert('Satın alma talebiniz başarıyla gönderildi!')
    
    talepDialogunuKapat()
    halciStoklariDialogunuKapat()
  } catch (error) {
    console.error('Talep gönderilirken hata:', error)
    alert(error.message || 'Talep gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    talepGonderiliyor.value = false
  }
}

const tarihiFormatla = (dateString) => {
  if (!dateString) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [y, m, d] = dateString.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('tr-TR')
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('tr-TR')
}

const satisFaturaTarihiniAl = (satis) => {
  const tarihKaynagi = satis.tarih || satis.satisTarihi
  if (!tarihKaynagi) return { tarih: '-', saat: '', tam: '-' }

  const tarih = tarihiFormatla(tarihKaynagi)
  let saat = satis.satisSaati || ''

  if (!saat && String(tarihKaynagi).includes('T')) {
    const date = new Date(tarihKaynagi)
    if (!Number.isNaN(date.getTime())) {
      saat = date.toLocaleTimeString('tr-TR')
    }
  }

  return {
    tarih,
    saat,
    tam: saat ? `${tarih} ${saat}` : tarih,
  }
}

/**
 * Durum rengini döndüren fonksiyon
 */
const durumRenginiAl = (durum) => {
  const colors = {
    'Beklemede': 'warning',
    'Onaylandı': 'success',
    'Reddedildi': 'error',
    'Tedarik Edildi': 'info'
  }
  return colors[durum] || 'grey'
}

const telefonuFormatla = (formName, fieldName) => {
  const form = formName === 'satisFormu' ? satisFormu.value : ciftciFormu.value
  if (!form[fieldName]) return
  
  // Sadece rakamları al
  let cleaned = form[fieldName].replace(/\D/g, '')
  
  // Eğer boşsa, temizle
  if (cleaned.length === 0) {
    form[fieldName] = ''
    return
  }
  
  // Türkiye telefon numarası formatı: 05XX XXX XX XX (11 haneli)
  // Eğer 5 ile başlıyorsa ve 10 haneli ise (05XX formatı olmadan), başına 0 ekle
  if (cleaned.startsWith('5') && cleaned.length === 10) {
    cleaned = '0' + cleaned
  }
  
  // Maksimum 11 karakter
  if (cleaned.length > 11) {
    cleaned = cleaned.substring(0, 11)
  }
  
  form[fieldName] = cleaned
}

const sadeceRakamFormatla = (formName, fieldName) => {
  const form = formName === 'satisFormu' ? satisFormu.value : ciftciFormu.value
  if (form[fieldName] == null) return
  form[fieldName] = String(form[fieldName]).replace(/\D/g, '')
}

const faturaMetniniTemizle = (value) =>
  String(value ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ', ')

const faturayiIndir = (satis) => {
  if (!satis || !halci.value) return

  const birimFiyat = satis.fiyat ?? satis.birimFiyat ?? satis.fiyatTeklifi ?? null
  const toplamTutar = satis.toplamTutar ?? (birimFiyat && satis.miktar ? satis.miktar * birimFiyat : null)
  const satisTarihi = satisFaturaTarihiniAl(satis)
  const paraFormatla = (value) =>
    value != null ? `${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL` : '-'
  const urunAciklama = satis.kalite && satis.kalite !== '-'
    ? `${satis.urunAdi} (${satis.kalite})`
    : (satis.urunAdi || '-')

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Fatura</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: A4; margin: 1.2cm 1.5cm; }
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .header-table td { vertical-align: top; }
        .seller-block { width: 60%; }
        .seller-name { font-size: 14pt; font-weight: bold; margin-bottom: 6px; }
        .seller-block p { margin: 2px 0; font-size: 10pt; }
        .invoice-meta { width: 40%; text-align: right; }
        .invoice-title { font-size: 22pt; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; }
        .invoice-date { font-size: 11pt; }
        .invoice-date span { font-weight: bold; }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          margin: 14px 0 6px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid #000;
        }
        .buyer-block p { margin: 2px 0; font-size: 10pt; }
        .label { font-weight: bold; }
        .product-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .product-table th, .product-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          font-size: 10pt;
        }
        .product-table th {
          background: #f0f0f0;
          text-align: center;
          font-weight: bold;
        }
        .product-table td.num { text-align: right; }
        .product-table td.center { text-align: center; }
        .total-table { width: 100%; margin-top: 12px; }
        .total-table td { padding: 4px 0; font-size: 11pt; }
        .total-label { text-align: right; font-weight: bold; padding-right: 12px; }
        .total-value { text-align: right; font-weight: bold; font-size: 12pt; width: 140px; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td class="seller-block">
            <div class="seller-name">${faturaMetniniTemizle(halci.value.sirketAdi || 'Hal Yönetim Sistemi')}</div>
            <p>${faturaMetniniTemizle(halci.value.adres)}</p>
            <p>Tel: ${faturaMetniniTemizle(halci.value.telefon)}</p>
            ${halci.value.vergiNumarasi ? `<p>Vergi No: ${faturaMetniniTemizle(halci.value.vergiNumarasi)}</p>` : ''}
          </td>
          <td class="invoice-meta">
            <div class="invoice-title">FATURA</div>
            <div class="invoice-date"><span>Tarih:</span> ${satisTarihi.tarih}</div>
          </td>
        </tr>
      </table>

      <div class="section-title">Alıcı Bilgileri</div>
      <div class="buyer-block">
        <p><span class="label">Unvan:</span> ${faturaMetniniTemizle(satis.sirketAdi)}</p>
        <p><span class="label">Adres:</span> ${faturaMetniniTemizle(satis.sirketAdres)}</p>
        <p><span class="label">Tel:</span> ${faturaMetniniTemizle(satis.sirketTelefon)}</p>
        ${satis.sirketVergiNo ? `<p><span class="label">Vergi No:</span> ${faturaMetniniTemizle(satis.sirketVergiNo)}</p>` : ''}
      </div>

      <div class="section-title">Mal / Hizmet Detayı</div>
      <table class="product-table">
        <tr>
          <th style="width:40px">S.No</th>
          <th>Mal / Hizmet</th>
          <th style="width:80px">Miktar</th>
          <th style="width:60px">Birim</th>
          <th style="width:100px">Birim Fiyat</th>
          <th style="width:110px">Tutar</th>
        </tr>
        <tr>
          <td class="center">1</td>
          <td>${faturaMetniniTemizle(urunAciklama)}</td>
          <td class="num">${faturaMetniniTemizle(satis.miktar)}</td>
          <td class="center">${faturaMetniniTemizle(satis.birim)}</td>
          <td class="num">${paraFormatla(birimFiyat)}</td>
          <td class="num">${paraFormatla(toplamTutar)}</td>
        </tr>
      </table>

      <table class="total-table">
        <tr>
          <td class="total-label">TOPLAM</td>
          <td class="total-value">${paraFormatla(toplamTutar)}</td>
        </tr>
      </table>
    </body>
    </html>
  `

  // Blob oluştur ve indir
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  // Dosya adını güvenli hale getir (özel karakterleri temizle)
  const safeCompanyName = (satis.sirketAdi || 'Bilinmeyen').replace(/[^a-zA-Z0-9]/g, '_')
  const safeDate = satisTarihi.tarih.replace(/\//g, '-')
  link.download = `Fatura_${safeCompanyName}_${safeDate}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.ciftci-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.ciftci-card:hover {
  transform: translateY(-4px);
}

.fis-content {
  font-family: 'Courier New', monospace;
}

@media print {
  .fis-content {
    padding: 20px;
  }
  
  .v-btn, .v-card-actions {
    display: none !important;
  }
}
</style>


