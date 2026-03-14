'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Stethoscope, CheckCircle, XCircle } from 'lucide-react'

export default function ClinicPractitionersPage() {
  const { profile, loading: authLoading } = useAuth()
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data: staff } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1)
        .single()

      let clinicId = staff?.clinic_id
      if (!clinicId) {
        const { data: pract } = await supabase
          .from('practitioners')
          .select('clinic_id')
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .limit(1)
          .single()
        clinicId = pract?.clinic_id
      }
      if (!clinicId) { setLoading(false); return }

      const { data } = await supabase
        .from('practitioners')
        .select('*, profile:profiles(full_name, email, phone), availability:practitioner_availability(*)')
        .eq('clinic_id', clinicId)
        .order('created_at')

      setPractitioners(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Practitioners</h1>

        {practitioners.length === 0 ? (
          <EmptyState icon={Stethoscope} title="No practitioners" description="No practitioners are registered for this clinic." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practitioners.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-lg shrink-0">
                      {p.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {p.title} {p.profile?.full_name}
                        </h3>
                        <Badge variant={p.is_active ? 'success' : 'secondary'}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {p.specialty && <p className="text-sm text-gray-500">{p.specialty}</p>}
                      <p className="text-xs text-gray-400 mt-1">{p.profile?.email}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {p.is_accepting_patients ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />Accepting patients
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle className="h-3 w-3" />Not accepting
                          </span>
                        )}
                      </div>
                      {p.bio && <p className="text-xs text-gray-500 mt-2">{p.bio}</p>}
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
