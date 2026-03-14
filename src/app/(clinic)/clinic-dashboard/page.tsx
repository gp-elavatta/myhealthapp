'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/loading'
import {
  Calendar, Clock, Users, Phone, TrendingUp, UserCheck,
  AlertCircle, Activity, ArrowRight,
} from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, formatTime } from '@/lib/utils'
import Link from 'next/link'

export default function ClinicDashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const [clinic, setClinic] = useState<any>(null)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    queueSize: 0,
    waitlistSize: 0,
    pendingCallbacks: 0,
    estimatedWait: 0,
    completedToday: 0,
    noShows: 0,
    activePractitioners: 0,
  })
  const [todayAppts, setTodayAppts] = useState<any[]>([])
  const [queueEntries, setQueueEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (!profile) return

    // Get clinic for this staff member
    const { data: staffData } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    // Also check practitioners table
    let clinicId = staffData?.clinic_id
    if (!clinicId) {
      const { data: practData } = await supabase
        .from('practitioners')
        .select('clinic_id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1)
        .single()
      clinicId = practData?.clinic_id
    }

    if (!clinicId) { setLoading(false); return }

    const { data: clinicData } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single()
    setClinic(clinicData)

    const today = new Date().toISOString().split('T')[0]

    const [appts, queue, waitlist, callbacks, waitTime] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, patient:profiles(full_name), practitioner:practitioners(title, profile:profiles(full_name)), service:services(name)')
        .eq('clinic_id', clinicId)
        .eq('appointment_date', today)
        .order('start_time'),
      supabase
        .from('queue_entries')
        .select('*, patient:profiles(full_name), practitioner:practitioners(title, profile:profiles(full_name))')
        .eq('clinic_id', clinicId)
        .in('status', ['waiting', 'called', 'in_progress'])
        .order('queue_number'),
      supabase
        .from('waitlist_entries')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'waiting'),
      supabase
        .from('callback_requests')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending'),
      supabase
        .from('wait_time_snapshots')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    const allAppts = appts.data || []
    const activeQueue = queue.data || []

    setTodayAppts(allAppts)
    setQueueEntries(activeQueue)
    setStats({
      todayAppointments: allAppts.length,
      queueSize: activeQueue.filter(q => q.status === 'waiting').length,
      waitlistSize: waitlist.data?.length || 0,
      pendingCallbacks: callbacks.data?.length || 0,
      estimatedWait: waitTime.data?.[0]?.estimated_wait_minutes || 0,
      completedToday: allAppts.filter((a: any) => a.status === 'completed').length,
      noShows: allAppts.filter((a: any) => a.status === 'no_show').length,
      activePractitioners: waitTime.data?.[0]?.active_practitioners || 0,
    })
    setLoading(false)
  }, [profile, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime updates
  useRealtime('queue_entries', clinic ? `clinic_id=eq.${clinic.id}` : null,
    useCallback(() => { fetchData() }, [fetchData])
  )
  useRealtime('appointments', clinic ? `clinic_id=eq.${clinic.id}` : null,
    useCallback(() => { fetchData() }, [fetchData])
  )

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>
  if (!clinic) return <DashboardLayout><div className="text-center py-12 text-gray-500">No clinic found for your account.</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
            <p className="text-gray-500 mt-1">Clinic Dashboard</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getWaitTimeBg(stats.estimatedWait)}`}>
            <Clock className="h-4 w-4" />
            {formatWaitTime(stats.estimatedWait)} wait
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Today\'s Appointments', value: stats.todayAppointments, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'In Queue', value: stats.queueSize, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Waitlist', value: stats.waitlistSize, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Pending Callbacks', value: stats.pendingCallbacks, icon: Phone, color: 'text-red-600 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Current Queue</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clinic-queue">Manage <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {queueEntries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Queue is empty</p>
              ) : (
                <div className="space-y-2">
                  {queueEntries.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {entry.queue_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.patient?.full_name || entry.patient_name || 'Walk-in'}
                        </p>
                      </div>
                      <Badge className={`text-xs ${entry.status === 'waiting' ? 'bg-blue-100 text-blue-800' : entry.status === 'called' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clinic-appointments">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No appointments today</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.slice(0, 8).map((appt) => (
                    <div key={appt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="text-xs text-gray-500 w-16 shrink-0">{formatTime(appt.start_time)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{appt.patient?.full_name}</p>
                        <p className="text-xs text-gray-400">{appt.service?.name || 'General'}</p>
                      </div>
                      <Badge className={`text-xs ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appt.status === 'checked_in' ? 'bg-purple-100 text-purple-800' : appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {appt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
              <p className="text-xs text-gray-500">Completed Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.noShows}</p>
              <p className="text-xs text-gray-500">No-Shows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{stats.activePractitioners}</p>
              <p className="text-xs text-gray-500">Active Practitioners</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
