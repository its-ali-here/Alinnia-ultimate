"use client"

import { useState, useCallback, useEffect, type ChangeEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { FileObject } from "@supabase/storage-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { UploadCloud, Trash2, FileText, RefreshCw, Loader2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

// Helper function to format bytes into a readable string
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function FileManager() {
  const { user, organizationId } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!organizationId || !isSupabaseConfigured()) {
      setIsLoadingFiles(false)
      return
    }
    try {
      setIsLoadingFiles(true)
      const { data, error } = await supabase.storage
        .from("files") // Correct bucket name
        .list(`${organizationId}/`, { // Scoped to the organization's "folder"
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error
      
      setUploadedFiles(data || [])
    } catch (error) {
      toast.error("Failed to fetch files: " + (error as Error).message)
    } finally {
      setIsLoadingFiles(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !user || !organizationId || !isSupabaseConfigured()) {
      toast.error("Cannot upload file. Please check if you are logged in and a file is selected.")
      return
    }

    setIsUploading(true)
    const filePath = `${organizationId}/${selectedFile.name}`

    try {
      const { error } = await supabase.storage
        .from("files") // Correct bucket name
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true, // Use true to allow overwriting files with the same name
        })

      if (error) throw error

      toast.success(`"${selectedFile.name}" uploaded successfully.`)
      fetchFiles() // Refresh the file list
    } catch (error) {
      toast.error(`Upload failed: ${(error as Error).message}`)
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
  }

  const handleDeleteFile = async (file: FileObject) => {
    if (!organizationId || !isSupabaseConfigured()) return;
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const filePath = `${organizationId}/${file.name}`
      const { error } = await supabase.storage.from("files").remove([filePath])

      if (error) throw error;
      
      toast.success(`"${file.name}" deleted successfully.`)
      fetchFiles()
    } catch (error) {
      toast.error("Failed to delete file: " + (error as Error).message)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card><CardHeader><CardTitle>File Manager Unavailable</CardTitle></CardHeader><CardContent><p>Supabase is not configured.</p></CardContent></Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New File</CardTitle>
          <CardDescription>Upload files to your organization's storage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input id="file-upload-input" type="file" onChange={handleFileChange} disabled={isUploading} />
          {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          {isUploading && <Progress value={100} className="w-full animate-pulse" />}
          <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Uploaded Files</CardTitle>
            <Button variant="outline" size="icon" onClick={fetchFiles} disabled={isLoadingFiles}>
              <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>Manage your organization's uploaded files.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading files...</div>
          ) : !uploadedFiles.length ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No files uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a file.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{formatBytes(file.metadata.size)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(file.metadata.lastModified), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}