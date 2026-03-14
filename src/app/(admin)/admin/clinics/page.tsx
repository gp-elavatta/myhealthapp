'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/loading'
import { Building2, MapPin, CheckCircle, XCircle, Search } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'

export default function AdminClinicsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    const fetch = async () => {
      let query = supabase
        .from('clinics')
        .select('*, clinic_locations(city, province)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      const { data } = await query
      setClinics(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, statusFilter, supabase])

  const updateStatus = async (clinicId: string, newStatus: string) => {
    await supabase.from('clinics').update({ status: newStatus }).eq('id', clinicId)
    setClinics(clinics.map(c => c.id === clinicId ? { ...c, status: newStatus } : c))
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const filtered = search
    ? clinics.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : clinics

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Clinics</h1>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search clinics..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filtered.map(clinic => (
            <Card key={clinic.id}>
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{clinic.name}</p>
                    <Badge className={getStatusColor(clinic.status)}>{clinic.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clinic.clinic_locations?.[0]?.city}, {clinic.clinic_locations?.[0]?.province}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {clinic.status !== 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(clinic.id, 'approved')}>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />Approve
                    </Button>
                  )}
                  {clinic.status !== 'disabled' && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(clinic.id, 'disabled')}>
                      <XCircle className="h-4 w-4 mr-1 text-red-500" />Disable
                    </Button>
                  )}
                  {clinic.status === 'disabled' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(clinic.id, 'approved')}>
                      Re-enable
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
