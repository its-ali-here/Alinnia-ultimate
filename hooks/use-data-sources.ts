import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface DataSource {
  id: string
  name: string
  source: 'CSV' | 'Google Sheets' | 'Microsoft Excel'
  size: string
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

export function useDataSources() {
  const { organization } = useAuth()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  const fetchDataSources = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching data sources for organization:', organization.id)
      const response = await fetch(`/api/data-sources?organizationId=${organization.id}`)
      const data = await response.json()

      console.log('Data sources API response:', {
        ok: response.ok,
        status: response.status,
        dataSourcesCount: data.dataSources?.length || 0,
        data: data
      })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data sources')
      }

      setDataSources(data.dataSources || [])
    } catch (err) {
      const errorMessage = (err as Error).message
      setError(errorMessage)
      console.error('Error fetching data sources:', err)
    } finally {
      setLoading(false)
    }
  }, [organization?.id])

  // Check Google connection status
  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const response = await fetch('/api/integrations/google/status')
        const data = await response.json()
        setIsGoogleConnected(data.connected)
      } catch {
        setIsGoogleConnected(false)
      }
    }
    checkGoogleStatus()
  }, [])

  useEffect(() => {
    fetchDataSources()
  }, [fetchDataSources, isGoogleConnected]) // Refetch when Google connection changes

  const refreshDataSources = useCallback(() => {
    fetchDataSources()
  }, [fetchDataSources])

  return {
    dataSources,
    loading,
    error,
    refreshDataSources
  }
}
