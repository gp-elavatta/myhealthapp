'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { ClipboardList, Clock, DollarSign, CheckCircle } from 'lucide-react'

export default function ClinicServicesPage() {
  const { profile, loading: authLoading } = useAuth()
  const [services, setServices] = useState<any[]>([])
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
        .from('clinic_services')
        .select('*, service:services(*, category:service_categories(name))')
        .eq('clinic_id', clinicId)
        .order('created_at')

      setServices(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>

        {services.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No services" description="No services configured for this clinic." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((cs) => (
              <Card key={cs.id}>
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{cs.service?.name}</h3>
                      <Badge variant={cs.is_available ? 'success' : 'secondary'}>
                        {cs.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    {cs.service?.description && <p className="text-xs text-gray-500">{cs.service.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cs.duration_override || cs.service?.default_duration} min</span>
                      {cs.price && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${cs.price}</span>}
                      {cs.service?.category && <span>{cs.service.category.name}</span>}
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
