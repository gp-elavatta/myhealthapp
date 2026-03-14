'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Phone, CheckCircle, XCircle, PhoneCall } from 'lucide-react'
import { getStatusColor, formatRelativeTime } from '@/lib/utils'

export default function ClinicCallbacksPage() {
  const { profile, loading: authLoading } = useAuth()
  const [callbacks, setCallbacks] = useState<any[]>([])
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCallbacks = useCallback(async () => {
    if (!profile) return

    const { data: staff } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    let cId = staff?.clinic_id
    if (!cId) {
      const { data: pract } = await supabase
        .from('practitioners')
        .select('clinic_id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1)
        .single()
      cId = pract?.clinic_id
    }
    if (!cId) { setLoading(false); return }
    setClinicId(cId)

    const { data } = await supabase
      .from('callback_requests')
      .select('*, patient:profiles(full_name, email)')
      .eq('clinic_id', cId)
      .order('created_at', { ascending: false })
      .limit(50)

    setCallbacks(data || [])
    setLoading(false)
  }, [profile, supabase])

  useEffect(() => { fetchCallbacks() }, [fetchCallbacks])

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status, handled_by: profile!.id }
    if (status === 'attempted') updates.attempted_at = new Date().toISOString()
    if (status === 'completed') updates.completed_at = new Date().toISOString()

    await supabase.from('callback_requests').update(updates).eq('id', id)
    fetchCallbacks()
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const pending = callbacks.filter(c => c.status === 'pending')
  const others = callbacks.filter(c => c.status !== 'pending')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Callback Requests</h1>

        {callbacks.length === 0 ? (
          <EmptyState icon={Phone} title="No callback requests" description="No patients have requested callbacks." />
        ) : (
          <>
            {pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Pending ({pending.length})</h2>
                {pending.map(cb => (
                  <Card key={cb.id} className="border-amber-200">
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cb.patient?.full_name}</p>
                        <p className="text-sm text-gray-500">{cb.phone} · {formatRelativeTime(cb.created_at)}</p>
                        {cb.reason && <p className="text-xs text-gray-400">{cb.reason}</p>}
                        {cb.preferred_time && <p className="text-xs text-gray-400">Preferred: {cb.preferred_time}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(cb.id, 'attempted')}>
                          <PhoneCall className="h-4 w-4 mr-1" />Attempted
                        </Button>
                        <Button size="sm" onClick={() => updateStatus(cb.id, 'completed')}>
                          <CheckCircle className="h-4 w-4 mr-1" />Done
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {others.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">History</h2>
                {others.map(cb => (
                  <Card key={cb.id} className="opacity-60">
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cb.patient?.full_name}</p>
                        <p className="text-sm text-gray-500">{cb.phone}</p>
                      </div>
                      <Badge className={getStatusColor(cb.status)}>{cb.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
