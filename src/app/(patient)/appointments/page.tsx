'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Clock, MapPin, Video, Search } from 'lucide-react'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'

export default function AppointmentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetchAppointments = async () => {
      const today = new Date().toISOString().split('T')[0]

      const [upRes, pastRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, clinic:clinics(name), practitioner:practitioners(title, profile:profiles(full_name)), service:services(name)')
          .eq('patient_id', profile.id)
          .gte('appointment_date', today)
          .in('status', ['scheduled', 'checked_in', 'in_progress'])
          .order('appointment_date', { ascending: true }),
        supabase
          .from('appointments')
          .select('*, clinic:clinics(name), practitioner:practitioners(title, profile:profiles(full_name)), service:services(name)')
          .eq('patient_id', profile.id)
          .or(`appointment_date.lt.${today},status.in.(completed,cancelled,no_show)`)
          .order('appointment_date', { ascending: false })
          .limit(20),
      ])

      setUpcoming(upRes.data || [])
      setPast(pastRes.data || [])
      setLoading(false)
    }
    fetchAppointments()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const AppointmentCard = ({ appt }: { appt: any }) => (
    <Link href={`/appointments/${appt.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              {appt.is_virtual ? <Video className="h-6 w-6 text-blue-600" /> : <Calendar className="h-6 w-6 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{appt.clinic?.name}</p>
                <Badge className={getStatusColor(appt.status)}>{appt.status.replace('_', ' ')}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
              </p>
              {appt.practitioner && (
                <p className="text-xs text-gray-400">
                  {appt.practitioner.title} {appt.practitioner.profile?.full_name}
                  {appt.service && ` · ${appt.service.name}`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">View and manage your appointments</p>
          </div>
          <Button asChild>
            <Link href="/clinics"><Search className="h-4 w-4 mr-2" />Book New</Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="Find a clinic and book your next appointment."
                action={<Button asChild><Link href="/clinics">Find a Clinic</Link></Button>}
              />
            ) : (
              <div className="space-y-3 mt-4">
                {upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState icon={Calendar} title="No past appointments" description="Your appointment history will appear here." />
            ) : (
              <div className="space-y-3 mt-4">
                {past.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
