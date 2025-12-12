"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileSpreadsheet, ExternalLink, AlertCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface GoogleSheet {
  id: string
  name: string
  modifiedTime: string
  webViewLink: string
}

interface GoogleSheetsConnectorProps {
  onSheetSelect?: (sheetId: string, sheetName: string) => void
}

interface IntegrationStatus {
  connected: boolean
  email: string | null
  connectedAt: string | null
  tokenExpired?: boolean
}

export function GoogleSheetsConnector({ onSheetSelect }: GoogleSheetsConnectorProps) {
  const { user, loading: authLoading } = useAuth()
  const [sheets, setSheets] = useState<GoogleSheet[]>([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Check integration status
  const checkIntegrationStatus = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      setIntegration(data)

      if (data.connected && !data.tokenExpired) {
        fetchSheets()
      }
    } catch (err) {
      console.error('Failed to check integration status:', err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const fetchSheets = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/google-sheets?action=list')
      const data = await response.json()

      if (!response.ok) {
        if (data.needsConnection) {
          setIntegration({ connected: false, email: null, connectedAt: null })
          return
        }
        throw new Error(data.error || 'Failed to fetch sheets')
      }

      setSheets(data.sheets)
    } catch (err) {
      const errorMessage = (err as Error).message
      setError(errorMessage)
      toast.error(`Failed to load Google Sheets: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkIntegrationStatus()
    }
  }, [user])

  const handleConnectGoogle = async () => {
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

  const handleSheetSelect = (sheet: GoogleSheet) => {
    if (onSheetSelect) {
      onSheetSelect(sheet.id, sheet.name)
    }
    toast.success(`Selected: ${sheet.name}`)
  }

  if (authLoading || checkingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Connect Google Sheets
          </CardTitle>
          <CardDescription>
            Please log in to connect your Google Sheets
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!integration?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Connect Google Sheets
          </CardTitle>
          <CardDescription>
            Connect your Google account to access your spreadsheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnectGoogle} className="w-full" disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
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
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Your Google Sheets
        </CardTitle>
        <CardDescription>
          Connected as {integration.email} • Select a spreadsheet to import
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {sheets.length} spreadsheet(s) found
            </span>
            <Button variant="outline" size="sm" onClick={fetchSheets} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>

          {loading && sheets.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{sheet.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(sheet.webViewLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSheetSelect(sheet)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}

              {sheets.length === 0 && !loading && (
                <div className="text-center p-8 text-muted-foreground">
                  No Google Sheets found in your account
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
