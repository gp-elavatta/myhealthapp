import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres:eTldobO6JHtoQZkM@db.julmolvtqqndkapbjnff.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function main() {
  console.log('Connecting to database...')
  await client.connect()
  console.log('Connected!\n')

  const migrationSQL = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/00001_initial_schema.sql'),
    'utf-8'
  )

  console.log('Running migration...')
  try {
    await client.query(migrationSQL)
    console.log('Migration completed successfully!')
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Tables already exist, skipping migration.')
    } else {
      console.error('Migration error:', err.message)
      // Try statement by statement
      console.log('\nTrying statement by statement...')
      const statements = []
      let current = ''
      let dollarCount = 0

      for (const line of migrationSQL.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('--') && !current.trim()) continue

        current += line + '\n'
        const matches = line.match(/\$\$/g)
        if (matches) dollarCount += matches.length

        if (trimmed.endsWith(';') && dollarCount % 2 === 0) {
          const stmt = current.trim()
          if (stmt && !stmt.match(/^--/)) {
            statements.push(stmt)
          }
          current = ''
          dollarCount = 0
        }
      }

      let success = 0, errors = 0
      for (const stmt of statements) {
        try {
          await client.query(stmt)
          success++
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.error(`  Error: ${e.message.substring(0, 100)}`)
            errors++
          } else {
            success++
          }
        }
      }
      console.log(`Done: ${success} succeeded, ${errors} failed`)
    }
  }

  // Verify tables exist
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  console.log('\nTables in public schema:')
  res.rows.forEach(r => console.log(`  - ${r.table_name}`))

  await client.end()
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
