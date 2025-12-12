"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { syncGoogleSheetsAction, getGoogleSheetsAction, refreshSheetCacheAction } from '@/app/actions/google-sheets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, FileSpreadsheet, ExternalLink, RotateCcw, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface GoogleSheet {
  id: string
  google_sheet_id: string
  name: string
  web_view_link: string
  last_modified: string
  created_at: string
  updated_at: string
}

interface IntegrationStatus {
  connected: boolean
  email: string | null
}

export function GoogleSheetsSync() {
  const { user, organization } = useAuth()
  const [sheets, setSheets] = useState<GoogleSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshingSheet, setRefreshingSheet] = useState<string | null>(null)
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const checkIntegrationStatus = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      setIntegration(data)
    } catch (err) {
      console.error('Failed to check integration status:', err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const loadSheets = async () => {
    if (!organization?.id) return

    try {
      const result = await getGoogleSheetsAction(organization.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSheets(result.data || [])
      }
    } catch (error) {
      toast.error('Failed to load Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/integrations/google/connect')
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to get auth URL')
      }
    } catch (err) {
      toast.error('Failed to initiate Google connection')
      setConnecting(false)
    }
  }

  const handleSync = async () => {
    if (!organization?.id || !user?.id) {
      toast.error('Organization or user information missing')
      return
    }

    setSyncing(true)
    try {
      const result = await syncGoogleSheetsAction(organization.id, user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Sync completed: ${result.summary?.created || 0} created, ${result.summary?.updated || 0} updated`)
        await loadSheets() // Reload the list
      }
    } catch (error) {
      toast.error('Failed to sync Google Sheets')
    } finally {
      setSyncing(false)
    }
  }

  const handleRefreshSheet = async (googleSheetId: string) => {
    if (!user?.id) {
      toast.error('User information missing')
      return
    }

    setRefreshingSheet(googleSheetId)
    try {
      const result = await refreshSheetCacheAction(googleSheetId, user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Sheet cache refreshed')
      }
    } catch (error) {
      toast.error('Failed to refresh sheet cache')
    } finally {
      setRefreshingSheet(null)
    }
  }

  useEffect(() => {
    checkIntegrationStatus()
  }, [user])

  useEffect(() => {
    if (integration?.connected) {
      loadSheets()
    } else {
      setLoading(false)
    }
  }, [organization?.id, integration?.connected])

  if (checkingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking connection status...</span>
        </CardContent>
      </Card>
    )
  }

  if (!integration?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Google Sheets Sync
          </CardTitle>
          <CardDescription>
            Connect to Google to sync your spreadsheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You need to connect your Google account first to sync Google Sheets.
          </p>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Google Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Google Sheets Sync
            </CardTitle>
            <CardDescription>
              Sync your Google Sheets to use in dashboards
            </CardDescription>
          </div>
          <Button onClick={handleSync} disabled={syncing} size="sm">
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Google Sheets...</span>
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-8">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Google Sheets Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Sync Now" to import your Google Sheets, or create some sheets in Google Drive first.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sync Google Sheets
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {sheets.length} Google Sheet{sheets.length !== 1 ? 's' : ''} available
              </p>
              <Badge variant="secondary">
                Last synced: {new Date(Math.max(...sheets.map(s => new Date(s.updated_at).getTime()))).toLocaleDateString()}
              </Badge>
            </div>
            
            <div className="grid gap-3">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{sheet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Modified: {sheet.last_modified ? new Date(sheet.last_modified).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshSheet(sheet.google_sheet_id)}
                      disabled={refreshingSheet === sheet.google_sheet_id}
                    >
                      {refreshingSheet === sheet.google_sheet_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                    {sheet.web_view_link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(sheet.web_view_link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
