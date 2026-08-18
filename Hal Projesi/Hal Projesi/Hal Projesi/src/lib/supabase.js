/**
 * lib/supabase.js - Supabase Bağlantı İstemcisi
 *
 * Uygulamanın Supabase veritabanına bağlanması için tek merkez noktasıdır.
 * .env dosyasındaki URL ve anon key ile bir istemci (client) oluşturulur.
 *
 * Bu istemci api.js ve diğer servisler tarafından kullanılır.
 */

import { createClient } from '@supabase/supabase-js'

// Vite .env dosyasından okunan değerler (VITE_ ile başlamalı)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Yapılandırma eksikse geliştiriciye konsolda uyarı ver
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase yapılandırması eksik. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
  )
}

/**
 * Supabase istemcisi - tüm veritabanı işlemleri bunun üzerinden yapılır.
 * Placeholder değerler, .env yokken uygulamanın tamamen çökmesini engeller.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Supabase bağlantı bilgilerinin tanımlı olup olmadığını kontrol eder.
 * api.js, işlem yapmadan önce bunu çağırarak anlamlı hata mesajı verir.
 */
export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey)
