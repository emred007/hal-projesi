import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = readFileSync(join(rootDir, '.env'), 'utf-8')
for (const line of env.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

function toDb(record) {
  const result = {}
  for (const [key, value] of Object.entries(record)) {
    const snake = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)
    result[snake] = value
  }
  return result
}

const test = {
  adSoyad: 'Test Ciftci',
  telefon: '05321234567',
  tcKimlik: '12345678901',
  adres: 'Test Adres',
  notlar: '',
  aktif: true,
  kayitTarihi: '2026-06-07',
  halciId: 1,
}

const { data, error } = await supabase.from('ciftciler').insert(toDb(test)).select().single()
if (error) {
  console.log('HATA:', error.message, error.code, error.details)
} else {
  console.log('OK:', data)
  await supabase.from('ciftciler').delete().eq('id', data.id)
  console.log('Test kaydi silindi')
}
