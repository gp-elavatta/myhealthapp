'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/loading'
import {
  Calendar, ArrowLeft, Clock, CheckCircle, Stethoscope,
} from 'lucide-react'
import { formatTime } from '@/lib/utils'

function BookAppointmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic')
  const { profile, loading: authLoading } = useAuth()
  const [clinic, setClinic] = useState<any>(null)
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  const [form, setForm] = useState({
    practitioner_id: '',
    service_id: '',
    appointment_date: '',
    start_time: '',
    reason: '',
    is_virtual: false,
  })

  const supabase = createClient()

  useEffect(() => {
    if (!clinicId) return
    const fetch = async () => {
      const [clinicRes, practRes, svcRes] = await Promise.all([
        supabase.from('clinics').select('*').eq('id', clinicId).single(),
        supabase.from('practitioners').select('*, profile:profiles(full_name)').eq('clinic_id', clinicId).eq('is_active', true),
        supabase.from('clinic_services').select('*, service:services(*)').eq('clinic_id', clinicId).eq('is_available', true),
      ])
      setClinic(clinicRes.data)
      setPractitioners(practRes.data || [])
      setServices(svcRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [clinicId, supabase])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !clinicId) return
    setBooking(true)

    const duration = form.service_id
      ? (services.find((s: any) => s.service_id === form.service_id)?.duration_override || 15)
      : (clinic?.average_consult_duration || 15)

    const [hours, minutes] = form.start_time.split(':').map(Number)
    const endDate = new Date()
    endDate.setHours(hours, minutes + duration, 0)
    const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

    const { error } = await supabase.from('appointments').insert({
      patient_id: profile.id,
      clinic_id: clinicId,
      practitioner_id: form.practitioner_id || null,
      service_id: form.service_id || null,
      appointment_date: form.appointment_date,
      start_time: form.start_time,
      end_time,
      reason: form.reason || null,
      is_virtual: form.is_virtual,
      status: 'scheduled',
    })

    setBooking(false)
    if (!error) {
      setBooked(true)
      setTimeout(() => router.push('/appointments'), 2000)
    }
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  if (!clinicId || !clinic) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Please select a clinic first.</p>
          <Button asChild><Link href="/clinics">Find a Clinic</Link></Button>
        </div>
      </DashboardLayout>
    )
  }

  if (booked) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="rounded-full bg-green-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-500">Redirecting to your appointments...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Generate time slots
  const timeSlots: string[] = []
  for (let h = 8; h < 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <Link href={`/clinics/${clinicId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />Back to clinic
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500 mt-1">at {clinic.name}</p>
        </div>

        <form onSubmit={handleBook}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date *</label>
                <Input
                  type="date"
                  value={form.appointment_date}
                  onChange={e => setForm({...form, appointment_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Time *</label>
                <Select value={form.start_time} onValueChange={v => setForm({...form, start_time: v})}>
                  <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(t => (
                      <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {practitioners.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Practitioner (optional)</label>
                  <Select value={form.practitioner_id} onValueChange={v => setForm({...form, practitioner_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Any available" /></SelectTrigger>
                    <SelectContent>
                      {practitioners.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title} {p.profile?.full_name} {p.specialty ? `(${p.specialty})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {services.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Service (optional)</label>
                  <Select value={form.service_id} onValueChange={v => setForm({...form, service_id: v})}>
                    <SelectTrigger><SelectValue placeholder="General visit" /></SelectTrigger>
                    <SelectContent>
                      {services.map((cs: any) => (
                        <SelectItem key={cs.service_id} value={cs.service_id}>
                          {cs.service?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {clinic.is_virtual && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_virtual}
                    onChange={e => setForm({...form, is_virtual: e.target.checked})}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Virtual consultation</span>
                </label>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Reason for visit (optional)</label>
                <Textarea
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={booking || !form.appointment_date || !form.start_time}>
                {booking ? 'Booking...' : 'Book Appointment'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function BookAppointmentPage() {
  return <Suspense><BookAppointmentContent /></Suspense>
}
