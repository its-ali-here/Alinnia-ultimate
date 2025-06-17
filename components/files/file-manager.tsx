"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Download, Trash2, Eye, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  uploadDate: Date
  status: "uploading" | "processing" | "ready" | "error"
  progress: number
  rowCount?: number
  columns?: string[]
}

export function FileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const fileId = Math.random().toString(36).substr(2, 9)

      // Add file to state
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        status: "uploading",
        progress: 0,
      }

      setFiles((prev) => [...prev, newFile])

      // Simulate upload progress
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === fileId) {
              const newProgress = Math.min(f.progress + Math.random() * 20, 100)
              if (newProgress >= 100) {
                clearInterval(interval)
                // Simulate processing
                setTimeout(() => {
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.id === fileId
                        ? {
                            ...f,
                            status: "ready",
                            rowCount: Math.floor(Math.random() * 10000) + 100,
                            columns: ["Date", "Amount", "Description", "Category", "Account"],
                          }
                        : f,
                    ),
                  )
                }, 1000)
                return { ...f, status: "processing", progress: 100 }
              }
              return { ...f, progress: newProgress }
            }
            return f
          }),
        )
      }, 200)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: true,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadedFile["status"]) => {
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

  return (
    <div className="space-y-6">
      {/* Upload Area */}
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
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop CSV files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports CSV, XLS, and XLSX files up to 10MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
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
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(file.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(file.status)}
                          {file.status}
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {(file.status === "uploading" || file.status === "processing") && (
                    <Progress value={file.progress} className="mb-2" />
                  )}

                  {file.status === "ready" && file.rowCount && (
                    <div className="text-sm text-muted-foreground mb-3">
                      {file.rowCount.toLocaleString()} rows • {file.columns?.length} columns
                    </div>
                  )}

                  {file.status === "ready" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
