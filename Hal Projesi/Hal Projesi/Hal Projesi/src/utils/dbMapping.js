/**
 * utils/dbMapping.js - Veritabanı Alan Adı Dönüştürücü
 *
 * Vue uygulamasında alan adları camelCase kullanılır (ör. adSoyad, halciId).
 * Supabase/PostgreSQL tablolarında alan adları snake_case kullanılır (ör. ad_soyad, halci_id).
 *
 * Bu dosya iki format arasında çeviri yapar; böylece Vue bileşenleri
 * veritabanı sütun isimlerini bilmeden çalışabilir.
 */

/**
 * camelCase metni snake_case'e çevirir.
 * Örnek: "halciId" -> "halci_id"
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * snake_case metni camelCase'e çevirir.
 * Örnek: "halci_id" -> "halciId"
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Vue/JS objesini Supabase'e gönderilecek formata çevirir.
 *
 * Nasıl çalışır:
 * 1. Objenin her anahtarını snake_case yapar
 * 2. Boş string ("") değerlerini null yapar (PostgreSQL date/text hatalarını önler)
 *
 * @param {Object} record - Vue tarafındaki kayıt objesi
 * @returns {Object} - Veritabanına yazılacak obje
 */
export function toDb(record) {
  if (!record || typeof record !== 'object') return record

  const result = {}
  for (const [key, value] of Object.entries(record)) {
    result[toSnakeCase(key)] = value === '' ? null : value
  }
  return result
}

/**
 * Supabase'den gelen tek kaydı Vue/JS formatına çevirir.
 *
 * Nasıl çalışır:
 * - Veritabanından gelen snake_case alanları camelCase'e dönüştürülür
 * - Böylece template ve script'lerde satis.halciId gibi okunabilir
 *
 * @param {Object} record - Supabase satırı
 * @returns {Object} - Vue tarafında kullanılacak obje
 */
export function fromDb(record) {
  if (!record || typeof record !== 'object') return record

  const result = {}
  for (const [key, value] of Object.entries(record)) {
    result[toCamelCase(key)] = value
  }
  return result
}

/**
 * Supabase'den gelen kayıt listesini toplu olarak Vue formatına çevirir.
 *
 * @param {Array} records - Supabase satır listesi
 * @returns {Array} - camelCase obje listesi
 */
export function fromDbList(records) {
  return (records || []).map(fromDb)
}
