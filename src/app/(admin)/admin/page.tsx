'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Building2, Users, Calendar, Clock, Phone,
  TrendingUp, ArrowRight, Shield, BarChart3,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    totalClinics: 0,
    approvedClinics: 0,
    pendingClinics: 0,
    totalPractitioners: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    activeWaitlist: 0,
    pendingCallbacks: 0,
    totalPatients: 0,
  })
  const [recentClinics, setRecentClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    const fetch = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [clinics, practitioners, appts, todayAppts, waitlist, callbacks, patients, recent] = await Promise.all([
        supabase.from('clinics').select('id, status'),
        supabase.from('practitioners').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('appointment_date', today),
        supabase.from('waitlist_entries').select('id', { count: 'exact', head: true }).eq('status', 'waiting'),
        supabase.from('callback_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
        supabase.from('clinics').select('*, clinic_locations(city, province)').order('created_at', { ascending: false }).limit(5),
      ])

      const allClinics = clinics.data || []
      setStats({
        totalClinics: allClinics.length,
        approvedClinics: allClinics.filter(c => c.status === 'approved').length,
        pendingClinics: allClinics.filter(c => c.status === 'pending').length,
        totalPractitioners: practitioners.count || 0,
        totalAppointments: appts.count || 0,
        todayAppointments: todayAppts.count || 0,
        activeWaitlist: waitlist.count || 0,
        pendingCallbacks: callbacks.count || 0,
        totalPatients: patients.count || 0,
      })
      setRecentClinics(recent.data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>
  if (profile?.role !== 'platform_admin') {
    return <DashboardLayout><div className="text-center py-12 text-gray-500">Access denied. Platform admin only.</div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-900">Platform Admin</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Clinics', value: stats.totalClinics, icon: Building2, color: 'text-blue-600 bg-blue-50' },
            { label: 'Practitioners', value: stats.totalPractitioners, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-green-600 bg-green-50' },
            { label: 'Today Appts', value: stats.todayAppointments, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
            { label: 'Pending Clinics', value: stats.pendingClinics, icon: Clock, color: 'text-red-600 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} mb-2`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clinics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Clinics</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/clinics">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClinics.map((clinic) => (
                  <div key={clinic.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{clinic.name}</p>
                      <p className="text-xs text-gray-500">
                        {clinic.clinic_locations?.[0]?.city}, {clinic.clinic_locations?.[0]?.province}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${clinic.status === 'approved' ? 'bg-green-100 text-green-800' : clinic.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {clinic.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-600" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Total Appointments', value: stats.totalAppointments },
                  { label: 'Active Waitlist Entries', value: stats.activeWaitlist },
                  { label: 'Pending Callbacks', value: stats.pendingCallbacks },
                  { label: 'Approved Clinics', value: stats.approvedClinics },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Clinics', href: '/admin/clinics', icon: Building2 },
            { label: 'Practitioners', href: '/admin/practitioners', icon: Users },
            { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
            { label: 'Audit Logs', href: '/admin/audit-logs', icon: TrendingUp },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-4 pb-4 text-center">
                  <Icon className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
