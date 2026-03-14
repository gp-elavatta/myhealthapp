import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns'
import type { DayOfWeek, ClinicHours } from '@/lib/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0)
  return format(date, 'h:mm a')
}

export function formatDateTime(date: string) {
  return format(parseISO(date), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string) {
  return formatDistanceToNow(parseISO(date), { addSuffix: true })
}

export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return 'No wait'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) return `${hours}h`
  return `${hours}h ${remaining}m`
}

export function getWaitTimeColor(minutes: number): string {
  if (minutes <= 15) return 'text-green-600'
  if (minutes <= 30) return 'text-yellow-600'
  if (minutes <= 60) return 'text-orange-600'
  return 'text-red-600'
}

export function getWaitTimeBg(minutes: number): string {
  if (minutes <= 15) return 'bg-green-100 text-green-800'
  if (minutes <= 30) return 'bg-yellow-100 text-yellow-800'
  if (minutes <= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    no_show: 'bg-red-100 text-red-800',
    waiting: 'bg-blue-100 text-blue-800',
    notified: 'bg-purple-100 text-purple-800',
    called: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
    attempted: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    approved: 'bg-green-100 text-green-800',
    suspended: 'bg-orange-100 text-orange-800',
    disabled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday' as DayOfWeek, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  // sunday is not in our enum, treat as monday for simplicity
  const day = new Date().getDay()
  if (day === 0) return 'sunday' as DayOfWeek
  return days[day]
}

export function isClinicOpenNow(hours: ClinicHours[]): boolean {
  const now = new Date()
  const dayNames: DayOfWeek[] = ['sunday' as DayOfWeek, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = dayNames[now.getDay()]
  const todayHours = hours.find(h => h.day_of_week === today)

  if (!todayHours || todayHours.is_closed) return false

  const currentTime = format(now, 'HH:mm:ss')
  return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
