/**
 * Run migration SQL via Supabase Management API
 * Usage: npx tsx scripts/run-migration.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

async function runSQL(sql: string, description: string) {
  console.log(`Running: ${description}...`)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    // Try the pg endpoint instead
    const pgRes = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    if (!pgRes.ok) {
      const text = await pgRes.text()
      console.error(`Failed: ${text}`)
      return false
    }
    const data = await pgRes.json()
    console.log(`  OK`)
    return true
  }
  console.log(`  OK`)
  return true
}

async function main() {
  // Read the migration file
  const migrationSQL = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/00001_initial_schema.sql'),
    'utf-8'
  )

  // Split into individual statements and run them
  // We need to handle functions specially since they contain semicolons
  const statements: string[] = []
  let current = ''
  let inFunction = false

  for (const line of migrationSQL.split('\n')) {
    const trimmed = line.trim()

    // Skip comments-only lines at top level
    if (!inFunction && trimmed.startsWith('--') && !current.trim()) {
      continue
    }

    current += line + '\n'

    // Detect function/trigger body start
    if (trimmed.includes('$$') && !inFunction) {
      inFunction = true
      // Check if it also ends on same conceptual block
      const dollarCount = (current.match(/\$\$/g) || []).length
      if (dollarCount >= 2 && trimmed.endsWith(';')) {
        inFunction = false
        statements.push(current.trim())
        current = ''
      }
      continue
    }

    if (inFunction) {
      const dollarCount = (current.match(/\$\$/g) || []).length
      if (dollarCount >= 2 && trimmed.endsWith(';')) {
        inFunction = false
        statements.push(current.trim())
        current = ''
      }
      continue
    }

    // Regular statement ending with ;
    if (trimmed.endsWith(';') && !inFunction) {
      statements.push(current.trim())
      current = ''
    }
  }

  if (current.trim()) {
    statements.push(current.trim())
  }

  // Filter out empty/comment-only statements
  const validStatements = statements.filter(s => {
    const lines = s.split('\n').filter(l => !l.trim().startsWith('--') && l.trim())
    return lines.length > 0
  })

  console.log(`Found ${validStatements.length} SQL statements to execute\n`)

  // Try running the entire migration at once first
  const success = await runSQL(migrationSQL, 'Full migration')

  if (success) {
    console.log('\nMigration completed successfully!')
  } else {
    console.log('\nFull migration failed, trying statement by statement...')
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < validStatements.length; i++) {
      const stmt = validStatements[i]
      const preview = stmt.substring(0, 80).replace(/\n/g, ' ')
      const ok = await runSQL(stmt, `[${i + 1}/${validStatements.length}] ${preview}`)
      if (ok) successCount++
      else errorCount++
    }

    console.log(`\nDone: ${successCount} succeeded, ${errorCount} failed`)
  }
}

main().catch(console.error)
