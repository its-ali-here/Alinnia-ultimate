import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface DataSource {
  id: string
  name: string
  source: 'CSV' | 'Google Sheets' | 'Excel'
  size: string
  sizeBytes: number
  uploadedAt: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  rowCount: number | null
  metadata?: {
    dateFormat?: string
    storagePath?: string
    webViewLink?: string
    googleSheetId?: string
  }
}

export interface StorageInfo {
  used: number
  limit: number
  percentage: number
}

export interface DataSourcesState {
  dataSources: DataSource[]
  storage: StorageInfo
  loading: boolean
  error: string | null
  isGoogleConnected: boolean
  googleEmail: string | null
}

const DEFAULT_STORAGE_LIMIT = 500 * 1024 * 1024 // 500MB default

export function useDataSources() {
  const { organizationId, user } = useAuth()
  const [state, setState] = useState<DataSourcesState>({
    dataSources: [],
    storage: { used: 0, limit: DEFAULT_STORAGE_LIMIT, percentage: 0 },
    loading: true,
    error: null,
    isGoogleConnected: false,
    googleEmail: null
  })

  const fetchDataSources = useCallback(async () => {
    if (!organizationId) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/data-sources?organizationId=${organizationId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data sources')
      }

      setState(prev => ({
        ...prev,
        dataSources: data.dataSources || [],
        storage: data.storage || prev.storage,
        isGoogleConnected: data.googleConnected || false,
        googleEmail: data.googleEmail || null,
        loading: false
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: (err as Error).message,
        loading: false
      }))
    }
  }, [organizationId])

  useEffect(() => {
    fetchDataSources()
  }, [fetchDataSources])

  const connectGoogle = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/google/connect')
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to connect Google' }))
    }
  }, [])

  const disconnectGoogle = useCallback(async () => {
    try {
      await fetch('/api/integrations/google/disconnect', { method: 'POST' })
      fetchDataSources()
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to disconnect Google' }))
    }
  }, [fetchDataSources])

  const syncGoogleSheets = useCallback(async () => {
    if (!organizationId || !user?.id) return

    try {
      const response = await fetch('/api/data-sources/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, userId: user.id })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      await fetchDataSources()
      return data
    } catch (err) {
      throw err
    }
  }, [organizationId, user?.id, fetchDataSources])

  const deleteDataSource = useCallback(async (id: string, source: string) => {
    if (!organizationId) return

    try {
      const response = await fetch(`/api/data-sources/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, source })
      })
      if (!response.ok) throw new Error('Failed to delete')
      await fetchDataSources()
    } catch (err) {
      throw err
    }
  }, [organizationId, fetchDataSources])

  return {
    ...state,
    refresh: fetchDataSources,
    connectGoogle,
    disconnectGoogle,
    syncGoogleSheets,
    deleteDataSource
  }
}
