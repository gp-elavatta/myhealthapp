export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Clock, MapPin, Phone, Globe, Mail, Calendar, Users,
  Video, Stethoscope, ArrowLeft, UserPlus, PhoneCall, CheckCircle,
} from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, formatTime, isClinicOpenNow } from '@/lib/utils'
import type { DayOfWeek } from '@/lib/types/database'

async function getClinic(id: string) {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('clinics')
    .select(`
      *,
      clinic_locations(*),
      clinic_hours(*),
      wait_time_snapshots(estimated_wait_minutes, queue_depth, active_practitioners, created_at),
      clinic_services(*, service:services(*)),
      practitioners(*, profile:profiles(full_name, avatar_url))
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  return data
}

const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default async function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clinic = await getClinic(id)

  if (!clinic) notFound()

  const location = clinic.clinic_locations?.[0]
  const latestWait = clinic.wait_time_snapshots?.[0]
  const isOpen = isClinicOpenNow(clinic.clinic_hours || [])
  const sortedHours = [...(clinic.clinic_hours || [])].sort(
    (a: any, b: any) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/clinics" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to clinics
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
                      <Badge variant={isOpen ? 'success' : 'secondary'}>{isOpen ? 'Open Now' : 'Closed'}</Badge>
                    </div>
                    {location && (
                      <p className="text-gray-500 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {location.address}, {location.city}, {location.province} {location.postal_code}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {clinic.is_walk_in && <Badge variant="outline">Walk-in Welcome</Badge>}
                      {clinic.is_virtual && <Badge variant="outline"><Video className="h-3 w-3 mr-1" />Virtual Available</Badge>}
                      {clinic.is_appointment_only && <Badge variant="outline">Appointment Only</Badge>}
                    </div>
                  </div>

                  {latestWait && (
                    <div className="text-center p-4 rounded-xl bg-gray-50 min-w-[120px]">
                      <p className="text-xs text-gray-500 mb-1">Est. Wait</p>
                      <p className={`text-2xl font-bold ${latestWait.estimated_wait_minutes <= 15 ? 'text-green-600' : latestWait.estimated_wait_minutes <= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {formatWaitTime(latestWait.estimated_wait_minutes)}
                      </p>
                      {latestWait.queue_depth > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{latestWait.queue_depth} in queue</p>
                      )}
                    </div>
                  )}
                </div>

                {clinic.description && (
                  <p className="text-sm text-gray-600 mt-4 border-t border-gray-100 pt-4">{clinic.description}</p>
                )}

                {/* Contact info */}
                <div className="flex flex-wrap gap-4 mt-4 border-t border-gray-100 pt-4">
                  {clinic.phone && (
                    <a href={`tel:${clinic.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-700">
                      <Phone className="h-4 w-4" />{clinic.phone}
                    </a>
                  )}
                  {clinic.email && (
                    <a href={`mailto:${clinic.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-700">
                      <Mail className="h-4 w-4" />{clinic.email}
                    </a>
                  )}
                  {clinic.website && (
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-700">
                      <Globe className="h-4 w-4" />Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {clinic.clinic_services?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clinic.clinic_services.map((cs: any) => (
                      <div key={cs.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <CheckCircle className="h-4 w-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cs.service?.name}</p>
                          {cs.service?.description && (
                            <p className="text-xs text-gray-500">{cs.service.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practitioners */}
            {clinic.practitioners?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    Practitioners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clinic.practitioners.filter((p: any) => p.is_active).map((practitioner: any) => (
                      <div key={practitioner.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-medium shrink-0">
                          {practitioner.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {practitioner.title} {practitioner.profile?.full_name}
                          </p>
                          {practitioner.specialty && (
                            <p className="text-xs text-gray-500">{practitioner.specialty}</p>
                          )}
                          {practitioner.is_accepting_patients && (
                            <p className="text-xs text-green-600">Accepting patients</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link href={`/appointments/book?clinic=${clinic.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href={`/waitlist?clinic=${clinic.id}&action=join`}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Waitlist
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href={`/callbacks?clinic=${clinic.id}&action=request`}>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Request Callback
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedHours.map((h: any) => (
                    <div key={h.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{h.day_of_week}</span>
                      <span className={h.is_closed ? 'text-gray-400' : 'text-gray-900 font-medium'}>
                        {h.is_closed ? 'Closed' : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wait time info */}
            {latestWait && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Wait Time</span>
                      <span className={`font-medium ${getWaitTimeBg(latestWait.estimated_wait_minutes)} px-2 py-0.5 rounded-full`}>
                        {formatWaitTime(latestWait.estimated_wait_minutes)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Queue Depth</span>
                      <span className="font-medium text-gray-900">{latestWait.queue_depth} patients</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Doctors</span>
                      <span className="font-medium text-gray-900">{latestWait.active_practitioners}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
