'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Stethoscope, Building2, Search } from 'lucide-react'

export default function AdminPractitionersPage() {
  const { profile, loading: authLoading } = useAuth()
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    const fetch = async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('*, profile:profiles(full_name, email), clinic:clinics(name)')
        .order('created_at', { ascending: false })
      setPractitioners(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const filtered = search
    ? practitioners.filter(p =>
        p.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.clinic?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : practitioners

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">All Practitioners</h1>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search practitioners..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} title="No practitioners found" description="No practitioners match your search." />
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Card key={p.id}>
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold shrink-0">
                    {p.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{p.title} {p.profile?.full_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{p.clinic?.name}
                    </p>
                    {p.specialty && <p className="text-xs text-gray-400">{p.specialty}</p>}
                  </div>
                  <Badge variant={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
