'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Calendar, Clock, Phone, Bell, ArrowRight,
  Search, MapPin, Users, CheckCircle,
} from 'lucide-react'
import { formatDate, formatTime, getStatusColor, formatRelativeTime } from '@/lib/utils'

export default function PatientDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [activeWaitlist, setActiveWaitlist] = useState<any[]>([])
  const [pendingCallbacks, setPendingCallbacks] = useState<any[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return

    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]

      const [appts, waitlist, callbacks, notifications] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, clinic:clinics(name, slug), practitioner:practitioners(title, profile:profiles(full_name)), service:services(name)')
          .eq('patient_id', profile.id)
          .gte('appointment_date', today)
          .in('status', ['scheduled', 'checked_in'])
          .order('appointment_date', { ascending: true })
          .limit(5),
        supabase
          .from('waitlist_entries')
          .select('*, clinic:clinics(name)')
          .eq('patient_id', profile.id)
          .in('status', ['waiting', 'notified'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('callback_requests')
          .select('*, clinic:clinics(name)')
          .eq('patient_id', profile.id)
          .in('status', ['pending', 'attempted'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setUpcomingAppointments(appts.data || [])
      setActiveWaitlist(waitlist.data || [])
      setPendingCallbacks(callbacks.data || [])
      setRecentNotifications(notifications.data || [])
      setLoading(false)
    }

    fetchData()
  }, [profile, supabase])

  if (authLoading || loading) {
    return <DashboardLayout><PageLoader /></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Manage your appointments and healthcare</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/clinics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-4 text-center">
                <Search className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Find Clinic</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/appointments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-4 text-center">
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Appointments</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/waitlist">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-4 text-center">
                <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Waitlist</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/callbacks">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-4 text-center">
                <Phone className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Callbacks</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/appointments">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming appointments"
                  description="Book an appointment at a clinic near you."
                  action={<Button size="sm" asChild><Link href="/clinics">Find a Clinic</Link></Button>}
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appt) => (
                    <Link key={appt.id} href={`/appointments/${appt.id}`} className="block">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{appt.clinic?.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appt.status)}>{appt.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Waitlist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Active Waitlist</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/waitlist">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeWaitlist.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No active waitlist entries"
                  description="Join a waitlist to get notified when a spot opens."
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {activeWaitlist.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{entry.clinic?.name}</p>
                        <p className="text-xs text-gray-500">
                          Position: {entry.position || 'Pending'} &middot; {formatRelativeTime(entry.created_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Callbacks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Callback Requests</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/callbacks">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingCallbacks.length === 0 ? (
                <EmptyState
                  icon={Phone}
                  title="No pending callbacks"
                  description="Request a callback from any clinic."
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {pendingCallbacks.map((cb) => (
                    <div key={cb.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cb.clinic?.name}</p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(cb.created_at)}</p>
                      </div>
                      <Badge className={getStatusColor(cb.status)}>{cb.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentNotifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="All caught up"
                  description="No new notifications."
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50">
                      <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
