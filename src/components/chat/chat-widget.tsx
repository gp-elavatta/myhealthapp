'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle, X, Send, Phone, Calendar, Clock, MapPin,
  ChevronRight, Minus, Sparkles, Stethoscope, ArrowRight,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  data?: any
  timestamp: Date
}

interface FlowContext {
  flow?: string
  flowStep?: string
  flowData?: Record<string, any>
  selectedClinicId?: string
}

function ClinicCard({
  clinic,
  onAction,
}: {
  clinic: any
  onAction?: (clinicId: string, action: string) => void
}) {
  const waitColor = clinic.waitMinutes == null
    ? 'text-gray-400'
    : clinic.waitMinutes <= 15
      ? 'text-emerald-600'
      : clinic.waitMinutes <= 30
        ? 'text-amber-600'
        : clinic.waitMinutes <= 60
          ? 'text-orange-500'
          : 'text-red-500'

  const waitBg = clinic.waitMinutes == null
    ? 'bg-gray-50 border-gray-200'
    : clinic.waitMinutes <= 15
      ? 'bg-emerald-50 border-emerald-200'
      : clinic.waitMinutes <= 30
        ? 'bg-amber-50 border-amber-200'
        : clinic.waitMinutes <= 60
          ? 'bg-orange-50 border-orange-200'
          : 'bg-red-50 border-red-200'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-2 hover:border-teal-200 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[13px] text-gray-900 group-hover:text-teal-700 transition-colors truncate">
            {clinic.name}
          </h4>
          {clinic.address && (
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{clinic.address}</span>
            </p>
          )}
        </div>
        {clinic.waitMinutes != null && (
          <div className={cn('px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border', waitBg, waitColor)}>
            {clinic.waitMinutes}m
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        {clinic.isWalkIn && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            Walk-in
          </span>
        )}
        {clinic.isVirtual && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Virtual
          </span>
        )}
        {clinic.queueDepth != null && clinic.queueDepth > 0 && (
          <span className="text-[10px] text-gray-400 font-medium">
            {clinic.queueDepth} in queue
          </span>
        )}
      </div>

      {clinic.services && clinic.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {clinic.services.slice(0, 3).map((s: string) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
              {s}
            </span>
          ))}
          {clinic.services.length > 3 && (
            <span className="text-[10px] text-gray-400">+{clinic.services.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onAction?.(clinic.id, 'book')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-bold rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all shadow-sm"
        >
          <Calendar className="h-3 w-3" />
          Book
        </button>
        <button
          onClick={() => onAction?.(clinic.id, 'callback')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-teal-700 text-xs font-bold rounded-lg border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
        >
          <Phone className="h-3 w-3" />
          Callback
        </button>
        <a
          href={`/clinics/${clinic.slug || clinic.id}`}
          className="flex items-center justify-center p-2 text-gray-300 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-all"
          title="View details"
        >
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onClinicAction,
}: {
  message: ChatMessage
  onClinicAction: (clinicId: string, action: string) => void
}) {
  const isUser = message.role === 'user'

  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[88%]')}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">Assistant</span>
          </div>
        )}
        <div
          className={cn(
            'px-4 py-3 text-[13px] leading-relaxed',
            isUser
              ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-2xl rounded-br-sm shadow-md'
              : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100'
          )}
        >
          {renderContent(message.content)}
        </div>

        {message.data?.type === 'clinic_list' && message.data.clinics && (
          <div className="mt-3 space-y-2">
            {message.data.clinics.map((clinic: any) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                onAction={onClinicAction}
              />
            ))}
          </div>
        )}

        <div className={cn('text-[10px] mt-1.5 font-medium', isUser ? 'text-right text-gray-400' : 'text-gray-400')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">Assistant</span>
        </div>
        <div className="bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-2xl rounded-bl-sm inline-flex items-center gap-1.5">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Find a clinic', icon: MapPin, message: 'Find a walk-in clinic near me', color: 'from-teal-500 to-emerald-500' },
  { label: 'Shortest wait', icon: Clock, message: 'Which clinics have the shortest wait times?', color: 'from-amber-500 to-orange-500' },
  { label: 'Book appointment', icon: Calendar, message: 'I want to book an appointment', color: 'from-blue-500 to-indigo-500' },
  { label: 'Request callback', icon: Phone, message: 'I want to request a callback', color: 'from-purple-500 to-pink-500' },
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [flowContext, setFlowContext] = useState<FlowContext>({})
  const [hasUnread, setHasUnread] = useState(false)
  const [pulse, setPulse] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Stop pulse after 10s
  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hi! I'm your **MyHealthMap** assistant. I can help you find clinics, check wait times, book appointments, or request callbacks at clinics across Vancouver.\n\nWhat can I help you with?",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: flowContext,
          }),
        })

        const data = await res.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          data: data.data,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (data.data?.type === 'flow_start' || data.data?.type === 'flow_continue') {
          setFlowContext({
            flow: data.data.flow,
            flowStep: data.data.flowStep,
            flowData: data.data.flowData,
            selectedClinicId: data.data.flowData?.clinicId || flowContext.selectedClinicId,
          })
        } else if (data.data?.type === 'flow_end') {
          setFlowContext({})
        } else if (data.data?.type === 'clinic_context') {
          setFlowContext((prev) => ({
            ...prev,
            selectedClinicId: data.data.clinicId,
          }))
        }

        if (isMinimized) {
          setHasUnread(true)
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, flowContext, isMinimized]
  )

  const handleClinicAction = useCallback(
    (clinicId: string, action: string) => {
      setFlowContext((prev) => ({ ...prev, selectedClinicId: clinicId }))
      if (action === 'book') {
        sendMessage(`Book an appointment at this clinic`)
      } else if (action === 'callback') {
        sendMessage(`Request a callback from this clinic`)
      }
    },
    [sendMessage]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // ── Closed state: bold floating launcher ──
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip / CTA label */}
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-[240px] cursor-pointer hover:shadow-2xl transition-all group"
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
            setHasUnread(false)
            setPulse(false)
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <span className="text-sm font-bold text-gray-900">Need help?</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Find clinics, book appointments, or check wait times instantly.
          </p>
          <div className="flex items-center gap-1 mt-2 text-teal-600 text-xs font-bold group-hover:gap-2 transition-all">
            Chat with us <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Main button */}
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
            setHasUnread(false)
            setPulse(false)
          }}
          className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Open chat"
        >
          {pulse && (
            <span className="absolute inset-0 rounded-2xl bg-teal-400 animate-ping opacity-30" />
          )}
          <div className="relative flex items-center justify-center">
            <Stethoscope className="h-7 w-7" />
          </div>
          {hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full border-[3px] border-white flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">1</span>
            </span>
          )}
        </button>
      </div>
    )
  }

  // ── Minimized state ──
  if (isMinimized) {
    return (
      <button
        className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 pl-4 pr-3 py-3 cursor-pointer hover:shadow-2xl transition-all group"
        onClick={() => {
          setIsMinimized(false)
          setHasUnread(false)
        }}
      >
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <span className="text-sm font-bold text-gray-900 block">HealthMap Chat</span>
          <span className="text-[10px] text-gray-400 font-medium">Click to expand</span>
        </div>
        {hasUnread && (
          <span className="h-3 w-3 bg-red-500 rounded-full shrink-0" />
        )}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
            setIsMinimized(false)
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg ml-1"
        >
          <X className="h-4 w-4 text-gray-400" />
        </div>
      </button>
    )
  }

  // ── Full chat window ──
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-[15px] tracking-tight">HealthMap Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50" />
              <span className="text-teal-100 text-[11px] font-medium">Online now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Minimize"
          >
            <Minus className="h-4 w-4 text-white/80" />
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(false)
            }}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-white">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onClinicAction={handleClinicAction}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {!flowContext.flow && messages.length <= 2 && (
        <div className="px-5 pb-3 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.message)}
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-xl transition-all text-left group"
              >
                <div className={cn('h-7 w-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm', action.color)}>
                  <action.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flow indicator */}
      {flowContext.flow && (
        <div className="px-5 pb-2 shrink-0">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl px-4 py-2 border border-teal-100">
            <span className="text-xs text-teal-700 font-bold">
              {flowContext.flow === 'booking' ? '📅 Booking in progress' : '📞 Callback request'}
            </span>
            <button
              onClick={() => {
                setFlowContext({})
                sendMessage('cancel')
              }}
              className="text-xs text-teal-500 hover:text-red-500 font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              flowContext.flow
                ? flowContext.flowStep === 'get_name'
                  ? 'Enter your full name...'
                  : flowContext.flowStep === 'get_phone'
                    ? 'Enter your phone number...'
                    : flowContext.flowStep === 'confirm'
                      ? 'Type yes to confirm...'
                      : 'Type your response...'
                : 'Ask me anything about healthcare...'
            }
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-400 shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
          Powered by MyHealthMap
        </p>
      </form>
    </div>
  )
}
