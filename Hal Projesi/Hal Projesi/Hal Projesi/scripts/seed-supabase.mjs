/**
 * db.json verilerini Supabase'e aktarır.
 *
 * Kullanım:
 * 1. supabase/schema.sql dosyasını Supabase SQL Editor'de çalıştırın
 * 2. .env dosyasına VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ekleyin
 * 3. npm run seed
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

function loadEnvFile() {
  try {
    const envPath = join(rootDir, '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key && rest.length) {
        process.env[key.trim()] = rest.join('=').trim()
      }
    }
  } catch {
    // .env yoksa ortam değişkenlerine güven
  }
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toDb(record) {
  const result = {}
  for (const [key, value] of Object.entries(record)) {
    result[toSnakeCase(key)] = value === '' ? null : value
  }
  return result
}

async function seedTable(supabase, tableName, records) {
  if (!records?.length) {
    console.log(`  ${tableName}: kayıt yok, atlandı`)
    return
  }

  const payload = records.map(toDb)
  const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' })
  if (error) throw new Error(`${tableName} aktarım hatası: ${error.message}`)
  console.log(`  ${tableName}: ${records.length} kayıt aktarıldı`)
}

async function main() {
  loadEnvFile()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Hata: VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env dosyasında tanımlı olmalı.')
    process.exit(1)
  }

  const dbPath = join(rootDir, 'db.json')
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'))
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('Supabase seed başlıyor...\n')

  await seedTable(supabase, 'halciler', db.halciler)
  await seedTable(supabase, 'ciftciler', db.ciftciler)
  await seedTable(supabase, 'urunler', db.urunler)
  await seedTable(supabase, 'satislar', db.satislar)
  await seedTable(supabase, 'talepler', db.talepler)

  console.log('\nSeed tamamlandı.')
  console.log('Not: Yeni kayıt ekleyebilmek için supabase/patch-reset-sequences.sql dosyasını SQL Editor\'de çalıştırın.')
}

main().catch((error) => {
  console.error('\nSeed başarısız:', error.message)
  process.exit(1)
})
