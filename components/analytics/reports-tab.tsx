"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUploadedFilesForOrganization, type UploadedFile as DbUploadedFile } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Printer, FileText, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { isSupabaseConfigured } from "@/lib/supabase"

const reportTypes = [
  // These can be dynamic based on file content or predefined
  "Financial Summary",
  "Data Overview",
  // Add more report types here
]

export function ReportsTab() {
  const { organizationId } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<DbUploadedFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>("")
  const [selectedReportType, setSelectedReportType] = useState(reportTypes[0])
  const [reportData, setReportData] = useState<Array<{ id: number; metric: string; value: string }>>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const fetchFiles = useCallback(async () => {
    if (!organizationId || !isSupabaseConfigured()) {
      setIsLoadingFiles(false)
      return
    }
    try {
      setIsLoadingFiles(true)
      const files = await getUploadedFilesForOrganization(organizationId)
      setUploadedFiles(files.filter((f) => f.status === "ready")) // Only show 'ready' files
    } catch (error) {
      toast.error("Failed to fetch uploaded files: " + (error as Error).message)
    } finally {
      setIsLoadingFiles(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleGenerateReport = async () => {
    if (!selectedFileId) {
      toast.error("Please select a file to generate a report.")
      return
    }
    setIsGeneratingReport(true)
    setReportData([]) // Clear previous report data

    const selectedFile = uploadedFiles.find((f) => f.id === selectedFileId)
    if (!selectedFile) {
      toast.error("Selected file not found.")
      setIsGeneratingReport(false)
      return
    }

    toast.info(`Generating "${selectedReportType}" report for "${selectedFile.file_name}"... (Placeholder)`)

    // Placeholder: Simulate report generation
    // In a real app, fetch the file from storage, parse CSV, and generate data
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const dummyData = [
      { id: 1, metric: "File Name", value: selectedFile.file_name },
      { id: 2, metric: "Total Rows (from metadata)", value: selectedFile.row_count?.toLocaleString() || "N/A" },
      {
        id: 3,
        metric: "Total Columns (from metadata)",
        value: selectedFile.column_headers?.length.toString() || "N/A",
      },
      { id: 4, metric: "Report Type", value: selectedReportType },
      { id: 5, metric: "Generated At", value: new Date().toLocaleString() },
    ]
    setReportData(dummyData)
    setIsGeneratingReport(false)
    toast.success("Report generated (placeholder data).")
  }

  const handleDownloadReport = () => {
    if (reportData.length === 0) {
      toast.error("No report data to download. Please generate a report first.")
      return
    }
    toast.info(`Downloading ${selectedReportType} report... (Not implemented)`)
  }

  const handlePrintReport = () => {
    if (reportData.length === 0) {
      toast.error("No report data to print. Please generate a report first.")
      return
    }
    toast.info(`Printing ${selectedReportType} report... (Not implemented)`)
    // window.print() could be used for basic printing
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports Unavailable</CardTitle>
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
          <CardTitle className="text-xl font-semibold">Configure Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
          <div className="flex-grow space-y-1.5">
            <label htmlFor="file-select" className="text-sm font-medium">
              Select Data File
            </label>
            {isLoadingFiles ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading files...
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="flex items-center text-muted-foreground">
                <AlertTriangle className="mr-2 h-4 w-4" />
                No 'ready' files available. Upload and process files in the Files section.
              </div>
            ) : (
              <Select value={selectedFileId} onValueChange={setSelectedFileId} disabled={uploadedFiles.length === 0}>
                <SelectTrigger id="file-select" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a processed file" />
                </SelectTrigger>
                <SelectContent>
                  {uploadedFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.file_name} ({file.row_count ? `${file.row_count} rows` : "N/A rows"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex-grow space-y-1.5">
            <label htmlFor="report-type-select" className="text-sm font-medium">
              Report Type
            </label>
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger id="report-type-select" className="w-full md:w-[240px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateReport} disabled={!selectedFileId || isGeneratingReport || isLoadingFiles}>
            {isGeneratingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {selectedReportType} for {uploadedFiles.find((f) => f.id === selectedFileId)?.file_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.metric}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrintReport}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {reportData.length === 0 && !isGeneratingReport && selectedFileId && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Not Generated</h3>
            <p className="text-muted-foreground">Click "Generate Report" to see data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
