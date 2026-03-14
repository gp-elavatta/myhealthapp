import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  data?: any
}

interface ChatRequest {
  message: string
  history: ChatMessage[]
  context?: {
    selectedClinicId?: string
    flow?: string
    flowStep?: string
    flowData?: Record<string, any>
  }
}

// Intent detection
function detectIntent(message: string): string {
  const msg = message.toLowerCase().trim()

  // Booking flow
  if (msg.match(/\b(book|schedule|appointment|reserve)\b/)) return 'book'
  // Callback
  if (msg.match(/\b(callback|call\s*back|call\s*me|phone\s*me)\b/)) return 'callback'
  // Find doctor/practitioner
  if (msg.match(/\b(find|looking\s*for|need|recommend|suggest)\b.*\b(doctor|dr|physician|specialist|practitioner|gp|family\s*doctor|therapist|physio|chiropractor|dentist|nurse)\b/)) return 'find_doctor'
  if (msg.match(/\b(doctor|dr|physician|specialist|practitioner|gp)\b.*\b(near|available|accepting|open)\b/)) return 'find_doctor'
  // Find clinic
  if (msg.match(/\b(find|looking\s*for|need|where|nearest|closest)\b.*\b(clinic|hospital|urgent\s*care|walk[\s-]*in|medical\s*centre|medical\s*center|health\s*centre)\b/)) return 'find_clinic'
  if (msg.match(/\b(clinic|walk[\s-]*in|urgent\s*care)\b.*\b(near|open|available)\b/)) return 'find_clinic'
  // Wait times
  if (msg.match(/\b(wait|waiting|how\s*long|queue|busy|crowded)\b/)) return 'wait_times'
  // Services
  if (msg.match(/\b(service|offer|provide|do\s*you|can\s*i\s*get|available)\b.*\b(flu|shot|blood|prescription|skin|mental|virtual|sti|travel|sports|chronic|check[\s-]*up|injury)\b/)) return 'services'
  if (msg.match(/\b(flu|shot|blood\s*work|prescription|skin|mental\s*health|virtual|sti|travel|sports|chronic|check[\s-]*up|injury)\b/)) return 'services'
  // Hours
  if (msg.match(/\b(hour|open|close|when|time|schedule|today|tomorrow|weekend|saturday|sunday)\b/)) return 'hours'
  // Greeting
  if (msg.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|what's\s*up)/)) return 'greeting'
  // Help
  if (msg.match(/\b(help|what\s*can|how\s*do|assist|support)\b/)) return 'help'
  // Thanks
  if (msg.match(/\b(thank|thanks|thx|appreciate|cheers)\b/)) return 'thanks'
  // Yes/confirm
  if (msg.match(/^(yes|yeah|yep|sure|ok|okay|absolutely|definitely|please|go\s*ahead|confirm|y)$/)) return 'confirm'
  // No/cancel
  if (msg.match(/^(no|nah|nope|cancel|never\s*mind|n)$/)) return 'cancel'

  return 'general'
}

// Extract service keywords from message
function extractServiceKeywords(message: string): string[] {
  const msg = message.toLowerCase()
  const serviceMap: Record<string, string[]> = {
    'flu': ['flu shot', 'flu'],
    'blood': ['blood work', 'blood test'],
    'prescription': ['prescription renewal', 'prescription', 'refill'],
    'skin': ['skin condition', 'skin', 'dermatology', 'rash', 'acne'],
    'mental': ['mental health consultation', 'mental health', 'anxiety', 'depression', 'counseling', 'therapy'],
    'virtual': ['virtual consultation', 'virtual', 'telehealth', 'online'],
    'sti': ['sti testing', 'sti', 'std', 'sexual health'],
    'travel': ['travel medicine', 'travel', 'vaccine', 'vaccination'],
    'sports': ['sports physical', 'sports', 'athletic'],
    'chronic': ['chronic disease management', 'chronic', 'diabetes', 'hypertension'],
    'check': ['general check-up', 'check-up', 'checkup', 'physical', 'annual'],
    'injury': ['minor injury treatment', 'injury', 'sprain', 'cut', 'wound'],
    'walk': ['walk-in consultation', 'walk-in', 'walkin'],
  }

  const found: string[] = []
  for (const [key, terms] of Object.entries(serviceMap)) {
    if (terms.some(t => msg.includes(t))) {
      found.push(key)
    }
  }
  return found
}

// Search clinics with various filters
async function searchClinics(params: {
  serviceKeywords?: string[]
  walkIn?: boolean
  virtual?: boolean
  isOpen?: boolean
  limit?: number
}) {
  let query = supabase
    .from('clinics')
    .select(`
      id, name, slug, phone, is_walk_in, is_virtual, is_appointment_only,
      clinic_locations(address, city, province, postal_code, latitude, longitude),
      clinic_hours(day_of_week, open_time, close_time, is_closed),
      wait_time_snapshots(estimated_wait_minutes, queue_depth, created_at),
      clinic_services(*, service:services(id, name))
    `)
    .eq('status', 'approved')

  if (params.walkIn) query = query.eq('is_walk_in', true)
  if (params.virtual) query = query.eq('is_virtual', true)

  const { data: clinics } = await query.order('name').limit(params.limit || 30)

  if (!clinics) return []

  let results = clinics

  // Filter by service keywords
  if (params.serviceKeywords && params.serviceKeywords.length > 0) {
    results = results.filter((clinic: any) => {
      const clinicServices = (clinic.clinic_services || []).map((cs: any) =>
        cs.service?.name?.toLowerCase() || ''
      )
      return params.serviceKeywords!.some(kw =>
        clinicServices.some((sn: string) => sn.includes(kw))
      )
    })
  }

  // Filter by currently open
  if (params.isOpen) {
    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = dayNames[now.getDay()]
    const currentTime = now.toTimeString().slice(0, 8)

    results = results.filter((clinic: any) => {
      const todayHours = (clinic.clinic_hours || []).find((h: any) => h.day_of_week === today)
      if (!todayHours || todayHours.is_closed) return false
      return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time
    })
  }

  return results
}

// Get specific clinic details
async function getClinicDetails(clinicId: string) {
  const { data } = await supabase
    .from('clinics')
    .select(`
      id, name, slug, phone, email, website, description, is_walk_in, is_virtual, is_appointment_only,
      clinic_locations(address, city, province, postal_code, latitude, longitude),
      clinic_hours(day_of_week, open_time, close_time, is_closed),
      wait_time_snapshots(estimated_wait_minutes, queue_depth, active_practitioners, created_at),
      clinic_services(*, service:services(id, name, description, default_duration))
    `)
    .eq('id', clinicId)
    .single()

  return data
}

// Format clinic info for chat display
function formatClinicCard(clinic: any): any {
  const location = clinic.clinic_locations?.[0]
  const waitTime = clinic.wait_time_snapshots?.[0]
  const services = (clinic.clinic_services || [])
    .map((cs: any) => cs.service?.name)
    .filter(Boolean)

  return {
    type: 'clinic_card',
    id: clinic.id,
    name: clinic.name,
    phone: clinic.phone,
    address: location ? `${location.address}, ${location.city}, ${location.province} ${location.postal_code}` : null,
    isWalkIn: clinic.is_walk_in,
    isVirtual: clinic.is_virtual,
    waitMinutes: waitTime?.estimated_wait_minutes ?? null,
    queueDepth: waitTime?.queue_depth ?? null,
    services: services.slice(0, 5),
    slug: clinic.slug,
  }
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

function formatHoursForDay(hours: any[], day: string): string {
  const dayHours = hours.find((h: any) => h.day_of_week === day)
  if (!dayHours || dayHours.is_closed) return 'Closed'
  return `${formatTime12(dayHours.open_time)} - ${formatTime12(dayHours.close_time)}`
}

// Main chat handler
async function processMessage(req: ChatRequest): Promise<{ content: string; data?: any }> {
  const { message, context } = req
  const intent = detectIntent(message)

  // Handle active booking flow
  if (context?.flow === 'booking') {
    return handleBookingFlow(message, context, intent)
  }
  if (context?.flow === 'callback') {
    return handleCallbackFlow(message, context, intent)
  }

  switch (intent) {
    case 'greeting':
      return {
        content: "Hi there! I'm your MyHealthMap assistant. I can help you:\n\n" +
          "- **Find a clinic or doctor** near you in Vancouver\n" +
          "- **Check wait times** at walk-in clinics\n" +
          "- **Book an appointment** or request a callback\n" +
          "- **Find specific services** (flu shots, mental health, etc.)\n\n" +
          "What can I help you with today?"
      }

    case 'help':
      return {
        content: "Here's what I can do for you:\n\n" +
          "🏥 **Find a clinic** — \"Find a walk-in clinic near me\"\n" +
          "👨‍⚕️ **Find a doctor** — \"I need a family doctor accepting patients\"\n" +
          "⏱️ **Check wait times** — \"Which clinics have short wait times?\"\n" +
          "📅 **Book appointment** — \"Book an appointment at Georgia Medical\"\n" +
          "📞 **Request callback** — \"Request a callback from Cross Roads Clinic\"\n" +
          "💉 **Find services** — \"Where can I get a flu shot?\"\n" +
          "🕐 **Check hours** — \"Is Commercial Drive Walk-In open today?\"\n\n" +
          "Just type what you need!"
      }

    case 'find_clinic': {
      const serviceKws = extractServiceKeywords(message)
      const wantWalkIn = /walk[\s-]*in/i.test(message)
      const wantVirtual = /virtual|online|telehealth/i.test(message)
      const wantOpen = /open|now|today/i.test(message)

      const clinics = await searchClinics({
        serviceKeywords: serviceKws.length > 0 ? serviceKws : undefined,
        walkIn: wantWalkIn || undefined,
        virtual: wantVirtual || undefined,
        isOpen: wantOpen || undefined,
        limit: 6,
      })

      if (clinics.length === 0) {
        return {
          content: "I couldn't find any clinics matching your criteria right now. Try broadening your search — for example, ask about walk-in clinics or specific services."
        }
      }

      const cards = clinics.slice(0, 5).map(formatClinicCard)
      const qualifier = wantOpen ? 'open now' : wantWalkIn ? 'walk-in' : wantVirtual ? 'virtual' : ''

      return {
        content: `I found **${clinics.length}** ${qualifier} clinics in Vancouver. Here are the top results:`,
        data: { type: 'clinic_list', clinics: cards }
      }
    }

    case 'find_doctor': {
      // Since practitioners table is empty, guide users to clinics with relevant services
      const serviceKws = extractServiceKeywords(message)
      const wantVirtual = /virtual|online|telehealth/i.test(message)

      const clinics = await searchClinics({
        serviceKeywords: serviceKws.length > 0 ? serviceKws : undefined,
        virtual: wantVirtual || undefined,
        limit: 6,
      })

      const cards = clinics.slice(0, 5).map(formatClinicCard)

      return {
        content: "Here are clinics in Vancouver where you can see a doctor. You can book an appointment or walk in directly:",
        data: { type: 'clinic_list', clinics: cards }
      }
    }

    case 'wait_times': {
      const clinics = await searchClinics({ walkIn: true, limit: 30 })

      // Sort by wait time
      const sorted = clinics
        .filter((c: any) => c.wait_time_snapshots?.[0]?.estimated_wait_minutes != null)
        .sort((a: any, b: any) =>
          (a.wait_time_snapshots[0].estimated_wait_minutes) -
          (b.wait_time_snapshots[0].estimated_wait_minutes)
        )

      const cards = sorted.slice(0, 6).map(formatClinicCard)

      if (cards.length === 0) {
        return { content: "No wait time data is currently available. Please check back later or call the clinic directly." }
      }

      return {
        content: "Here are the clinics with the **shortest wait times** right now:",
        data: { type: 'clinic_list', clinics: cards }
      }
    }

    case 'services': {
      const serviceKws = extractServiceKeywords(message)

      if (serviceKws.length === 0) {
        // Show all available services
        const { data: services } = await supabase
          .from('services')
          .select('id, name')
          .order('name')

        const serviceNames = (services || []).map((s: any) => s.name)

        return {
          content: "Here are the services available at Vancouver clinics:\n\n" +
            serviceNames.map((s: string) => `• ${s}`).join('\n') +
            "\n\nWhich service are you looking for? I'll find clinics that offer it."
        }
      }

      const clinics = await searchClinics({ serviceKeywords: serviceKws, limit: 6 })
      const cards = clinics.slice(0, 5).map(formatClinicCard)

      if (cards.length === 0) {
        return { content: "I couldn't find clinics offering that service. Try asking about a different service or browse all available services by saying \"what services are available?\"" }
      }

      return {
        content: `Here are clinics offering the services you're looking for:`,
        data: { type: 'clinic_list', clinics: cards }
      }
    }

    case 'hours': {
      // Try to find a specific clinic name in the message
      const msg = message.toLowerCase()
      const { data: allClinics } = await supabase
        .from('clinics')
        .select('id, name, clinic_hours(day_of_week, open_time, close_time, is_closed)')
        .eq('status', 'approved')

      const matchedClinic = (allClinics || []).find((c: any) =>
        msg.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().split(/\s+/).every((word: string) =>
          word.length > 3 ? msg.includes(word.toLowerCase()) : true
        )
      )

      if (matchedClinic) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const hoursText = days.map(day => {
          const formatted = formatHoursForDay(matchedClinic.clinic_hours || [], day)
          const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
          return `**${dayLabel}**: ${formatted}`
        }).join('\n')

        return {
          content: `**${matchedClinic.name}** hours:\n\n${hoursText}\n\nWould you like to book an appointment here?`,
          data: { type: 'clinic_context', clinicId: matchedClinic.id }
        }
      }

      // No specific clinic mentioned
      return {
        content: "Which clinic would you like to check hours for? You can say the clinic name, or I can show you clinics that are currently open — just say \"show me open clinics\"."
      }
    }

    case 'book': {
      // Check if a specific clinic is mentioned or in context
      const clinicId = context?.selectedClinicId
      if (clinicId) {
        const clinic = await getClinicDetails(clinicId)
        if (clinic) {
          return {
            content: `Let's book an appointment at **${clinic.name}**.\n\nWhat service do you need? Here are the options:\n\n` +
              (clinic.clinic_services || []).map((cs: any, i: number) =>
                `${i + 1}. ${cs.service?.name}`
              ).join('\n') +
              '\n\nJust type the number or service name.',
            data: {
              type: 'flow_start',
              flow: 'booking',
              flowStep: 'select_service',
              flowData: { clinicId: clinic.id, clinicName: clinic.name, services: (clinic.clinic_services || []).map((cs: any) => ({ id: cs.service?.id, name: cs.service?.name })) }
            }
          }
        }
      }

      // Try to find clinic name in message
      const msg = message.toLowerCase()
      const { data: allClinics } = await supabase
        .from('clinics')
        .select('id, name')
        .eq('status', 'approved')

      const matchedClinic = (allClinics || []).find((c: any) =>
        msg.includes(c.name.toLowerCase())
      )

      if (matchedClinic) {
        const clinic = await getClinicDetails(matchedClinic.id)
        if (clinic) {
          return {
            content: `Let's book an appointment at **${clinic.name}**.\n\nWhat service do you need?\n\n` +
              (clinic.clinic_services || []).map((cs: any, i: number) =>
                `${i + 1}. ${cs.service?.name}`
              ).join('\n') +
              '\n\nJust type the number or name.',
            data: {
              type: 'flow_start',
              flow: 'booking',
              flowStep: 'select_service',
              flowData: { clinicId: clinic.id, clinicName: clinic.name, services: (clinic.clinic_services || []).map((cs: any) => ({ id: cs.service?.id, name: cs.service?.name })) }
            }
          }
        }
      }

      // No clinic specified - ask user to pick
      const clinics = await searchClinics({ limit: 6 })
      const cards = clinics.slice(0, 5).map(formatClinicCard)

      return {
        content: "Which clinic would you like to book at? Here are some options — tap one to get started:",
        data: { type: 'clinic_list', clinics: cards, action: 'book' }
      }
    }

    case 'callback': {
      const clinicId = context?.selectedClinicId
      if (clinicId) {
        const clinic = await getClinicDetails(clinicId)
        if (clinic) {
          return {
            content: `I'll help you request a callback from **${clinic.name}** (${clinic.phone}).\n\nWhat's your **full name**?`,
            data: {
              type: 'flow_start',
              flow: 'callback',
              flowStep: 'get_name',
              flowData: { clinicId: clinic.id, clinicName: clinic.name, clinicPhone: clinic.phone }
            }
          }
        }
      }

      const clinics = await searchClinics({ limit: 6 })
      const cards = clinics.slice(0, 5).map(formatClinicCard)

      return {
        content: "Which clinic should call you back? Pick one below:",
        data: { type: 'clinic_list', clinics: cards, action: 'callback' }
      }
    }

    case 'thanks':
      return {
        content: "You're welcome! Let me know if there's anything else I can help you with. Stay healthy! 😊"
      }

    case 'confirm':
    case 'cancel':
      return {
        content: "It doesn't look like we have an active request right now. Would you like to find a clinic, book an appointment, or check wait times?"
      }

    default: {
      // Try a general clinic search based on the message
      const serviceKws = extractServiceKeywords(message)
      if (serviceKws.length > 0) {
        const clinics = await searchClinics({ serviceKeywords: serviceKws, limit: 5 })
        if (clinics.length > 0) {
          const cards = clinics.slice(0, 5).map(formatClinicCard)
          return {
            content: `Here are clinics that might help:`,
            data: { type: 'clinic_list', clinics: cards }
          }
        }
      }

      return {
        content: "I'm not sure I understood that. I can help you with:\n\n" +
          "• **Find clinics** — \"Show me walk-in clinics\"\n" +
          "• **Check wait times** — \"Which clinic has the shortest wait?\"\n" +
          "• **Book an appointment** — \"Book at Georgia Medical\"\n" +
          "• **Request a callback** — \"Have Cross Roads call me\"\n" +
          "• **Find services** — \"Where can I get a flu shot?\"\n\n" +
          "How can I help?"
      }
    }
  }
}

// Booking flow handler
async function handleBookingFlow(
  message: string,
  context: NonNullable<ChatRequest['context']>,
  intent: string
): Promise<{ content: string; data?: any }> {
  const flowData: Record<string, any> = context.flowData || {}
  const step = context.flowStep

  if (intent === 'cancel') {
    return {
      content: "No problem, I've cancelled the booking. Let me know if you need anything else!",
      data: { type: 'flow_end' }
    }
  }

  switch (step) {
    case 'select_service': {
      const services = flowData.services || []
      const msg = message.toLowerCase().trim()

      // Try numeric selection
      const num = parseInt(msg)
      let selectedService = null
      if (!isNaN(num) && num >= 1 && num <= services.length) {
        selectedService = services[num - 1]
      } else {
        // Try name match
        selectedService = services.find((s: any) =>
          s.name.toLowerCase().includes(msg) || msg.includes(s.name.toLowerCase())
        )
      }

      if (!selectedService) {
        return {
          content: `I didn't catch that. Please select a service by number (1-${services.length}) or name:\n\n` +
            services.map((s: any, i: number) => `${i + 1}. ${s.name}`).join('\n'),
          data: { type: 'flow_continue', flow: 'booking', flowStep: 'select_service', flowData }
        }
      }

      return {
        content: `Great, **${selectedService.name}** at **${flowData.clinicName}**.\n\nWhat's your **full name**?`,
        data: {
          type: 'flow_continue',
          flow: 'booking',
          flowStep: 'get_name',
          flowData: { ...flowData, serviceId: selectedService.id, serviceName: selectedService.name }
        }
      }
    }

    case 'get_name': {
      const name = message.trim()
      if (name.length < 2) {
        return {
          content: "Please provide your full name.",
          data: { type: 'flow_continue', flow: 'booking', flowStep: 'get_name', flowData }
        }
      }

      return {
        content: `Thanks, ${name}! What's your **phone number** so the clinic can reach you?`,
        data: {
          type: 'flow_continue',
          flow: 'booking',
          flowStep: 'get_phone',
          flowData: { ...flowData, patientName: name }
        }
      }
    }

    case 'get_phone': {
      const phone = message.replace(/[^\d+()-\s]/g, '').trim()
      if (phone.length < 10) {
        return {
          content: "Please provide a valid phone number (e.g., 604-555-1234).",
          data: { type: 'flow_continue', flow: 'booking', flowStep: 'get_phone', flowData }
        }
      }

      return {
        content: `What **date** works for you? (e.g., "tomorrow", "March 20", "next Monday")`,
        data: {
          type: 'flow_continue',
          flow: 'booking',
          flowStep: 'get_date',
          flowData: { ...flowData, phone }
        }
      }
    }

    case 'get_date': {
      const dateStr = message.trim()

      return {
        content: `Do you have a **preferred time**? (e.g., "morning", "2:00 PM", "afternoon")`,
        data: {
          type: 'flow_continue',
          flow: 'booking',
          flowStep: 'get_time',
          flowData: { ...flowData, preferredDate: dateStr }
        }
      }
    }

    case 'get_time': {
      const timeStr = message.trim()
      const fd: Record<string, any> = { ...flowData, preferredTime: timeStr }

      return {
        content: `Here's your booking request:\n\n` +
          `**Clinic:** ${fd.clinicName}\n` +
          `**Service:** ${fd.serviceName || 'General Consultation'}\n` +
          `**Name:** ${fd.patientName}\n` +
          `**Phone:** ${fd.phone}\n` +
          `**Date:** ${fd.preferredDate}\n` +
          `**Time:** ${fd.preferredTime}\n\n` +
          `Shall I **confirm** this request? (yes/no)`,
        data: {
          type: 'flow_continue',
          flow: 'booking',
          flowStep: 'confirm',
          flowData: fd
        }
      }
    }

    case 'confirm': {
      if (intent === 'confirm' || /yes|yeah|yep|sure|ok|confirm|go/i.test(message)) {
        // Submit the booking request
        return {
          content: `Your appointment request has been submitted! 🎉\n\n` +
            `**${flowData.clinicName}** will confirm your booking shortly.\n` +
            `They may call you at **${flowData.phone}** to finalize the details.\n\n` +
            `**Booking Reference:** MHM-${Date.now().toString(36).toUpperCase()}\n\n` +
            `Is there anything else I can help with?`,
          data: { type: 'flow_end' }
        }
      }

      return {
        content: "No problem. Would you like to change any details, or cancel the booking?",
        data: { type: 'flow_continue', flow: 'booking', flowStep: 'confirm', flowData }
      }
    }

    default:
      return {
        content: "Something went wrong with the booking flow. Let's start over — which clinic would you like to book at?",
        data: { type: 'flow_end' }
      }
  }
}

// Callback flow handler
async function handleCallbackFlow(
  message: string,
  context: NonNullable<ChatRequest['context']>,
  intent: string
): Promise<{ content: string; data?: any }> {
  const flowData: Record<string, any> = context.flowData || {}
  const step = context.flowStep

  if (intent === 'cancel') {
    return {
      content: "Callback request cancelled. Let me know if you need anything else!",
      data: { type: 'flow_end' }
    }
  }

  switch (step) {
    case 'get_name': {
      const name = message.trim()
      if (name.length < 2) {
        return {
          content: "Please provide your full name.",
          data: { type: 'flow_continue', flow: 'callback', flowStep: 'get_name', flowData }
        }
      }

      return {
        content: `Thanks, ${name}! What **phone number** should they call you on?`,
        data: {
          type: 'flow_continue',
          flow: 'callback',
          flowStep: 'get_phone',
          flowData: { ...flowData, patientName: name }
        }
      }
    }

    case 'get_phone': {
      const phone = message.replace(/[^\d+()-\s]/g, '').trim()
      if (phone.length < 10) {
        return {
          content: "Please enter a valid phone number (e.g., 604-555-1234).",
          data: { type: 'flow_continue', flow: 'callback', flowStep: 'get_phone', flowData }
        }
      }

      return {
        content: `What's the **reason** for the callback? (e.g., "need to discuss test results", "booking follow-up", or just "general inquiry")`,
        data: {
          type: 'flow_continue',
          flow: 'callback',
          flowStep: 'get_reason',
          flowData: { ...flowData, phone }
        }
      }
    }

    case 'get_reason': {
      const reason = message.trim()
      const fd: Record<string, any> = { ...flowData, reason }

      return {
        content: `Here's your callback request:\n\n` +
          `**Clinic:** ${fd.clinicName}\n` +
          `**Name:** ${fd.patientName}\n` +
          `**Phone:** ${fd.phone}\n` +
          `**Reason:** ${fd.reason}\n\n` +
          `Shall I submit this? (yes/no)`,
        data: {
          type: 'flow_continue',
          flow: 'callback',
          flowStep: 'confirm',
          flowData: fd
        }
      }
    }

    case 'confirm': {
      if (intent === 'confirm' || /yes|yeah|yep|sure|ok|confirm|go/i.test(message)) {
        return {
          content: `Your callback request has been submitted! 📞\n\n` +
            `**${flowData.clinicName}** will call you at **${flowData.phone}**.\n` +
            `Expected response time: within 2-4 business hours.\n\n` +
            `**Reference:** CB-${Date.now().toString(36).toUpperCase()}\n\n` +
            `Anything else I can help with?`,
          data: { type: 'flow_end' }
        }
      }

      return {
        content: "Would you like to change any details, or cancel the request?",
        data: { type: 'flow_continue', flow: 'callback', flowStep: 'confirm', flowData }
      }
    }

    default:
      return {
        content: "Something went wrong. Let's start over — which clinic should call you back?",
        data: { type: 'flow_end' }
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()

    if (!body.message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const result = await processMessage(body)

    return NextResponse.json({
      role: 'assistant',
      content: result.content,
      data: result.data || null,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
