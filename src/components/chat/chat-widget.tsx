'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send, Phone, Calendar, Clock, MapPin, ChevronRight, Minimize2 } from 'lucide-react'
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
  actionType,
}: {
  clinic: any
  onAction?: (clinicId: string, action: string) => void
  actionType?: string
}) {
  const waitColor = clinic.waitMinutes == null
    ? 'text-gray-400'
    : clinic.waitMinutes <= 15
      ? 'text-green-600'
      : clinic.waitMinutes <= 30
        ? 'text-yellow-600'
        : clinic.waitMinutes <= 60
          ? 'text-orange-500'
          : 'text-red-500'

  const waitBg = clinic.waitMinutes == null
    ? 'bg-gray-50'
    : clinic.waitMinutes <= 15
      ? 'bg-green-50'
      : clinic.waitMinutes <= 30
        ? 'bg-yellow-50'
        : clinic.waitMinutes <= 60
          ? 'bg-orange-50'
          : 'bg-red-50'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 hover:border-teal-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 truncate">{clinic.name}</h4>
          {clinic.address && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{clinic.address}</span>
            </p>
          )}
        </div>
        {clinic.waitMinutes != null && (
          <div className={cn('px-2 py-1 rounded-md text-xs font-medium shrink-0', waitBg, waitColor)}>
            {clinic.waitMinutes} min
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {clinic.isWalkIn && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700">
            Walk-in
          </span>
        )}
        {clinic.isVirtual && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
            Virtual
          </span>
        )}
        {clinic.queueDepth != null && (
          <span className="text-[10px] text-gray-400">
            {clinic.queueDepth} in queue
          </span>
        )}
      </div>

      {clinic.services && clinic.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {clinic.services.slice(0, 3).map((s: string) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {s}
            </span>
          ))}
          {clinic.services.length > 3 && (
            <span className="text-[10px] text-gray-400">+{clinic.services.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2.5">
        <button
          onClick={() => onAction?.(clinic.id, 'book')}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors"
        >
          <Calendar className="h-3 w-3" />
          Book
        </button>
        <button
          onClick={() => onAction?.(clinic.id, 'callback')}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white text-teal-700 text-xs font-medium rounded-md border border-teal-200 hover:bg-teal-50 transition-colors"
        >
          <Phone className="h-3 w-3" />
          Callback
        </button>
        <a
          href={`/clinics/${clinic.slug || clinic.id}`}
          className="flex items-center justify-center p-1.5 text-gray-400 hover:text-teal-600 rounded-md hover:bg-gray-50 transition-colors"
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

  // Parse markdown-like bold
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className={cn('flex mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%]', isUser ? 'order-1' : 'order-1')}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-5 w-5 rounded-full bg-teal-600 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">HealthMap Assistant</span>
          </div>
        )}
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-teal-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          )}
        >
          {renderContent(message.content)}
        </div>

        {/* Render clinic cards if present */}
        {message.data?.type === 'clinic_list' && message.data.clinics && (
          <div className="mt-2 space-y-1">
            {message.data.clinics.map((clinic: any) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                onAction={onClinicAction}
                actionType={message.data.action}
              />
            ))}
          </div>
        )}

        <div className={cn('text-[10px] mt-1', isUser ? 'text-right text-gray-400' : 'text-gray-400')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-5 w-5 rounded-full bg-teal-600 flex items-center justify-center">
            <MessageSquare className="h-3 w-3 text-white" />
          </div>
          <span className="text-[10px] text-gray-400 font-medium">HealthMap Assistant</span>
        </div>
        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Find a clinic', icon: MapPin, message: 'Find a walk-in clinic near me' },
  { label: 'Wait times', icon: Clock, message: 'Which clinics have the shortest wait times?' },
  { label: 'Book appointment', icon: Calendar, message: 'I want to book an appointment' },
  { label: 'Request callback', icon: Phone, message: 'I want to request a callback' },
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [flowContext, setFlowContext] = useState<FlowContext>({})
  const [hasUnread, setHasUnread] = useState(false)

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

        // Update flow context
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

        // Show unread badge if minimized
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

  // Closed state - floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
          setHasUnread(false)
        }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    )
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-2 pl-4 pr-2 py-2 cursor-pointer hover:shadow-xl transition-all"
        onClick={() => {
          setIsMinimized(false)
          setHasUnread(false)
        }}
      >
        <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
          <MessageSquare className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">HealthMap Chat</span>
        {hasUnread && (
          <span className="h-2.5 w-2.5 bg-red-500 rounded-full" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
            setIsMinimized(false)
          }}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    )
  }

  // Full chat window
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">HealthMap Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full" />
              <span className="text-teal-100 text-[10px]">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(false)
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white">
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

      {/* Quick actions - only show when no flow active and few messages */}
      {!flowContext.flow && messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.message)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full hover:bg-teal-100 transition-colors"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Flow indicator */}
      {flowContext.flow && (
        <div className="px-4 pb-1 shrink-0">
          <div className="flex items-center justify-between bg-teal-50 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-teal-600 font-medium">
              {flowContext.flow === 'booking' ? '📅 Booking in progress' : '📞 Callback request'}
            </span>
            <button
              onClick={() => {
                setFlowContext({})
                sendMessage('cancel')
              }}
              className="text-[10px] text-teal-500 hover:text-teal-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
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
                : 'Ask about clinics, doctors, wait times...'
            }
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 flex items-center justify-center bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
