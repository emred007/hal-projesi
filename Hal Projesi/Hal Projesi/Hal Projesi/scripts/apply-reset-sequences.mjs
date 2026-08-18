/**
 * patch-reset-sequences.sql dosyasını veritabanına uygular.
 * .env: VITE_SUPABASE_URL, SUPABASE_DB_PASSWORD
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile() {
  try {
    const content = readFileSync(join(rootDir, '.env'), 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
    }
  } catch {
    // .env yoksa ortam değişkenlerine güven
  }
}

function getProjectRef(url) {
  return new URL(url).hostname.split('.')[0]
}

async function main() {
  loadEnvFile()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const password = process.env.SUPABASE_DB_PASSWORD

  if (!supabaseUrl || !password) {
    console.error('Hata: VITE_SUPABASE_URL ve SUPABASE_DB_PASSWORD gerekli.')
    process.exit(1)
  }

  const sql = readFileSync(join(rootDir, 'supabase', 'patch-reset-sequences.sql'), 'utf-8')
  const client = new Client({
    host: `db.${getProjectRef(supabaseUrl)}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  await client.query(sql)
  await client.end()
  console.log('ID sayaçları güncellendi.')
}

main().catch((error) => {
  console.error('Hata:', error.message)
  process.exit(1)
})
