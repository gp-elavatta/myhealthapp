'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Calendar, Clock, User, CheckCircle, XCircle, UserX,
  Play, LogIn,
} from 'lucide-react'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'

export default function ClinicAppointmentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  const getClinicId = useCallback(async () => {
    if (!profile) return null
    const { data: staff } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    if (staff) return staff.clinic_id

    const { data: pract } = await supabase
      .from('practitioners')
      .select('clinic_id')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    return pract?.clinic_id || null
  }, [profile, supabase])

  const fetchAppointments = useCallback(async () => {
    const cId = clinicId || await getClinicId()
    if (!cId) { setLoading(false); return }
    setClinicId(cId)

    let query = supabase
      .from('appointments')
      .select('*, patient:profiles(full_name, phone), practitioner:practitioners(title, profile:profiles(full_name)), service:services(name)')
      .eq('clinic_id', cId)
      .eq('appointment_date', dateFilter)
      .order('start_time')

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }, [clinicId, dateFilter, statusFilter, getClinicId, supabase])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const updateStatus = async (apptId: string, newStatus: string) => {
    const updates: any = { status: newStatus }
    if (newStatus === 'checked_in') updates.checked_in_at = new Date().toISOString()
    if (newStatus === 'in_progress') updates.started_at = new Date().toISOString()
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString()
    if (newStatus === 'cancelled') updates.cancelled_at = new Date().toISOString()

    await supabase.from('appointments').update(updates).eq('id', apptId)
    fetchAppointments()
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

        <div className="flex flex-wrap gap-3">
          <Input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-auto"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {appointments.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments" description="No appointments found for the selected date and filters." />
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-bold text-gray-900">{formatTime(appt.start_time)}</p>
                      <p className="text-xs text-gray-400">{formatTime(appt.end_time)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{appt.patient?.full_name}</p>
                        <Badge className={getStatusColor(appt.status)}>{appt.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {appt.practitioner?.title} {appt.practitioner?.profile?.full_name}
                        {appt.service && ` · ${appt.service.name}`}
                      </p>
                      {appt.patient?.phone && <p className="text-xs text-gray-400">{appt.patient.phone}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {appt.status === 'scheduled' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(appt.id, 'checked_in')} title="Check In">
                            <LogIn className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(appt.id, 'no_show')} title="No Show">
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {appt.status === 'checked_in' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(appt.id, 'in_progress')} title="Start">
                          <Play className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {appt.status === 'in_progress' && (
                        <Button size="sm" variant="default" onClick={() => updateStatus(appt.id, 'completed')} title="Complete">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
