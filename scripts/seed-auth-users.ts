/**
 * Seed Auth Users Script
 *
 * This script creates demo auth users in Supabase using the service role key.
 * Run with: npx tsx scripts/seed-auth-users.ts
 *
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - npm install @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load env from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const demoUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'patient@example.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
    role: 'patient',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@downtownclinic.com',
    password: 'password123',
    full_name: 'Emily Chen',
    role: 'clinic_staff',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'doctor@downtownclinic.com',
    password: 'password123',
    full_name: 'Dr. Michael Roberts',
    role: 'practitioner',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'admin@downtownclinic.com',
    password: 'password123',
    full_name: 'James Wilson',
    role: 'clinic_admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'platformadmin@example.com',
    password: 'password123',
    full_name: 'Platform Admin',
    role: 'platform_admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'patient2@example.com',
    password: 'password123',
    full_name: 'David Kim',
    role: 'patient',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'patient3@example.com',
    password: 'password123',
    full_name: 'Lisa Martinez',
    role: 'patient',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'doctor2@maplemedical.com',
    password: 'password123',
    full_name: 'Dr. Priya Sharma',
    role: 'practitioner',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    email: 'doctor3@urgentcare.com',
    password: 'password123',
    full_name: 'Dr. Robert Lee',
    role: 'practitioner',
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    email: 'staff@maplemedical.com',
    password: 'password123',
    full_name: 'Amanda Torres',
    role: 'clinic_staff',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    email: 'admin@maplemedical.com',
    password: 'password123',
    full_name: 'Chris Anderson',
    role: 'clinic_admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    email: 'doctor4@virtualcare.com',
    password: 'password123',
    full_name: 'Dr. Jennifer Wu',
    role: 'practitioner',
  },
]

async function seedUsers() {
  console.log('Creating demo auth users...\n')

  for (const user of demoUsers) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find((u) => u.email === user.email)

    if (existing) {
      console.log(`  [SKIP] ${user.email} (already exists)`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
      },
    })

    if (error) {
      console.error(`  [ERROR] ${user.email}: ${error.message}`)
    } else {
      console.log(`  [OK] ${user.email} (${user.role})`)

      // Note: We can't set the UUID to a specific value via the admin API.
      // The profiles will need to be created with the actual UUIDs returned.
      // For demo purposes, we'll update the profile with the correct role.
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        })
      }
    }
  }

  console.log('\nDone! Auth users created.')
  console.log('\nIMPORTANT: Since Supabase assigns random UUIDs to auth users,')
  console.log('the seed.sql file references fixed UUIDs that may not match.')
  console.log('For a full demo, you may need to update the seed.sql UUIDs')
  console.log('to match the actual UUIDs created by this script,')
  console.log('OR use the Supabase dashboard SQL editor to run seed.sql')
  console.log('after manually creating users with matching UUIDs.')
  console.log('\nAlternatively, use the Supabase Dashboard to:')
  console.log('1. Go to Authentication > Users')
  console.log('2. Create users manually')
  console.log('3. Note their UUIDs')
  console.log('4. Run seed.sql with updated UUIDs')
}

seedUsers().catch(console.error)
