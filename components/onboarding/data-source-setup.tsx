"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileSpreadsheet, Upload, CheckCircle, AlertCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface DataSourceSetupProps {
  selectedSource: string | null
  onSourceConnected: (source: string, connected: boolean) => void
}

interface IntegrationStatus {
  connected: boolean
  email: string | null
  connectedAt: string | null
}

export function DataSourceSetup({ selectedSource, onSourceConnected }: DataSourceSetupProps) {
  const { user } = useAuth()
  const [connecting, setConnecting] = useState(false)
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Check integration status when Google Sheets is selected
  useEffect(() => {
    if (selectedSource === 'google-sheets' && user) {
      checkIntegrationStatus()
    }
  }, [selectedSource, user])

  const checkIntegrationStatus = async () => {
    setCheckingStatus(true)
    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      setIntegration(data)

      if (data.connected) {
        onSourceConnected('google-sheets', true)
      }
    } catch (err) {
      console.error('Failed to check integration status:', err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleGoogleSheetsConnect = async () => {
    setConnecting(true)

    try {
      const response = await fetch('/api/integrations/google/connect')
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to get auth URL')
      }
    } catch (error) {
      toast.error('Failed to connect Google Sheets')
      setConnecting(false)
    }
  }

  const handleCSVSetup = () => {
    onSourceConnected('csv-upload', true)
    toast.success('CSV upload ready - you can upload files after setup!')
  }

  const handleManualEntry = () => {
    onSourceConnected('manual-entry', true)
    toast.success('Manual entry selected - sample data will be provided!')
  }

  const handleSkip = () => {
    onSourceConnected('skip', true)
    toast.success('Data source setup skipped - you can set this up later!')
  }

  if (!selectedSource) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a data source option to continue.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {selectedSource === 'google-sheets' && (
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
          <CardContent className="space-y-4">
            {checkingStatus ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Checking connection status...</span>
              </div>
            ) : integration?.connected ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Google Sheets Connected
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Connected as {integration.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Benefits of connecting Google Sheets:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Import data directly from your spreadsheets</li>
                    <li>• Real-time data synchronization</li>
                    <li>• No need to manually upload CSV files</li>
                    <li>• Access to all your Google Sheets in one place</li>
                  </ul>
                </div>

                <Button
                  onClick={handleGoogleSheetsConnect}
                  disabled={connecting}
                  className="w-full"
                >
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
            )}
          </CardContent>
        </Card>
      )}

      {selectedSource === 'csv-upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV File Upload
            </CardTitle>
            <CardDescription>
              You'll be able to upload CSV files after completing setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                CSV Upload Features:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Support for various CSV formats</li>
                <li>• Automatic data type detection</li>
                <li>• Data validation and cleaning</li>
                <li>• Preview before importing</li>
              </ul>
            </div>
            
            <Button onClick={handleCSVSetup} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Set up CSV Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedSource === 'manual-entry' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✏️ Manual Data Entry
            </CardTitle>
            <CardDescription>
              Start with sample data and add your own information later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What you'll get:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Sample data relevant to your business type</li>
                <li>• Pre-configured dashboards and reports</li>
                <li>• Easy data entry forms</li>
                <li>• Ability to import real data later</li>
              </ul>
            </div>
            
            <Button onClick={handleManualEntry} className="w-full">
              ✏️ Start with Sample Data
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedSource === 'skip' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⏭️ Skip Data Setup
            </CardTitle>
            <CardDescription>
              You can set up data sources later from the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                You can add data sources later from:
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Dashboard → Data Sources</li>
                <li>• Settings → Integrations</li>
                <li>• Files → Upload or Connect</li>
              </ul>
            </div>
            
            <Button onClick={handleSkip} variant="outline" className="w-full">
              ⏭️ Skip for Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
