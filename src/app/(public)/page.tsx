export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search, Clock, Calendar, MapPin, ArrowRight,
  Shield, Zap, Heart, Video, Users, CheckCircle,
} from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, isClinicOpenNow } from '@/lib/utils'

async function getFeaturedClinics() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clinics')
    .select(`
      *,
      clinic_locations(*),
      clinic_hours(*),
      wait_time_snapshots(estimated_wait_minutes, queue_depth, created_at),
      clinic_services(*, service:services(*))
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const clinics = await getFeaturedClinics()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Healthcare,{' '}
              <span className="text-teal-200">Skip the Wait</span>
            </h1>
            <p className="text-lg sm:text-xl text-teal-100 mb-8 max-w-2xl">
              Check real-time wait times, book appointments, and connect with clinics near you. Healthcare access made simple.
            </p>

            {/* Search bar */}
            <form action="/clinics" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by city, postal code, or clinic name..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-gray-900 bg-white border-0 shadow-lg focus:ring-2 focus:ring-teal-300 text-sm"
                />
              </div>
              <Button type="submit" size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg h-12 px-6">
                Search
              </Button>
            </form>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-10 text-sm text-teal-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Real-time wait times</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Virtual consults available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Get the care you need in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Search', desc: 'Find clinics near you by city, postal code, or service. Filter by wait time, availability, and more.' },
              { icon: Calendar, title: 'Book or Join', desc: 'Book an appointment, join a waitlist, or request a callback. Choose what works best for you.' },
              { icon: Heart, title: 'Get Care', desc: 'Visit in person or connect virtually. Track your queue position and get real-time updates.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 mb-5">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: 'Live Wait Times', desc: 'See estimated wait times before you go', color: 'bg-blue-50 text-blue-700' },
              { icon: Video, title: 'Virtual Consults', desc: 'Connect with doctors from home', color: 'bg-purple-50 text-purple-700' },
              { icon: Zap, title: 'Quick Booking', desc: 'Book appointments in under a minute', color: 'bg-amber-50 text-amber-700' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your health data is protected', color: 'bg-green-50 text-green-700' },
            ].map((feature, i) => (
              <Card key={i} className="border-0 shadow-none bg-gray-50 hover:bg-gray-100 transition-colors">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.color} mb-3`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clinics */}
      {clinics.length > 0 && (
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Nearby Clinics</h2>
                <p className="text-gray-500">Browse clinics with real-time wait times</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/clinics">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic: any) => {
                const location = clinic.clinic_locations?.[0]
                const latestWait = clinic.wait_time_snapshots?.[0]
                const isOpen = isClinicOpenNow(clinic.clinic_hours || [])
                return (
                  <Link key={clinic.id} href={`/clinics/${clinic.id}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{clinic.name}</h3>
                            {location && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {location.city}, {location.province}
                              </p>
                            )}
                          </div>
                          <Badge variant={isOpen ? 'success' : 'secondary'}>
                            {isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          {latestWait && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getWaitTimeBg(latestWait.estimated_wait_minutes)}`}>
                              <Clock className="h-3 w-3" />
                              {formatWaitTime(latestWait.estimated_wait_minutes)}
                            </div>
                          )}
                          {clinic.is_walk_in && <Badge variant="outline">Walk-in</Badge>}
                          {clinic.is_virtual && <Badge variant="outline">Virtual</Badge>}
                        </div>

                        {latestWait && latestWait.queue_depth > 0 && (
                          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {latestWait.queue_depth} in queue
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to find care?</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Join thousands of patients who use MyHealthMap to find clinics, check wait times, and book appointments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="xl" asChild>
              <Link href="/clinics">Find a Clinic</Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
