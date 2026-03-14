'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Clock, CheckCircle, X } from 'lucide-react'
import { getStatusColor, formatRelativeTime, formatDate } from '@/lib/utils'

function WaitlistContent() {
  const { profile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic')
  const action = searchParams.get('action')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinDialog, setShowJoinDialog] = useState(action === 'join' && !!clinicId)
  const [joining, setJoining] = useState(false)
  const [joinForm, setJoinForm] = useState({
    preferred_date: '',
    notes: '',
  })
  const [clinic, setClinic] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data } = await supabase
        .from('waitlist_entries')
        .select('*, clinic:clinics(name)')
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false })
      setEntries(data || [])

      if (clinicId) {
        const { data: c } = await supabase.from('clinics').select('name').eq('id', clinicId).single()
        setClinic(c)
      }
      setLoading(false)
    }
    fetch()
  }, [profile, clinicId, supabase])

  const handleJoin = async () => {
    if (!profile || !clinicId) return
    setJoining(true)

    const { data: maxPos } = await supabase
      .from('waitlist_entries')
      .select('position')
      .eq('clinic_id', clinicId)
      .eq('status', 'waiting')
      .order('position', { ascending: false })
      .limit(1)

    const position = (maxPos?.[0]?.position || 0) + 1

    await supabase.from('waitlist_entries').insert({
      patient_id: profile.id,
      clinic_id: clinicId,
      status: 'waiting',
      position,
      preferred_date: joinForm.preferred_date || null,
      notes: joinForm.notes || null,
    })

    setJoining(false)
    setShowJoinDialog(false)
    // Refresh
    const { data } = await supabase
      .from('waitlist_entries')
      .select('*, clinic:clinics(name)')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
  }

  const handleCancel = async (entryId: string) => {
    await supabase.from('waitlist_entries').update({ status: 'cancelled' }).eq('id', entryId)
    setEntries(entries.map(e => e.id === entryId ? { ...e, status: 'cancelled' } : e))
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const active = entries.filter(e => ['waiting', 'notified'].includes(e.status))
  const inactive = entries.filter(e => !['waiting', 'notified'].includes(e.status))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
          <p className="text-gray-500 mt-1">Track your waitlist positions</p>
        </div>

        {active.length === 0 && inactive.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No waitlist entries"
            description="Join a clinic's waitlist to be notified when a spot opens up."
            action={<Button asChild><Link href="/clinics">Find a Clinic</Link></Button>}
          />
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Active ({active.length})</h2>
                {active.map(entry => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.clinic?.name}</p>
                        <p className="text-sm text-gray-500">Position: {entry.position || 'Pending'} &middot; Joined {formatRelativeTime(entry.created_at)}</p>
                        {entry.preferred_date && <p className="text-xs text-gray-400">Preferred date: {formatDate(entry.preferred_date)}</p>}
                      </div>
                      <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(entry.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {inactive.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">History ({inactive.length})</h2>
                {inactive.map(entry => (
                  <Card key={entry.id} className="opacity-60">
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.clinic?.name}</p>
                        <p className="text-sm text-gray-500">{formatRelativeTime(entry.created_at)}</p>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Waitlist{clinic ? ` - ${clinic.name}` : ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Preferred Date (optional)</label>
                <Input type="date" value={joinForm.preferred_date} onChange={e => setJoinForm({...joinForm, preferred_date: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                <Textarea value={joinForm.notes} onChange={e => setJoinForm({...joinForm, notes: e.target.value})} placeholder="Any notes for the clinic..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
              <Button onClick={handleJoin} disabled={joining}>{joining ? 'Joining...' : 'Join Waitlist'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function WaitlistPage() {
  return <Suspense><WaitlistContent /></Suspense>
}
