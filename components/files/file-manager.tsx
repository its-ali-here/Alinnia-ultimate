"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useAuth } from "@/contexts/auth-context"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import {
  createUploadedFileRecord,
  updateUploadedFileStatus,
  getUploadedFilesForOrganization,
  deleteUploadedFileRecord, // Added
  type UploadedFile as DbUploadedFile, // Renamed to avoid conflict
} from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner" // Assuming sonner is available via shadcn/ui
import { Upload, FileText, Download, Trash2, Eye, BarChart3, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Keep local interface for UI state, DbUploadedFile for database interactions
interface UploadedFileUI extends DbUploadedFile {
  progress?: number // UI-only progress for uploads
  fileObject?: File // Store the actual file object for upload
}

export function FileManager() {
  const { user, organizationId } = useAuth() // Assuming organizationId is available from AuthContext
  const [files, setFiles] = useState<UploadedFileUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!organizationId || !isSupabaseConfigured()) {
      setIsLoading(false)
      if (isSupabaseConfigured()) toast.error("Organization ID not found.")
      return
    }
    try {
      setIsLoading(true)
      const orgFiles = await getUploadedFilesForOrganization(organizationId)
      setFiles(orgFiles.map((f) => ({ ...f, progress: f.status === "uploading" ? 0 : 100 })))
    } catch (error) {
      toast.error("Failed to fetch files: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || !organizationId || !isSupabaseConfigured()) {
        toast.error("Cannot upload file: User or organization not identified, or Supabase not configured.")
        return
      }

      for (const file of acceptedFiles) {
        const fileId = crypto.randomUUID() // Use crypto.randomUUID for unique ID
        const newFileUI: UploadedFileUI = {
          // Initialize with placeholder values, will be replaced by DB record
          id: fileId, // Temporary UI ID
          organization_id: organizationId,
          uploaded_by_user_id: user.id,
          file_name: file.name,
          storage_path: "", // Will be set after upload
          file_size_bytes: file.size,
          file_type: file.type,
          status: "uploading",
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 0,
          fileObject: file, // Keep file object for upload
        }
        setFiles((prev) => [newFileUI, ...prev])

        // Upload to Supabase Storage
        const filePath = `${organizationId}/${user.id}/${fileId}-${file.name}`

        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("organization_files") // Ensure this bucket exists and has RLS
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false, // true if you want to allow overwriting
              contentType: file.type,
            })

          if (uploadError) throw uploadError

          const storagePath = uploadData.path

          // Create metadata record in database
          const dbRecord = await createUploadedFileRecord(organizationId, user.id, {
            fileName: file.name,
            storagePath: storagePath,
            fileSizeBytes: file.size,
            fileType: file.type,
          })

          if (!dbRecord) throw new Error("Failed to create file record in database.")

          // Update UI with actual DB record and simulate processing
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...dbRecord, progress: 100, status: "processing" } : f)),
          )

          toast.success(`File "${file.name}" uploaded successfully. Processing...`)

          // Simulate processing (e.g., reading headers, row count)
          // In a real app, this would be a server-side task (e.g., Edge Function)
          setTimeout(async () => {
            try {
              // Example: "Process" the file (e.g. get row count, column headers)
              // This is a placeholder. Actual CSV parsing is complex.
              const updatedRecord = await updateUploadedFileStatus(dbRecord.id, "ready", {
                rowCount: Math.floor(Math.random() * 1000) + 50, // Dummy data
                columnHeaders: ["Col A", "Col B", "Col C"], // Dummy data
              })
              if (updatedRecord) {
                setFiles((prev) =>
                  prev.map((f) => (f.id === updatedRecord.id ? { ...updatedRecord, progress: 100 } : f)),
                )
                toast.success(`File "${updatedRecord.file_name}" is ready.`)
              }
            } catch (processingError) {
              if (dbRecord) {
                await updateUploadedFileStatus(dbRecord.id, "error", {
                  processingError: (processingError as Error).message,
                })
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === dbRecord.id
                      ? { ...f, status: "error", processingError: (processingError as Error).message }
                      : f,
                  ),
                )
              }
              toast.error(`Error processing file "${file.name}": ${(processingError as Error).message}`)
            }
          }, 2000)
        } catch (error) {
          console.error("Upload or DB record error:", error)
          toast.error(`Failed to upload ${file.name}: ${(error as Error).message}`)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "error", processingError: (error as Error).message } : f,
            ),
          )
        }
      }
    },
    [user, organizationId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"], // Note: parsing .xls is harder than .xlsx or .csv
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: true,
    disabled: !isSupabaseConfigured() || !organizationId,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadedFileUI["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadedFileUI["status"]) => {
    switch (status) {
      case "uploading":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  const handleDeleteFile = async (file: UploadedFileUI) => {
    if (!isSupabaseConfigured()) {
      toast.error("Supabase not configured.")
      return
    }
    if (confirm(`Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`)) {
      try {
        // Delete from Supabase Storage
        const { error: storageError } = await supabase.storage.from("organization_files").remove([file.storage_path])

        if (storageError && storageError.message !== "The resource was not found") {
          // Allow deletion of DB record even if file not found in storage (e.g. inconsistent state)
          throw storageError
        }

        // Delete metadata record from database
        await deleteUploadedFileRecord(file.id)

        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))
        toast.success(`File "${file.file_name}" deleted successfully.`)
      } catch (error) {
        console.error("Error deleting file:", error)
        toast.error(`Failed to delete file "${file.file_name}": ${(error as Error).message}`)
      }
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

  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" /> Loading files...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              (!organizationId || !isSupabaseConfigured()) && "cursor-not-allowed opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop CSV/XLS/XLSX files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Max file size 10MB. Ensure your Supabase bucket 'organization_files' is created.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Files ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">{file.file_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size_bytes)} • {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(getStatusColor(file.status), "capitalize")}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(file.status)}
                          {file.status}
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {(file.status === "uploading" || file.status === "processing") &&
                    typeof file.progress === "number" && <Progress value={file.progress} className="mb-2 h-2" />}

                  {file.status === "ready" && file.row_count && (
                    <div className="text-sm text-muted-foreground mb-3">
                      {file.row_count.toLocaleString()} rows • {file.column_headers?.length || "N/A"} columns
                      {file.column_headers && (
                        <p className="text-xs truncate">Cols: {file.column_headers.join(", ")}</p>
                      )}
                    </div>
                  )}
                  {file.status === "error" && file.processing_error && (
                    <p className="text-sm text-red-500 mb-3">Error: {file.processing_error}</p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {file.status === "ready" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Preview functionality to be implemented.")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Analyze functionality to be implemented.")}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analyze
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!isSupabaseConfigured()) return
                            try {
                              const { data, error } = await supabase.storage
                                .from("organization_files")
                                .createSignedUrl(file.storage_path, 60) // 60 seconds expiry
                              if (error) throw error
                              window.open(data.signedUrl, "_blank")
                            } catch (e) {
                              toast.error("Could not get download link: " + (e as Error).message)
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteFile(file)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {files.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground">Upload your first CSV, XLS, or XLSX file to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
