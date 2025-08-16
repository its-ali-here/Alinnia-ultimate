"use client"

import React, { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileSpreadsheet, ExternalLink, AlertCircle } from 'lucide-react'
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

export function GoogleSheetsConnector({ onSheetSelect }: GoogleSheetsConnectorProps) {
  const { data: session, status } = useSession()
  const [sheets, setSheets] = useState<GoogleSheet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (session) {
      fetchSheets()
    }
  }, [session])

  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: window.location.href,
      redirect: true 
    })
  }

  const handleSheetSelect = (sheet: GoogleSheet) => {
    if (onSheetSelect) {
      onSheetSelect(sheet.id, sheet.name)
    }
    toast.success(`Selected: ${sheet.name}`)
  }

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Connect Google Sheets
          </CardTitle>
          <CardDescription>
            Sign in with Google to access your spreadsheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full">
            Sign in with Google
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
          Select a spreadsheet to import data from
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
