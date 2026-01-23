"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Link2, Unlink, RefreshCw, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface GooglePanelProps {
  connected: boolean
  email: string | null
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => Promise<any>
}

export function GooglePanel({ connected, email, onConnect, onDisconnect, onSync }: GooglePanelProps) {
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await onSync()
      toast.success(`Synced ${result.total} sheets (${result.created} new, ${result.updated} updated)`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await onDisconnect()
      toast.success('Google account disconnected')
    } catch (err) {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  if (!connected) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Connect Google Sheets</CardTitle>
          <CardDescription>Import spreadsheets directly from Google Drive</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onConnect} className="w-full">
            <Link2 className="h-4 w-4 mr-2" />
            Connect Google Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Google Sheets</CardTitle>
              <CardDescription className="text-xs">{email}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button onClick={handleSync} disabled={syncing} className="flex-1">
          {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {syncing ? 'Syncing...' : 'Sync Sheets'}
        </Button>
        <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
          {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}
