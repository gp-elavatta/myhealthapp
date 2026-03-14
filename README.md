# MyHealthMap

A healthcare web application that helps patients find clinics, view real-time wait times, book appointments, join waitlists, request callbacks, and attend virtual consultations. Clinics can manage practitioners, schedules, queues, and virtual consults.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage)
- **Deployment**: Vercel
- **UI Components**: Radix UI, Lucide Icons, class-variance-authority

## Features

### Patient Features
- Search clinics by city, postal code, or name
- Filter by open now, walk-in, virtual, wait time
- View real-time wait times and queue depth
- Book appointments
- Join waitlists
- Request callbacks
- Virtual consultation waiting room
- Notification center
- Appointment history

### Clinic Features
- Operational dashboard with real-time stats
- Appointment management (check-in, start, complete, no-show)
- Queue management (add walk-ins, call next, set wait times)
- Waitlist management
- Callback request handling
- Virtual consultation sessions
- Practitioner and service management
- Clinic settings

### Admin Features
- Platform-wide analytics
- Clinic approval and management
- Practitioner directory
- Region and category management
- Audit logs

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@example.com | password123 |
| Clinic Staff | staff@downtownclinic.com | password123 |
| Practitioner | doctor@downtownclinic.com | password123 |
| Clinic Admin | admin@downtownclinic.com | password123 |
| Platform Admin | platformadmin@example.com | password123 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/myhealthmap.git
cd myhealthmap
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - Project URL
   - anon/public key
   - service_role key (secret)
3. Copy the env example and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

Go to Supabase Dashboard > **SQL Editor** and run the contents of:

```
supabase/migrations/00001_initial_schema.sql
```

This creates all tables, indexes, RLS policies, functions, and triggers.

### 4. Enable Realtime

In the Supabase Dashboard, go to **Database > Replication** and enable realtime for:
- `wait_time_snapshots`
- `queue_entries`
- `waitlist_entries`
- `appointments`
- `callback_requests`
- `notifications`

### 5. Seed Demo Data

Install the dotenv package and run the seed script:

```bash
npm install -D dotenv
npx tsx scripts/seed-demo.ts
```

This creates demo users, clinics, appointments, and all sample data.

### 6. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/myhealthmap.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
3. Deploy

### 3. Supabase Configuration

In the Supabase Dashboard > **Authentication > URL Configuration**:
- Set Site URL to your Vercel domain
- Add redirect URLs: `https://your-app.vercel.app/**`

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages (home, clinic search/detail)
│   ├── (auth)/             # Auth pages (login, signup, forgot password)
│   ├── (patient)/          # Patient dashboard and features
│   ├── (clinic)/           # Clinic management dashboard
│   ├── (admin)/            # Platform admin dashboard
│   └── api/auth/           # Auth callback handler
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, etc.)
│   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   └── shared/             # Shared feature components
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── hooks/              # React hooks (useAuth, useRealtime)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
supabase/
├── migrations/             # SQL migration files
└── seed.sql                # SQL seed data
scripts/
├── seed-auth-users.ts      # Auth user creation script
└── seed-demo.ts            # Complete demo seed script
```

## Database Schema

| Table | Description |
|-------|-------------|
| profiles | User profiles (extends Supabase auth) |
| clinics | Clinic information and settings |
| clinic_locations | Clinic addresses and coordinates |
| clinic_hours | Operating hours by day |
| service_categories | Service category taxonomy |
| services | Medical services |
| clinic_services | Services offered by each clinic |
| practitioners | Healthcare practitioners |
| clinic_staff | Staff-to-clinic assignments |
| practitioner_availability | Weekly availability schedules |
| appointments | Patient appointments |
| appointment_status_history | Appointment status change log |
| waitlist_entries | Patient waitlist positions |
| queue_entries | Walk-in queue management |
| callback_requests | Patient callback requests |
| wait_time_snapshots | Wait time tracking data |
| notifications | User notifications |
| virtual_sessions | Virtual consultation sessions |
| regions | Geographic regions |
| audit_logs | Platform audit trail |

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

## Milestone Breakdown

### MVP (Current)
- [x] Project structure and configuration
- [x] Database schema with RLS
- [x] Authentication (email/password)
- [x] Public clinic discovery and search
- [x] Patient dashboard and booking
- [x] Waitlist and callback flows
- [x] Clinic dashboard and queue management
- [x] Admin dashboard
- [x] Realtime updates
- [x] Demo data

### Future Enhancements
- [ ] Map view for clinic search
- [ ] SMS/email notifications
- [ ] Stripe payment integration
- [ ] WebRTC video consultations
- [ ] Advanced analytics dashboards
- [ ] Multi-language support (FR/EN)
- [ ] Mobile app (React Native)
- [ ] Clinic onboarding wizard
- [ ] Patient health records
- [ ] Insurance integration

## License

MIT
