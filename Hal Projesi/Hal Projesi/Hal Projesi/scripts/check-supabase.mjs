/**
 * Supabase bağlantı ve tablo kayıt sayısı kontrolü
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

function loadEnvFile() {
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
}

async function main() {
  loadEnvFile()

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.log('ENV: EKSIK')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const tables = ['halciler', 'ciftciler', 'urunler', 'satislar', 'talepler']
  const results = {}

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    results[table] = error ? `HATA: ${error.message}` : count
  }

  // Test login user exists
  const { data: halci, error: halciError } = await supabase
    .from('halciler')
    .select('id, email, ad, soyad')
    .eq('email', 'halci@example.com')
    .maybeSingle()

  console.log('SUPABASE_URL:', url)
  console.log('BAGLANTI: OK')
  console.log('TABLOLAR:', JSON.stringify(results))
  console.log(
    'TEST_HALCI:',
    halciError ? `HATA: ${halciError.message}` : halci ? `${halci.ad} ${halci.soyad} (${halci.email})` : 'Bulunamadi'
  )
}

main().catch((e) => {
  console.log('BAGLANTI: HATA -', e.message)
  process.exit(1)
})
