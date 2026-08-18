/**
 * services/api.js - Supabase API Servis Katmanı
 *
 * Vue bileşenleri doğrudan Supabase'e bağlanmaz; bu dosyadaki servisleri kullanır.
 * Her servis (ciftciService, urunService vb.) ilgili tablo için CRUD işlemlerini yapar.
 *
 * Akış:
 * Vue bileşeni -> api.js servisi -> Supabase -> PostgreSQL
 * Gelen veri snake_case -> camelCase dönüştürülür -> Vue'ya döner
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { toDb, fromDb, fromDbList } from '@/utils/dbMapping'

/**
 * .env dosyasında Supabase bilgileri yoksa işlemi durdurur.
 * Kullanıcıya anlaşılır bir hata mesajı fırlatılır.
 */
function assertSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    const error = new Error(
      'Supabase yapılandırması eksik. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
    )
    error.name = 'ConfigError'
    throw error
  }
}

/**
 * Supabase hatalarını yakalar ve Türkçe/anlaşılır mesajlara çevirir.
 * Ağ hatası, izin hatası vb. durumlarda Vue bileşenlerine iletilir.
 */
function handleSupabaseError(error) {
  if (!error) return

  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    const networkError = new Error(
      'Supabase\'e bağlanılamıyor. İnternet bağlantınızı ve .env ayarlarınızı kontrol edin.'
    )
    networkError.name = 'NetworkError'
    throw networkError
  }

  const requestError = new Error(error.message || 'Veritabanı işlemi başarısız oldu')
  requestError.name = 'RequestError'
  requestError.code = error.code
  throw requestError
}

/**
 * Herhangi bir tablo için standart CRUD (Create, Read, Update, Delete) servisi üretir.
 *
 * @param {string} tableName - Supabase tablo adı (ör. "ciftciler", "urunler")
 * @returns {Object} - getAll, getById, create, update, delete fonksiyonları
 *
 * create/update: Vue objesi -> toDb() -> Supabase -> fromDb() -> Vue objesi
 */
function createCrudService(tableName) {
  return {
    /** Tablodaki tüm kayıtları id sırasına göre getirir */
    getAll: async () => {
      assertSupabaseConfigured()
      const { data, error } = await supabase.from(tableName).select('*').order('id')
      if (error) handleSupabaseError(error)
      return fromDbList(data)
    },

    /** Belirli id'ye sahip tek kaydı getirir */
    getById: async (id) => {
      assertSupabaseConfigured()
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single()
      if (error) handleSupabaseError(error)
      return fromDb(data)
    },

    /** Yeni kayıt ekler; eklenen kaydı camelCase olarak geri döndürür */
    create: async (record) => {
      assertSupabaseConfigured()
      const { data, error } = await supabase.from(tableName).insert(toDb(record)).select().single()
      if (error) handleSupabaseError(error)
      return fromDb(data)
    },

    /** Mevcut kaydı id ile günceller */
    update: async (id, record) => {
      assertSupabaseConfigured()
      const { data, error } = await supabase
        .from(tableName)
        .update(toDb(record))
        .eq('id', id)
        .select()
        .single()
      if (error) handleSupabaseError(error)
      return fromDb(data)
    },

    /** Kaydı id ile siler */
    delete: async (id) => {
      assertSupabaseConfigured()
      const { data, error } = await supabase.from(tableName).delete().eq('id', id).select().single()
      if (error) handleSupabaseError(error)
      return fromDb(data)
    },
  }
}

/**
 * Çiftçi servisi - ciftciler tablosu
 * Ek olarak: getByHalciId ile sadece giriş yapan halcinin çiftçileri filtrelenir
 */
export const ciftciService = {
  ...createCrudService('ciftciler'),

  getByHalciId: async (halciId) => {
    assertSupabaseConfigured()
    const { data, error } = await supabase
      .from('ciftciler')
      .select('*')
      .eq('halci_id', halciId)
      .order('id')
    if (error) handleSupabaseError(error)
    return fromDbList(data)
  },
}

/** Halci (kullanıcı) servisi - halciler tablosu; giriş ve kayıt işlemlerinde kullanılır */
export const halciService = {
  ...createCrudService('halciler'),
}

/**
 * Ürün servisi - urunler tablosu
 * getByCiftciId: bir çiftçiye ait tüm ürünleri getirir
 */
export const urunService = {
  ...createCrudService('urunler'),

  getByCiftciId: async (ciftciId) => {
    assertSupabaseConfigured()
    const { data, error } = await supabase
      .from('urunler')
      .select('*')
      .eq('ciftci_id', ciftciId)
      .order('id')
    if (error) handleSupabaseError(error)
    return fromDbList(data)
  },
}

/**
 * Satış servisi - satislar tablosu
 * getByHalciId: halcinin geçmiş satışlarını getirir (fatura indirme vb.)
 */
export const satisService = {
  ...createCrudService('satislar'),

  getByHalciId: async (halciId) => {
    assertSupabaseConfigured()
    const { data, error } = await supabase
      .from('satislar')
      .select('*')
      .eq('halci_id', halciId)
      .order('id')
    if (error) handleSupabaseError(error)
    return fromDbList(data)
  },
}

/**
 * Talep servisi - talepler tablosu (halci arası ürün satın alma talepleri)
 * getBySaticiHalciId: satıcıya gelen talepler (bildirim/onay)
 * getByAliciHalciId: alıcının gönderdiği talepler
 */
export const talepService = {
  ...createCrudService('talepler'),

  getBySaticiHalciId: async (saticiHalciId) => {
    assertSupabaseConfigured()
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .eq('satici_halci_id', saticiHalciId)
      .order('id')
    if (error) handleSupabaseError(error)
    return fromDbList(data)
  },

  getByAliciHalciId: async (aliciHalciId) => {
    assertSupabaseConfigured()
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .eq('alici_halci_id', aliciHalciId)
      .order('id')
    if (error) handleSupabaseError(error)
    return fromDbList(data)
  },
}

export default supabase
