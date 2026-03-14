'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loading'
import { BarChart3, TrendingUp, Calendar, Users, Clock, Building2 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [data, setData] = useState<any>({
    appointmentsByStatus: {},
    clinicsByStatus: {},
    totalAppointments: 0,
    totalPatients: 0,
    totalClinics: 0,
    avgWaitTime: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    const fetch = async () => {
      const [appts, clinics, patients, waitTimes] = await Promise.all([
        supabase.from('appointments').select('status'),
        supabase.from('clinics').select('status'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
        supabase.from('wait_time_snapshots').select('estimated_wait_minutes').order('created_at', { ascending: false }).limit(100),
      ])

      const apptsByStatus: Record<string, number> = {}
      ;(appts.data || []).forEach((a: any) => {
        apptsByStatus[a.status] = (apptsByStatus[a.status] || 0) + 1
      })

      const clinicsByStatus: Record<string, number> = {}
      ;(clinics.data || []).forEach((c: any) => {
        clinicsByStatus[c.status] = (clinicsByStatus[c.status] || 0) + 1
      })

      const waits = (waitTimes.data || []).map((w: any) => w.estimated_wait_minutes)
      const avgWait = waits.length ? Math.round(waits.reduce((a: number, b: number) => a + b, 0) / waits.length) : 0

      setData({
        appointmentsByStatus: apptsByStatus,
        clinicsByStatus: clinicsByStatus,
        totalAppointments: appts.data?.length || 0,
        totalPatients: patients.count || 0,
        totalClinics: clinics.data?.length || 0,
        avgWaitTime: avgWait,
      })
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600" />
          Analytics
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Appointments', value: data.totalAppointments, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Patients', value: data.totalPatients, icon: Users, color: 'text-green-600 bg-green-50' },
            { label: 'Total Clinics', value: data.totalClinics, icon: Building2, color: 'text-purple-600 bg-purple-50' },
            { label: 'Avg Wait Time', value: `${data.avgWaitTime} min`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointments by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointments by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.appointmentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${((count as number) / data.totalAppointments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinics by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clinics by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.clinicsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${((count as number) / data.totalClinics) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
