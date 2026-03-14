'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText, Search, User, Database } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AuditLogsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    const fetch = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*, user:profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)
      setLogs(data || [])
      setLoading(false)
    }
    fetch()
  }, [profile, supabase])

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  const filtered = search
    ? logs.filter(l =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.table_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.user?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-teal-600" />
          Audit Logs
        </h1>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="Audit logs will appear here as actions are performed." />
        ) : (
          <div className="space-y-2">
            {filtered.map(log => (
              <Card key={log.id}>
                <CardContent className="pt-3 pb-3 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      {log.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{log.user.full_name || log.user.email}
                        </span>
                      )}
                      {log.table_name && <Badge variant="secondary" className="text-xs">{log.table_name}</Badge>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDateTime(log.created_at)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
