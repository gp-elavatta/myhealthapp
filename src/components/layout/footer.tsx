import Link from 'next/link'
import { Activity } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                MyHealth<span className="text-teal-400">Map</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Connecting patients with healthcare providers. Find clinics, check wait times, book appointments, and access care faster.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">For Patients</h3>
            <ul className="space-y-2">
              <li><Link href="/clinics" className="text-sm hover:text-white transition-colors">Find Clinics</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="text-sm hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">For Clinics</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm hover:text-white transition-colors">Clinic Portal</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition-colors">Register Clinic</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">2026 MyHealthMap. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 sm:mt-0">Built for healthcare access in Canada</p>
        </div>
      </div>
    </footer>
  )
}
