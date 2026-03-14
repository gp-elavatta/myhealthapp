'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MapPin, Plus, Trash2 } from 'lucide-react'

export default function AdminRegionsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [regions, setRegions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogType, setDialogType] = useState<'region' | 'category'>('region')
  const [form, setForm] = useState({ name: '', province: '', description: '' })
  const supabase = createClient()

  const fetchData = async () => {
    const [regRes, catRes] = await Promise.all([
      supabase.from('regions').select('*').order('name'),
      supabase.from('service_categories').select('*').order('name'),
    ])
    setRegions(regRes.data || [])
    setCategories(catRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!profile || profile.role !== 'platform_admin') return
    fetchData()
  }, [profile])

  const handleAdd = async () => {
    if (dialogType === 'region') {
      await supabase.from('regions').insert({ name: form.name, province: form.province })
    } else {
      await supabase.from('service_categories').insert({ name: form.name, description: form.description || null })
    }
    setShowDialog(false)
    setForm({ name: '', province: '', description: '' })
    fetchData()
  }

  const deleteRegion = async (id: string) => {
    await supabase.from('regions').delete().eq('id', id)
    fetchData()
  }

  const deleteCategory = async (id: string) => {
    await supabase.from('service_categories').delete().eq('id', id)
    fetchData()
  }

  if (authLoading || loading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Regions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
            <Button size="sm" onClick={() => { setDialogType('region'); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-1" />Add Region
            </Button>
          </div>
          {regions.length === 0 ? (
            <EmptyState icon={MapPin} title="No regions" description="Add regions to organize clinics." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regions.map(r => (
                <Card key={r.id}>
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.province}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteRegion(r.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Service Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Service Categories</h2>
            <Button size="sm" onClick={() => { setDialogType('category'); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-1" />Add Category
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(c => (
              <Card key={c.id}>
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteCategory(c.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {dialogType === 'region' ? 'Region' : 'Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              {dialogType === 'region' ? (
                <Input placeholder="Province" value={form.province} onChange={e => setForm({...form, province: e.target.value})} />
              ) : (
                <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!form.name}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
