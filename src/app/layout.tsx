import type { Metadata } from 'next'
import './globals.css'
import { ChatWidget } from '@/components/chat/chat-widget'

export const metadata: Metadata = {
  title: 'MyHealthMap - Find Clinics, Check Wait Times, Book Appointments',
  description: 'Connect with healthcare providers near you. View real-time wait times, book appointments, join waitlists, and access virtual consultations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
