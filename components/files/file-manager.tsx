"use client"

import { useState, useCallback, useEffect, type ChangeEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import {
  createUploadedFileRecord,
  getUploadedFilesForOrganization,
  updateUploadedFileStatus,
  deleteUploadedFileRecord,
  type UploadedFile as DbUploadedFile,
} from "@/lib/database"
import { parseCsv } from "@/lib/csv-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { UploadCloud, Trash2, FileText, RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"

export function FileManager() {
  const { user, organizationId } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<DbUploadedFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!organizationId || !isSupabaseConfigured()) {
      setIsLoadingFiles(false)
      return
    }
    try {
      setIsLoadingFiles(true)
      const files = await getUploadedFilesForOrganization(organizationId)
      setUploadedFiles(files)
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
      const file = event.target.files[0]
      if (file.type !== "text/csv") {
        toast.error("Invalid file type. Please upload a CSV file.")
        setSelectedFile(null)
        event.target.value = "" // Reset input
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    console.log("handleFileUpload called.")
    if (!selectedFile) {
      toast.error("No file selected. Please select a CSV file to upload.")
      console.log("Upload attempt failed: No file selected.")
      return
    }
    if (!user) {
      toast.error("User not authenticated. Please log in.")
      console.log("Upload attempt failed: User not authenticated.")
      return
    }
    if (!organizationId) {
      toast.error("Organization context not found. Cannot upload file.")
      console.log("Upload attempt failed: Organization ID not found.")
      return
    }
    if (!isSupabaseConfigured()) {
      toast.error("Supabase is not configured. Cannot upload file.")
      console.log("Upload attempt failed: Supabase not configured.")
      return
    }

    console.log(`Starting upload for file: ${selectedFile.name}, User: ${user.id}, Org: ${organizationId}`)
    setIsUploading(true)
    setUploadProgress(0)

    // Use a unique file name including a timestamp or UUID to prevent overwrites
    const uniqueFileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, "_")}`
    const storagePath = `organization_files/${organizationId}/${user.id}/${uniqueFileName}`
    console.log("Storage path:", storagePath)

    let dbRecord: DbUploadedFile | null = null
    try {
      console.log("Creating initial file record in database...")
      dbRecord = await createUploadedFileRecord(organizationId, user.id, {
        fileName: selectedFile.name, // Store original file name
        storagePath: storagePath,
        fileSizeBytes: selectedFile.size,
        fileType: selectedFile.type,
      })

      if (!dbRecord) {
        throw new Error("Failed to create file metadata record in database.")
      }
      console.log("File record created in DB, ID:", dbRecord.id)
      // Optimistically add to UI or wait for fetchFiles to update
      setUploadedFiles((prev) => [dbRecord!, ...prev.filter((f) => f.id !== dbRecord!.id)])

      console.log("Uploading file to Supabase Storage...")
      const { error: uploadError } = await supabase.storage
        .from("organization_files") // Make sure this bucket name is correct
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false, // Set to true if you want to allow overwriting, but unique names are better
          contentType: selectedFile.type,
          // onUploadProgress is not a standard option for supabase.storage.upload directly.
          // For progress, you might need a more complex setup or rely on overall time.
          // We'll simulate progress based on steps for now or remove if not feasible.
        })
      // Simulate progress for storage upload part
      setUploadProgress(50)

      if (uploadError) {
        console.error("Supabase storage upload error:", JSON.stringify(uploadError, null, 2))
        await updateUploadedFileStatus(dbRecord.id, "error", {
          processingError: `Storage upload failed: ${uploadError.message}`,
        })
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }
      console.log("File uploaded to storage successfully.")
      setUploadProgress(75)

      console.log("Updating file record status to 'processing'...")
      await updateUploadedFileStatus(dbRecord.id, "processing")
      // Refresh local state for this file
      setUploadedFiles((prev) => prev.map((f) => (f.id === dbRecord!.id ? { ...f, status: "processing" } : f)))

      toast.info(`"${selectedFile.name}" uploaded. Now processing content...`)
      console.log("Fetching file content for parsing...")
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from("organization_files")
        .download(storagePath)

      if (downloadError) {
        console.error("Error downloading file for parsing:", JSON.stringify(downloadError, null, 2))
        await updateUploadedFileStatus(dbRecord.id, "error", {
          processingError: `Failed to download for parsing: ${downloadError.message}`,
        })
        throw new Error(`Failed to download for parsing: ${downloadError.message}`)
      }

      const csvText = await downloadData.text()
      console.log("File content downloaded, parsing CSV...")
      const parsedResult = parseCsv(csvText)

      if (parsedResult.error) {
        console.error("CSV Parsing error:", parsedResult.error)
        await updateUploadedFileStatus(dbRecord.id, "error", {
          processingError: `CSV Parsing error: ${parsedResult.error}`,
        })
        throw new Error(`CSV Parsing error: ${parsedResult.error}`)
      }
      console.log("CSV parsed successfully. Headers:", parsedResult.headers, "Row count:", parsedResult.rowCount)

      await updateUploadedFileStatus(dbRecord.id, "ready", {
        columnHeaders: parsedResult.headers,
        rowCount: parsedResult.rowCount,
      })
      setUploadProgress(100)
      toast.success(`"${selectedFile.name}" processed and ready.`)
      console.log("File processing complete, status set to 'ready'.")
    } catch (error) {
      console.error("Error during file upload and processing:", error)
      toast.error(`Operation failed: ${(error as Error).message}`)
      if (dbRecord && dbRecord.id && dbRecord.status !== "ready") {
        // Check if dbRecord and id exist
        try {
          await updateUploadedFileStatus(dbRecord.id, "error", { processingError: (error as Error).message })
          console.log(`File record ${dbRecord.id} status updated to 'error' after catching exception.`)
        } catch (updateError) {
          console.error(`Failed to update file ${dbRecord.id} status to error:`, updateError)
        }
      }
    } finally {
      console.log("Upload process finished (either success or failure).")
      setIsUploading(false)
      setSelectedFile(null)
      // Reset file input visually
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      console.log("Fetching updated list of files...")
      fetchFiles() // Refresh the list of files from the database
    }
  }

  const handleDeleteFile = async (file: DbUploadedFile) => {
    if (!isSupabaseConfigured()) return
    if (!confirm(`Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`)) {
      return
    }
    try {
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from("organization_files").remove([file.storage_path])
      if (storageError) {
        // Log error but proceed to delete DB record if user confirms, or handle more gracefully
        toast.error(`Storage deletion error: ${storageError.message}. Record might still be deleted.`)
      }

      // Delete record from database
      await deleteUploadedFileRecord(file.id)
      toast.success(`"${file.file_name}" deleted successfully.`)
      fetchFiles()
    } catch (error) {
      toast.error("Failed to delete file: " + (error as Error).message)
    }
  }

  const getStatusIcon = (status: DbUploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>File Manager Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Supabase is not configured. Please set up your environment variables.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New CSV File</CardTitle>
          <CardDescription>Upload CSV files to be used for analytics and reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input id="file-upload-input" type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
          {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          {isUploading && <Progress value={uploadProgress} className="w-full" />}
          <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload File"}
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
          <CardDescription>Manage your uploaded CSV files.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles && !uploadedFiles.length ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading files...
            </div>
          ) : !uploadedFiles.length ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No files uploaded</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a CSV file.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.file_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <span className="capitalize">{file.status}</span>
                      </div>
                      {file.status === "error" && file.processing_error && (
                        <p className="text-xs text-red-500 mt-1" title={file.processing_error}>
                          Error: {file.processing_error.substring(0, 50)}...
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{file.row_count ?? "N/A"}</TableCell>
                    <TableCell>{file.column_headers?.length ?? "N/A"}</TableCell>
                    <TableCell>{format(new Date(file.uploaded_at), "PPp")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file)}
                        disabled={file.status === "uploading" || file.status === "processing"}
                      >
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
