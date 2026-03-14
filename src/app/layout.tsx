import type { Metadata } from 'next'
import './globals.css'

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
