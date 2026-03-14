'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageLoader } from '@/components/ui/loading'
import { Settings, Save, CheckCircle } from 'lucide-react'

export default function ClinicSettingsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [clinic, setClinic] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', description: '', phone: '', email: '', website: '',
    is_walk_in: false, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
      if (!staff) { setLoading(false); return }

      const { data } = await supabase.from('clinics').select('*').eq('id', staff.clinic_id).single()
      if (data) {
        setClinic(data)
        setForm({
          name: data.name || '', description: data.description || '',
          phone: data.phone || '', email: data.email || '', website: data.website || '',
          is_walk_in: data.is_walk_in, is_virtual: data.is_virtual,
          is_appointment_only: data.is_appointment_only,
          average_consult_duration: data.average_consult_duration,
        })
      }
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinic) return
    setSaving(true)
    await supabase.from('clinics').update(form).eq('id', clinic.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinic Settings</h1>

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-600" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Clinic Name</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Avg Consult Duration (min)</label>
                  <Input type="number" value={form.average_consult_duration} onChange={e => setForm({...form, average_consult_duration: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Clinic Type</h3>
                {[
                  { key: 'is_walk_in', label: 'Accept walk-in patients' },
                  { key: 'is_virtual', label: 'Offer virtual consultations' },
                  { key: 'is_appointment_only', label: 'Appointment only (no walk-ins)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={e => setForm({...form, [key]: e.target.checked})}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                </Button>
                {saved && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" />Saved</span>}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
