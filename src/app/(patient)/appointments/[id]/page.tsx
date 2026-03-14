'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar, Clock, MapPin, ArrowLeft, User, Stethoscope,
  XCircle, Video, AlertTriangle,
} from 'lucide-react'
import { formatDate, formatTime, getStatusColor, formatDateTime } from '@/lib/utils'

export default function AppointmentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetch = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*, clinic:clinics(name, phone, email), practitioner:practitioners(title, specialty, profile:profiles(full_name)), service:services(name, description)')
        .eq('id', id)
        .eq('patient_id', profile.id)
        .single()
      setAppointment(data)
      setLoading(false)
    }
    fetch()
  }, [profile, id, supabase])

  const handleCancel = async () => {
    setCancelling(true)
    await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancelReason || null,
      })
      .eq('id', id)
    setCancelling(false)
    setShowCancelDialog(false)
    router.push('/appointments')
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>
  if (!appointment) return <DashboardLayout><div className="text-center py-12 text-gray-500">Appointment not found</div></DashboardLayout>

  const canCancel = ['scheduled', 'checked_in'].includes(appointment.status)

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <Link href="/appointments" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />Back to appointments
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
          <Badge className={`${getStatusColor(appointment.status)} text-sm`}>{appointment.status.replace('_', ' ')}</Badge>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(appointment.appointment_date)}<br/>
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Clinic</p>
                  <p className="text-sm text-gray-500">{appointment.clinic?.name}</p>
                  {appointment.is_virtual && <Badge variant="outline" className="mt-1"><Video className="h-3 w-3 mr-1" />Virtual</Badge>}
                </div>
              </div>
              {appointment.practitioner && (
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Practitioner</p>
                    <p className="text-sm text-gray-500">
                      {appointment.practitioner.title} {appointment.practitioner.profile?.full_name}
                    </p>
                    {appointment.practitioner.specialty && (
                      <p className="text-xs text-gray-400">{appointment.practitioner.specialty}</p>
                    )}
                  </div>
                </div>
              )}
              {appointment.service && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service</p>
                    <p className="text-sm text-gray-500">{appointment.service.name}</p>
                  </div>
                </div>
              )}
            </div>

            {appointment.reason && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Reason for Visit</p>
                <p className="text-sm text-gray-500">{appointment.reason}</p>
              </div>
            )}

            {appointment.notes && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                <p className="text-sm text-gray-500">{appointment.notes}</p>
              </div>
            )}

            {appointment.cancelled_at && (
              <div className="border-t border-gray-100 pt-4 text-red-600">
                <p className="text-sm font-medium">Cancelled {formatDateTime(appointment.cancelled_at)}</p>
                {appointment.cancellation_reason && <p className="text-sm">{appointment.cancellation_reason}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {canCancel && (
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="h-4 w-4 mr-2" />Cancel Appointment
            </Button>
          </div>
        )}

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Cancel Appointment
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Appointment</Button>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
