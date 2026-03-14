'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Video, Play, CheckCircle } from 'lucide-react'
import { getStatusColor, formatDateTime, formatRelativeTime } from '@/lib/utils'

export default function ClinicVirtualConsultPage() {
  const { profile, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data: staff } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1)
        .single()
      let clinicId = staff?.clinic_id
      if (!clinicId) {
        const { data: pract } = await supabase
          .from('practitioners')
          .select('clinic_id')
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .limit(1)
          .single()
        clinicId = pract?.clinic_id
      }
      if (!clinicId) { setLoading(false); return }

      const { data } = await supabase
        .from('virtual_sessions')
        .select('*, patient:profiles!virtual_sessions_patient_id_fkey(full_name), practitioner:practitioners(title, profile:profiles(full_name))')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(30)

      setSessions(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  const updateSession = async (id: string, status: string) => {
    const updates: any = { status }
    if (status === 'in_progress') updates.started_at = new Date().toISOString()
    if (status === 'completed') updates.ended_at = new Date().toISOString()
    await supabase.from('virtual_sessions').update(updates).eq('id', id)
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Virtual Consultations</h1>

        {sessions.length === 0 ? (
          <EmptyState icon={Video} title="No virtual sessions" description="Virtual consultation sessions will appear here." />
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <Card key={s.id}>
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{s.patient?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {s.practitioner?.title} {s.practitioner?.profile?.full_name} · {formatRelativeTime(s.created_at)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(s.status)}>{s.status.replace('_', ' ')}</Badge>
                  {s.status === 'waiting' && (
                    <Button size="sm" onClick={() => updateSession(s.id, 'in_progress')}>
                      <Play className="h-4 w-4 mr-1" />Start
                    </Button>
                  )}
                  {s.status === 'in_progress' && (
                    <Button size="sm" variant="default" onClick={() => updateSession(s.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-1" />End
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
