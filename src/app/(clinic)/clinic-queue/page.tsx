'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Users, UserPlus, Phone as PhoneIcon, Play, CheckCircle, UserX,
  Clock, Bell, Megaphone,
} from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, formatRelativeTime, getStatusColor } from '@/lib/utils'

export default function ClinicQueuePage() {
  const { profile, loading: authLoading } = useAuth()
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [queueEntries, setQueueEntries] = useState<any[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([])
  const [latestWait, setLatestWait] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showWaitTimeDialog, setShowWaitTimeDialog] = useState(false)
  const [walkInName, setWalkInName] = useState('')
  const [manualWait, setManualWait] = useState('')
  const supabase = createClient()

  const fetchData = useCallback(async () => {
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

    const [queueRes, waitlistRes, waitRes] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('*, patient:profiles(full_name, phone)')
        .eq('clinic_id', cId)
        .in('status', ['waiting', 'called', 'in_progress'])
        .order('queue_number'),
      supabase
        .from('waitlist_entries')
        .select('*, patient:profiles(full_name, phone)')
        .eq('clinic_id', cId)
        .eq('status', 'waiting')
        .order('position'),
      supabase
        .from('wait_time_snapshots')
        .select('*')
        .eq('clinic_id', cId)
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    setQueueEntries(queueRes.data || [])
    setWaitlistEntries(waitlistRes.data || [])
    setLatestWait(waitRes.data?.[0] || null)
    setLoading(false)
  }, [profile, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  useRealtime('queue_entries', clinicId ? `clinic_id=eq.${clinicId}` : null,
    useCallback(() => { fetchData() }, [fetchData])
  )

  const addWalkIn = async () => {
    if (!clinicId) return
    const { data: nextNum } = await supabase.rpc('get_next_queue_number', { p_clinic_id: clinicId })
    await supabase.from('queue_entries').insert({
      clinic_id: clinicId,
      patient_name: walkInName || 'Walk-in Patient',
      queue_number: nextNum || 1,
      status: 'waiting',
    })
    setWalkInName('')
    setShowAddDialog(false)
    fetchData()
  }

  const updateQueueStatus = async (entryId: string, newStatus: string) => {
    const updates: any = { status: newStatus }
    if (newStatus === 'called') updates.called_at = new Date().toISOString()
    if (newStatus === 'in_progress') updates.started_at = new Date().toISOString()
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString()

    await supabase.from('queue_entries').update(updates).eq('id', entryId)
    fetchData()
  }

  const setManualWaitTime = async () => {
    if (!clinicId || !manualWait) return
    const waiting = queueEntries.filter(q => q.status === 'waiting').length
    await supabase.from('wait_time_snapshots').insert({
      clinic_id: clinicId,
      estimated_wait_minutes: parseInt(manualWait),
      queue_depth: waiting,
      active_practitioners: latestWait?.active_practitioners || 1,
      is_manual_override: true,
    })
    setManualWait('')
    setShowWaitTimeDialog(false)
    fetchData()
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const waiting = queueEntries.filter(q => q.status === 'waiting')
  const called = queueEntries.filter(q => q.status === 'called')
  const inProgress = queueEntries.filter(q => q.status === 'in_progress')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Queue & Waitlist</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowWaitTimeDialog(true)}>
              <Clock className="h-4 w-4 mr-2" />Set Wait Time
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />Add Walk-in
            </Button>
          </div>
        </div>

        {/* Wait time display */}
        {latestWait && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-xl text-lg font-bold ${getWaitTimeBg(latestWait.estimated_wait_minutes)}`}>
                    {formatWaitTime(latestWait.estimated_wait_minutes)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Wait Time</p>
                    <p className="text-xs text-gray-500">
                      {latestWait.queue_depth} in queue · {latestWait.active_practitioners} practitioners
                      {latestWait.is_manual_override && ' · Manual override'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Updated {formatRelativeTime(latestWait.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Queue ({queueEntries.length})</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist ({waitlistEntries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            {queueEntries.length === 0 ? (
              <EmptyState icon={Users} title="Queue is empty" description="Add walk-in patients or check in appointments." />
            ) : (
              <div className="space-y-3 mt-4">
                {/* Called */}
                {called.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                      <Megaphone className="h-4 w-4" />Called ({called.length})
                    </h3>
                    {called.map(entry => (
                      <Card key={entry.id} className="border-yellow-200 bg-yellow-50/50 mb-2">
                        <CardContent className="pt-3 pb-3 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-sm font-bold text-yellow-800">{entry.queue_number}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{entry.patient?.full_name || entry.patient_name}</p>
                          </div>
                          <Button size="sm" onClick={() => updateQueueStatus(entry.id, 'in_progress')}>
                            <Play className="h-4 w-4 mr-1" />Start
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateQueueStatus(entry.id, 'no_show')}>
                            <UserX className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* In Progress */}
                {inProgress.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <Play className="h-4 w-4" />In Progress ({inProgress.length})
                    </h3>
                    {inProgress.map(entry => (
                      <Card key={entry.id} className="border-green-200 bg-green-50/50 mb-2">
                        <CardContent className="pt-3 pb-3 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold text-green-800">{entry.queue_number}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{entry.patient?.full_name || entry.patient_name}</p>
                          </div>
                          <Button size="sm" variant="default" onClick={() => updateQueueStatus(entry.id, 'completed')}>
                            <CheckCircle className="h-4 w-4 mr-1" />Done
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Waiting */}
                {waiting.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />Waiting ({waiting.length})
                    </h3>
                    {waiting.map(entry => (
                      <Card key={entry.id} className="mb-2">
                        <CardContent className="pt-3 pb-3 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{entry.queue_number}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{entry.patient?.full_name || entry.patient_name}</p>
                            <p className="text-xs text-gray-400">{formatRelativeTime(entry.check_in_time)}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => updateQueueStatus(entry.id, 'called')}>
                            <Bell className="h-4 w-4 mr-1" />Call
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="waitlist">
            {waitlistEntries.length === 0 ? (
              <EmptyState icon={Clock} title="Waitlist is empty" description="No patients are currently on the waitlist." />
            ) : (
              <div className="space-y-2 mt-4">
                {waitlistEntries.map(entry => (
                  <Card key={entry.id}>
                    <CardContent className="pt-3 pb-3 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                        {entry.position}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{entry.patient?.full_name}</p>
                        <p className="text-xs text-gray-500">{entry.patient?.phone} · {formatRelativeTime(entry.created_at)}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <PhoneIcon className="h-4 w-4 mr-1" />Notify
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add walk-in dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Walk-in Patient</DialogTitle></DialogHeader>
            <Input placeholder="Patient name" value={walkInName} onChange={e => setWalkInName(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={addWalkIn}>Add to Queue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set wait time dialog */}
        <Dialog open={showWaitTimeDialog} onOpenChange={setShowWaitTimeDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Set Wait Time (Manual Override)</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estimated wait (minutes)</label>
              <Input type="number" placeholder="e.g., 30" value={manualWait} onChange={e => setManualWait(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWaitTimeDialog(false)}>Cancel</Button>
              <Button onClick={setManualWaitTime} disabled={!manualWait}>Update Wait Time</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
