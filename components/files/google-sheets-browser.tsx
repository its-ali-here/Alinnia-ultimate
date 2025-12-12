"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileSpreadsheet, ExternalLink, Plus, AlertCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface GoogleSheet {
  id: string
  name: string
  modifiedTime: string
  webViewLink: string
}

interface GoogleSheetsBrowserProps {
  onSheetsImported: () => void
}

interface IntegrationStatus {
  connected: boolean
  email: string | null
  needsConnection?: boolean
}

export function GoogleSheetsBrowser({ onSheetsImported }: GoogleSheetsBrowserProps) {
  const { user, organization } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [availableSheets, setAvailableSheets] = useState<GoogleSheet[]>([])
  const [selectedSheets, setSelectedSheets] = useState<string[]>([])
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const checkIntegrationStatus = async () => {
    if (!user) return

    setCheckingStatus(true)
    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      setIntegration(data)
      return data.connected
    } catch (err) {
      console.error('Failed to check integration status:', err)
      return false
    } finally {
      setCheckingStatus(false)
    }
  }

  const fetchAvailableSheets = async () => {
    setLoading(true)
    try {
      console.log('Fetching available Google Sheets...')
      const response = await fetch('/api/google-sheets?action=list')
      const data = await response.json()

      if (!response.ok) {
        if (data.needsConnection) {
          setIntegration({ connected: false, email: null, needsConnection: true })
          return
        }
        throw new Error(data.error || 'Failed to fetch Google Sheets')
      }

      console.log('Available sheets:', data.sheets?.length || 0)
      setAvailableSheets(data.sheets || [])
    } catch (error) {
      console.error('Error fetching sheets:', error)
      toast.error(`Failed to fetch Google Sheets: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSheetToggle = (sheetId: string) => {
    setSelectedSheets(prev =>
      prev.includes(sheetId)
        ? prev.filter(id => id !== sheetId)
        : [...prev, sheetId]
    )
  }

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

  const handleImportSelected = async () => {
    if (selectedSheets.length === 0) {
      toast.error('Please select at least one Google Sheet to import')
      return
    }

    if (!organization?.id || !user?.id) {
      toast.error('Organization or user information missing')
      return
    }

    setImporting(true)
    try {
      console.log('Importing selected sheets:', selectedSheets)

      // Import each selected sheet
      const importPromises = selectedSheets.map(async (sheetId) => {
        const sheet = availableSheets.find(s => s.id === sheetId)
        if (!sheet) return { error: 'Sheet not found' }

        // Save sheet metadata to database
        const response = await fetch('/api/google-sheets/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleSheetId: sheet.id,
            name: sheet.name,
            webViewLink: sheet.webViewLink,
            lastModified: sheet.modifiedTime,
            organizationId: organization.id,
            userId: user.id
          })
        })

        const result = await response.json()
        return { sheetId, success: response.ok, ...result }
      })

      const results = await Promise.all(importPromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      if (successful > 0) {
        toast.success(`Successfully imported ${successful} Google Sheet${successful !== 1 ? 's' : ''}`)
        onSheetsImported()
        setIsOpen(false)
        setSelectedSheets([])
      }

      if (failed > 0) {
        toast.error(`Failed to import ${failed} sheet${failed !== 1 ? 's' : ''}`)
      }

    } catch (error) {
      console.error('Import error:', error)
      toast.error(`Failed to import sheets: ${(error as Error).message}`)
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    const loadSheets = async () => {
      if (isOpen && user) {
        const isConnected = await checkIntegrationStatus()
        if (isConnected) {
          fetchAvailableSheets()
        }
      }
    }
    loadSheets()
  }, [isOpen, user])

  if (!user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Import Google Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Google Sheets</DialogTitle>
          <DialogDescription>
            Select the Google Sheets you want to import for use in dashboards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {checkingStatus || loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{checkingStatus ? 'Checking connection...' : 'Loading your Google Sheets...'}</span>
            </div>
          ) : !integration?.connected ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect Google Sheets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Google account to import spreadsheets.
              </p>
              <Button onClick={handleConnectGoogle} disabled={connecting}>
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
            </div>
          ) : availableSheets.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Google Sheets Found</h3>
              <p className="text-sm text-muted-foreground">
                Create some spreadsheets in Google Drive first, then try again.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {availableSheets.length} sheet{availableSheets.length !== 1 ? 's' : ''} available
                </p>
                <Badge variant="secondary">
                  {selectedSheets.length} selected
                </Badge>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {availableSheets.map((sheet) => (
                  <Card 
                    key={sheet.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedSheets.includes(sheet.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSheetToggle(sheet.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={selectedSheets.includes(sheet.id)}
                          onChange={() => {}} // Handled by card click
                        />
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sheet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                        {sheet.webViewLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(sheet.webViewLink, '_blank')
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportSelected}
                  disabled={selectedSheets.length === 0 || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${selectedSheets.length} Sheet${selectedSheets.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
