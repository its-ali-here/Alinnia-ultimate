import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchDataSources()
  }, [fetchDataSources, session?.accessToken]) // Refetch when session changes

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
