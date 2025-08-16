"use client"

import React, { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileSpreadsheet, CheckCircle, AlertCircle, ExternalLink, Unlink } from 'lucide-react'
import { toast } from 'sonner'

export function GoogleSheetsIntegration() {
  const { data: session, status } = useSession()
  const [sheets, setSheets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConnected = !!session?.accessToken

  const fetchSheets = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/google-sheets?action=list')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sheets')
      }

      setSheets(data.sheets.slice(0, 3)) // Show only first 3 sheets
    } catch (err) {
      const errorMessage = (err as Error).message
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSheets()
    }
  }, [session])

  const handleConnect = () => {
    signIn('google', {
      callbackUrl: window.location.href,
      redirect: true
    })
  }

  const handleDisconnect = async () => {
    try {
      await signOut({ redirect: false })
      setSheets([])
      setError(null)
      toast.success('Google Sheets disconnected successfully')
    } catch (err) {
      toast.error('Failed to disconnect Google Sheets')
    }
  }

  const handleTestConnection = () => {
    fetchSheets()
    toast.success('Testing connection...')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading integration status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <div>
            <h4 className="font-medium">Google Sheets</h4>
            <p className="text-sm text-muted-foreground">
              Import data directly from your Google Sheets
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <Unlink className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                Not Connected
              </Badge>
              <Button size="sm" onClick={handleConnect}>
                Connect
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isConnected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">Connected Account</h5>
            <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
          </div>

          {sheets.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Recent Sheets ({sheets.length} of many)</h5>
              <div className="space-y-2">
                {sheets.map((sheet) => (
                  <div key={sheet.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate flex-1">{sheet.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(sheet.webViewLink, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Permissions granted:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Read your Google Sheets</li>
              <li>Access your Google Drive files</li>
            </ul>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="p-4 bg-muted rounded-lg">
          <h5 className="text-sm font-medium mb-2">Benefits of connecting Google Sheets:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Import data directly from your spreadsheets</li>
            <li>• Real-time data synchronization</li>
            <li>• No need to manually upload CSV files</li>
            <li>• Access to all your Google Sheets in one place</li>
          </ul>
        </div>
      )}
    </div>
  )
}
