"use client"

import { useState, useCallback, type ChangeEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { StorageBar } from "@/components/files/storage-bar"
import { DataSourceList } from "@/components/files/data-source-list"
import { GooglePanel } from "@/components/files/google-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, Loader2, RefreshCw, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

export default function FilesPage() {
  const { user, organizationId } = useAuth()
  const { 
    dataSources, 
    storage, 
    loading, 
    error,
    isGoogleConnected,
    googleEmail,
    refresh,
    connectGoogle,
    disconnectGoogle,
    syncGoogleSheets,
    deleteDataSource
  } = ()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      // Check storage limit
      if (storage.used + file.size > storage.limit) {
        toast.error('Not enough storage space. Please upgrade your plan or delete some files.')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user || !organizationId) return

    setUploading(true)
    let datasourceId = ''

    try {
      // Create record
      const { data: record, error: dbError } = await supabase
        .from('datasources')
        .insert({
          file_name: selectedFile.name,
          organization_id: organizationId,
          uploaded_by_user_id: user.id,
          status: 'uploading',
          storage_path: 'pending',
          file_size: selectedFile.size
        })
        .select('id')
        .single()

      if (dbError) throw dbError
      datasourceId = record.id

      const filePath = `${organizationId}/${datasourceId}/${selectedFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile, { upsert: false })

      if (uploadError) throw uploadError

      await supabase
        .from('datasources')
        .update({ storage_path: filePath, status: 'processing' })
        .eq('id', datasourceId)

      const { error: fnError } = await supabase.functions.invoke('process-csv', {
        body: { datasourceId }
      })
      if (fnError) throw fnError

      toast.success(`"${selectedFile.name}" uploaded successfully`)
      refresh()
    } catch (err) {
      console.error("Full upload error:", err)
      toast.error(`Upload failed: ${(err as Error).message}`)
      if (datasourceId) {
        await supabase.from('datasources').delete().eq('id', datasourceId)
      }
    } finally {
      setUploading(false)
      setSelectedFile(null)
      const input = document.getElementById('file-input') as HTMLInputElement
      if (input) input.value = ''
    }
  }

  const handleDelete = async (id: string, source: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return
    try {
      await deleteDataSource(id, source)
      toast.success('Data source deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

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

      {/* Storage Bar */}
      <StorageBar used={storage.used} limit={storage.limit} percentage={storage.percentage} />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Top cards: CSV Upload | Excel (coming soon) | Google Sheets */}
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

        {/* Google Panel */}
        <GooglePanel
          connected={isGoogleConnected}
          email={googleEmail}
          onConnect={connectGoogle}
          onDisconnect={disconnectGoogle}
          onSync={syncGoogleSheets}
        />
      </div>

      {/* Unified data source list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      ) : (
        <DataSourceList dataSources={dataSources} onDelete={handleDelete} />
      )}
    </div>
  )
}
