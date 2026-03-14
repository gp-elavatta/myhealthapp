'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { Video, ArrowLeft, Clock, User, CheckCircle } from 'lucide-react'
import { getStatusColor, formatDateTime } from '@/lib/utils'

export default function VirtualConsultPage() {
  const { id } = useParams()
  const { profile, loading: authLoading } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data } = await supabase
        .from('virtual_sessions')
        .select('*, clinic:clinics(name), practitioner:practitioners(title, profile:profiles(full_name)), appointment:appointments(*)')
        .eq('id', id)
        .eq('patient_id', profile.id)
        .single()
      setSession(data)
      setLoading(false)
    }
    fetch()
  }, [profile, id, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>
  if (!session) return <DashboardLayout><div className="text-center py-12 text-gray-500">Session not found</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <Link href="/appointments" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />Back to appointments
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Virtual Consultation</h1>
          <Badge className={getStatusColor(session.status)}>{session.status.replace('_', ' ')}</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <Video className="h-10 w-10 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{session.clinic?.name}</h2>
              <p className="text-gray-500">
                with {session.practitioner?.title} {session.practitioner?.profile?.full_name}
              </p>

              {session.status === 'waiting' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-800">Waiting for practitioner to join...</p>
                  <p className="text-xs text-blue-600 mt-1">You will be connected shortly</p>
                </div>
              )}

              {session.status === 'in_progress' && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Session in progress</p>
                  <p className="text-xs text-green-600 mt-1">Virtual consultation is active</p>
                  <div className="mt-4 p-8 bg-gray-900 rounded-xl text-white text-sm">
                    Video consultation interface placeholder
                  </div>
                </div>
              )}

              {session.status === 'completed' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-800">Session completed</p>
                  {session.duration_minutes && (
                    <p className="text-xs text-gray-500 mt-1">Duration: {session.duration_minutes} minutes</p>
                  )}
                </div>
              )}

              {session.status === 'scheduled' && (
                <div className="mt-6">
                  <Button size="lg" className="px-8">
                    <Video className="h-4 w-4 mr-2" />Join Waiting Room
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
