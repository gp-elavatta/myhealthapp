'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Phone,
  Video,
  Bell,
  User,
  Building2,
  Users,
  Stethoscope,
  Settings,
  ListOrdered,
  BarChart3,
  MapPin,
  FileText,
  Shield,
  ClipboardList,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const patientNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
  { label: 'Waitlist', href: '/waitlist', icon: Clock },
  { label: 'Callbacks', href: '/callbacks', icon: Phone },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
]

const clinicNav: NavItem[] = [
  { label: 'Dashboard', href: '/clinic-dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/clinic-appointments', icon: Calendar },
  { label: 'Queue & Waitlist', href: '/clinic-queue', icon: ListOrdered },
  { label: 'Practitioners', href: '/clinic-practitioners', icon: Stethoscope },
  { label: 'Services', href: '/clinic-services', icon: ClipboardList },
  { label: 'Callbacks', href: '/clinic-callbacks', icon: Phone },
  { label: 'Virtual Consults', href: '/clinic-virtual-consult', icon: Video },
  { label: 'Settings', href: '/clinic-settings', icon: Settings },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Clinics', href: '/admin/clinics', icon: Building2 },
  { label: 'Practitioners', href: '/admin/practitioners', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Regions', href: '/admin/regions', icon: MapPin },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const getNavItems = (): NavItem[] => {
    if (!profile) return patientNav
    switch (profile.role) {
      case 'clinic_staff':
      case 'clinic_admin':
      case 'practitioner':
        return clinicNav
      case 'platform_admin':
        return adminNav
      default:
        return patientNav
    }
  }

  const getRoleLabel = () => {
    if (!profile) return 'Patient'
    switch (profile.role) {
      case 'clinic_staff': return 'Clinic Staff'
      case 'clinic_admin': return 'Clinic Admin'
      case 'practitioner': return 'Practitioner'
      case 'platform_admin': return 'Platform Admin'
      default: return 'Patient'
    }
  }

  const getRoleIcon = () => {
    if (!profile) return User
    switch (profile.role) {
      case 'clinic_staff':
      case 'clinic_admin':
        return Building2
      case 'practitioner':
        return Stethoscope
      case 'platform_admin':
        return Shield
      default:
        return User
    }
  }

  const navItems = getNavItems()
  const RoleIcon = getRoleIcon()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-gray-50/50">
      <div className="flex flex-col flex-1 overflow-y-auto pt-6 pb-4">
        {/* Role indicator */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
            <RoleIcon className="h-4 w-4 text-teal-700" />
            <span className="text-sm font-medium text-teal-800">{getRoleLabel()}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/clinic-dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-teal-700' : 'text-gray-400')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
