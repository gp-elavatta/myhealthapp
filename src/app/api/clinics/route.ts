import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      *,
      clinic_locations(*),
      clinic_hours(*),
      wait_time_snapshots(estimated_wait_minutes, queue_depth, created_at),
      clinic_services(*, service:services(*))
    `)
    .eq('status', 'approved')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
