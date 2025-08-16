"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useDataSources } from "@/hooks/use-data-sources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileSpreadsheet, Upload, Plus, Calendar, FileText, Database, RefreshCw, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function FilesPage() {
  const { data: session } = useSession()
  const { dataSources, loading, error, refreshDataSources } = useDataSources()
  const [dateFormat, setDateFormat] = useState("")
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)

  const handleCSVUpload = () => {
    if (!dateFormat) {
      toast.error("Please select a date format first")
      return
    }
    setCsvDialogOpen(false)
    toast.success("CSV upload configured! You can now upload files.")
    // Refresh data sources after potential upload
    setTimeout(() => {
      refreshDataSources()
    }, 1000)
  }

  const handleGoogleSheetsConnect = () => {
    if (session?.accessToken) {
      // Already connected, redirect to settings to sync
      window.location.href = '/dashboard/settings?tab=integrations'
    } else {
      // Need to connect first
      signIn('google', {
        callbackUrl: '/dashboard/settings?tab=integrations',
        redirect: true
      })
    }
  }

  const handleExcelConnect = () => {
    toast.info("Microsoft Excel integration coming soon!")
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "CSV":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "Google Sheets":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case "Microsoft Excel":
        return <FileSpreadsheet className="h-4 w-4 text-orange-600" />
      default:
        return <Database className="h-4 w-4 text-gray-600" />
    }
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "CSV":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Google Sheets":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Microsoft Excel":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "uploading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const formatFileSize = (size: string | number) => {
    if (typeof size === 'string' && size !== 'Unknown') return size
    if (typeof size === 'number') {
      const mb = size / (1024 * 1024)
      return `${mb.toFixed(1)} MB`
    }
    return 'Unknown'
  }

  const handleViewFile = (dataSource: any) => {
    if (dataSource.source === 'Google Sheets' && dataSource.metadata?.webViewLink) {
      window.open(dataSource.metadata.webViewLink, '_blank')
    } else {
      toast.info('File viewing functionality coming soon!')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
        <p className="text-muted-foreground">
          Connect and manage your data sources for business intelligence and analytics.
        </p>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV Upload Card */}
        <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Upload CSV Files</CardTitle>
                <CardDescription>
                  Import data from CSV files with custom date formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add CSV File
                </Button>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure CSV Upload</DialogTitle>
              <DialogDescription>
                Select your preferred date format for CSV data processing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (US Format)</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (European Format)</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO Format)</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCsvDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCSVUpload}>
                  Configure & Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Google Sheets Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleGoogleSheetsConnect}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Connect Google Sheets</CardTitle>
            <CardDescription>
              Import data directly from your Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant={session?.accessToken ? "secondary" : "default"}>
              {session?.accessToken ? (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Manage Sheets
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Microsoft Excel Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-60" onClick={handleExcelConnect}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Connect Microsoft Excel</CardTitle>
            <CardDescription>
              Import data from Excel files and OneDrive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Connected Data Sources</CardTitle>
              <CardDescription>
                Manage and view all your connected data sources
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshDataSources} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading data sources...</span>
            </div>
          ) : dataSources.length === 0 ? (
            <div className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No data sources found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by uploading a CSV file or connecting Google Sheets
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataSources.map((dataSource) => (
                <div key={dataSource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(dataSource.source)}
                    <div>
                      <h4 className="font-medium">{dataSource.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {dataSource.source === 'Google Sheets' ? 'Modified' : 'Uploaded'} on {new Date(dataSource.uploadedAt).toLocaleDateString()}
                        </p>
                        {dataSource.status !== 'ready' && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(dataSource.status)}`}>
                            {dataSource.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceBadgeColor(dataSource.source)}`}>
                        {dataSource.source}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{formatFileSize(dataSource.size)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewFile(dataSource)}>
                      {dataSource.source === 'Google Sheets' ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
