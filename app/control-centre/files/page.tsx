"use client"

import { useState, useCallback, type ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, Loader2, RefreshCw, FileText, FileSpreadsheet } from "lucide-react"

export default function FilesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock data for development
  const storage = { used: 0, limit: 1000000000, percentage: 0 }
  const dataSources: any[] = []
  const error = null
  const isGoogleConnected = false
  const googleEmail = ""

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    
    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      setSelectedFile(null)
      const input = document.getElementById('file-input') as HTMLInputElement
      if (input) input.value = ''
      alert('File uploaded successfully (placeholder)')
    }, 2000)
  }

  const handleDelete = async (id: string, source: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return
    alert('Delete functionality not implemented yet')
  }

  const refresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const connectGoogle = () => alert('Google Connect not implemented')
  const disconnectGoogle = () => alert('Google Disconnect not implemented')
  const syncGoogleSheets = () => alert('Google Sync not implemented')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">Manage your CSV, Excel (coming soon), and Google Sheets</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Storage Bar Placeholder */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${storage.percentage}%` }}></div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Upload CSV Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload CSV</CardTitle>
            <CardDescription>Upload CSV files for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-input">Select File</Label>
              <Input 
                id="file-input" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {uploading && <Progress value={100} className="animate-pulse" />}
            <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </CardContent>
        </Card>

        {/* Excel Card - Coming Soon */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">Excel</CardTitle>
                <CardDescription className="text-xs">Import Excel spreadsheets (.xlsx)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Excel import is coming soon. Stay tuned.</p>
            <Input type="file" accept=".xlsx,.xls" disabled />
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Google Sheets Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Google Sheets</CardTitle>
            <CardDescription>Connect your Google account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isGoogleConnected ? `Connected as ${googleEmail}` : 'Not connected'}
            </p>
            <Button 
              onClick={isGoogleConnected ? disconnectGoogle : connectGoogle}
              variant={isGoogleConnected ? "destructive" : "default"}
              className="w-full"
            >
              {isGoogleConnected ? 'Disconnect' : 'Connect Google'}
            </Button>
            {isGoogleConnected && (
              <Button onClick={syncGoogleSheets} variant="outline" className="w-full">
                Sync Sheets
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Sources List Placeholder */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {dataSources.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No data sources yet. Upload a CSV or connect Google Sheets to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {dataSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span>{source.name}</span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(source.id, source.source)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}