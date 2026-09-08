import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api/client'
import { useAuth } from './auth'
import type { Priority, PropertyRecord, ServiceRequest } from './types'

type AppState = {
  requests: ServiceRequest[]
  properties: PropertyRecord[]
  toast: string
  refresh: () => Promise<void>
  addRequest: (input: {
    title: string
    type: string
    description: string
    priority: Priority
    address: string
    postTown: string
    postCode: string
  }) => Promise<void>
  acceptQuote: (id: string) => Promise<void>
  rejectQuote: (id: string) => Promise<void>
  addProperty: (property: Omit<PropertyRecord, 'id'> & { id?: string }) => Promise<PropertyRecord>
  addComment: (id: string, body: string) => Promise<ServiceRequest>
  flash: (message: string) => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [properties, setProperties] = useState<PropertyRecord[]>([])
  const [toast, setToast] = useState('')

  const flash = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      setRequests([])
      setProperties([])
      return
    }
    const [reqRes, propRes] = await Promise.all([
      api<{ requests: ServiceRequest[] }>('/requests'),
      api<{ properties: PropertyRecord[] }>('/properties'),
    ])
    setRequests(reqRes.requests)
    setProperties(propRes.properties)
  }, [user])

  useEffect(() => {
    void refresh().catch(() => undefined)
  }, [refresh])

  const addRequest = useCallback(
    async (input: {
      title: string
      type: string
      description: string
      priority: Priority
      address: string
      postTown: string
      postCode: string
    }) => {
      await api('/requests', { method: 'POST', body: JSON.stringify(input) })
      await refresh()
      flash('Service request created.')
    },
    [flash, refresh],
  )

  const acceptQuote = useCallback(
    async (id: string) => {
      await api(`/requests/${id}/accept-quote`, { method: 'POST' })
      await refresh()
      flash('Quote accepted')
    },
    [flash, refresh],
  )

  const rejectQuote = useCallback(
    async (id: string) => {
      await api(`/requests/${id}/reject-quote`, { method: 'POST' })
      await refresh()
      flash('Quote rejected')
    },
    [flash, refresh],
  )

  const addProperty = useCallback(
    async (record: Omit<PropertyRecord, 'id'> & { id?: string }) => {
      const res = await api<{ property: PropertyRecord }>('/properties', {
        method: 'POST',
        body: JSON.stringify(record),
      })
      await refresh()
      flash('Property added')
      return res.property
    },
    [flash, refresh],
  )

  const addComment = useCallback(async (id: string, body: string) => {
    const res = await api<{ request: ServiceRequest }>(`/requests/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
    await refresh()
    return res.request
  }, [refresh])

  const value = useMemo(
    () => ({
      requests,
      properties,
      toast,
      refresh,
      addRequest,
      acceptQuote,
      rejectQuote,
      addProperty,
      addComment,
      flash,
    }),
    [acceptQuote, addComment, addProperty, addRequest, flash, properties, refresh, rejectQuote, requests, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
