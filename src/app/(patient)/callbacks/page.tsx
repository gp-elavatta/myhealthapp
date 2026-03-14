'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Phone, CheckCircle } from 'lucide-react'
import { getStatusColor, formatRelativeTime } from '@/lib/utils'

function CallbacksContent() {
  const { profile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic')
  const action = searchParams.get('action')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(action === 'request' && !!clinicId)
  const [submitting, setSubmitting] = useState(false)
  const [clinic, setClinic] = useState<any>(null)
  const [form, setForm] = useState({
    phone: '',
    reason: '',
    preferred_time: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data } = await supabase
        .from('callback_requests')
        .select('*, clinic:clinics(name)')
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false })
      setRequests(data || [])

      if (clinicId) {
        const { data: c } = await supabase.from('clinics').select('name').eq('id', clinicId).single()
        setClinic(c)
      }
      setForm(f => ({ ...f, phone: profile.phone || '' }))
      setLoading(false)
    }
    fetch()
  }, [profile, clinicId, supabase])

  const handleSubmit = async () => {
    if (!profile || !clinicId || !form.phone) return
    setSubmitting(true)
    await supabase.from('callback_requests').insert({
      patient_id: profile.id,
      clinic_id: clinicId,
      phone: form.phone,
      reason: form.reason || null,
      preferred_time: form.preferred_time || null,
      status: 'pending',
    })
    setSubmitting(false)
    setShowDialog(false)
    const { data } = await supabase
      .from('callback_requests')
      .select('*, clinic:clinics(name)')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Callback Requests</h1>
          <p className="text-gray-500 mt-1">Track your callback requests</p>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            icon={Phone}
            title="No callback requests"
            description="Request a callback from any clinic."
            action={<Button asChild><Link href="/clinics">Find a Clinic</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <Card key={req.id}>
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{req.clinic?.name}</p>
                    <p className="text-sm text-gray-500">{req.phone} &middot; {formatRelativeTime(req.created_at)}</p>
                    {req.reason && <p className="text-xs text-gray-400">{req.reason}</p>}
                  </div>
                  <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Callback{clinic ? ` - ${clinic.name}` : ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Preferred Time</label>
                <Input value={form.preferred_time} onChange={e => setForm({...form, preferred_time: e.target.value})} placeholder="e.g., Afternoon, After 2pm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Why do you need a callback?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.phone}>{submitting ? 'Submitting...' : 'Request Callback'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function CallbacksPage() {
  return <Suspense><CallbacksContent /></Suspense>
}
