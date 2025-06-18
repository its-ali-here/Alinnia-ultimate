"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUploadedFilesForOrganization, type UploadedFile as DbUploadedFile } from "@/lib/database"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { parseCsv } from "@/lib/csv-parser"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

// Default data (used if no CSV is selected or if CSV data is unsuitable)
const defaultCustomerSegmentationData = [
  { segment: "High Value", count: 1200 },
  { segment: "Medium Value", count: 5300 },
  { segment: "Low Value", count: 8500 },
  { segment: "At Risk", count: 1700 },
  { segment: "Lost", count: 800 },
]

const defaultRetentionRateData = [
  { month: "Jan", rate: 95 },
  { month: "Feb", rate: 93 },
  { month: "Mar", rate: 94 },
  { month: "Apr", rate: 95 },
  { month: "May", rate: 97 },
  { month: "Jun", rate: 98 },
]

const defaultChannelPerformanceData = [
  { channel: "Direct", acquisitions: 1200, revenue: 50000 },
  { channel: "Organic Search", acquisitions: 2500, revenue: 75000 },
  { channel: "Paid Search", acquisitions: 1800, revenue: 60000 },
  { channel: "Social Media", acquisitions: 1500, revenue: 45000 },
  { channel: "Email", acquisitions: 900, revenue: 30000 },
]

export function AnalyticsTab() {
  const { theme } = useTheme()
  const { organizationId } = useAuth()
  const [timeFrame, setTimeFrame] = useState("last_30_days") // This remains for other charts for now

  const [uploadedFiles, setUploadedFiles] = useState<DbUploadedFile[]>([])
  const [selectedFileIdForSegmentation, setSelectedFileIdForSegmentation] = useState<string>("default")
  const [customerSegmentationData, setCustomerSegmentationData] = useState(defaultCustomerSegmentationData)
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const [isLoadingChartData, setIsLoadingChartData] = useState(false)

  const fetchFiles = useCallback(async () => {
    if (!organizationId || !isSupabaseConfigured()) {
      setIsLoadingFiles(false)
      return
    }
    try {
      setIsLoadingFiles(true)
      const files = await getUploadedFilesForOrganization(organizationId)
      setUploadedFiles(files.filter((f) => f.status === "ready" && f.column_headers && f.row_count && f.row_count > 0))
    } catch (error) {
      toast.error("Failed to fetch uploaded files for analytics: " + (error as Error).message)
    } finally {
      setIsLoadingFiles(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const loadChartDataForSegmentation = useCallback(
    async (fileId: string) => {
      if (fileId === "default") {
        setCustomerSegmentationData(defaultCustomerSegmentationData)
        return
      }
      setIsLoadingChartData(true)
      const selectedFile = uploadedFiles.find((f) => f.id === fileId)
      if (!selectedFile || !isSupabaseConfigured()) {
        toast.error("Selected file not found or Supabase not configured.")
        setCustomerSegmentationData(defaultCustomerSegmentationData)
        setIsLoadingChartData(false)
        return
      }

      try {
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from("organization_files")
          .download(selectedFile.storage_path)

        if (downloadError) throw new Error("Failed to download file for chart: " + downloadError.message)

        const csvText = await downloadData.text()
        const parsedResult = parseCsv(csvText)

        if (parsedResult.error) throw new Error("CSV Parsing error for chart: " + parsedResult.error)

        // Attempt to map data for Customer Segmentation chart
        // EXPECTS columns named 'segment' and 'count'
        if (!parsedResult.headers.includes("segment") || !parsedResult.headers.includes("count")) {
          toast.warn(
            `Selected CSV "${selectedFile.file_name}" does not have the required 'segment' and 'count' columns for this chart. Displaying default data.`,
          )
          setCustomerSegmentationData(defaultCustomerSegmentationData)
        } else {
          const mappedData = parsedResult.rows
            .map((row) => ({
              segment: row.segment,
              count: Number.parseInt(row.count, 10) || 0, // Ensure count is a number
            }))
            .filter((item) => item.segment && !isNaN(item.count)) // Basic validation

          if (mappedData.length === 0) {
            toast.warn(
              `No valid data found in "${selectedFile.file_name}" for segmentation chart after mapping. Displaying default data.`,
            )
            setCustomerSegmentationData(defaultCustomerSegmentationData)
          } else {
            setCustomerSegmentationData(mappedData)
            toast.success(`Customer Segmentation chart updated with data from "${selectedFile.file_name}".`)
          }
        }
      } catch (error) {
        toast.error("Failed to load chart data: " + (error as Error).message)
        setCustomerSegmentationData(defaultCustomerSegmentationData)
      } finally {
        setIsLoadingChartData(false)
      }
    },
    [uploadedFiles],
  )

  useEffect(() => {
    if (selectedFileIdForSegmentation) {
      loadChartDataForSegmentation(selectedFileIdForSegmentation)
    } else {
      setCustomerSegmentationData(defaultCustomerSegmentationData) // Reset to default if no file selected
    }
  }, [selectedFileIdForSegmentation, loadChartDataForSegmentation])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Detailed Analytics</h3>
        {/* Time frame select can remain for other charts or future use */}
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            <SelectItem value="last_12_months">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Segmentation Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <CardTitle className="text-xl font-semibold">Customer Segmentation</CardTitle>
            {isLoadingFiles ? (
              <div className="text-sm text-muted-foreground flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading files...
              </div>
            ) : uploadedFiles.length > 0 ? (
              <Select value={selectedFileIdForSegmentation} onValueChange={setSelectedFileIdForSegmentation}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Use data from CSV..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use Default Data</SelectItem>
                  {uploadedFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.file_name} ({file.row_count} rows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                No suitable CSV files found.
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingChartData ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerSegmentationData}>
                <XAxis dataKey="segment" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Other charts remain with default data for now */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Placeholder for Customer Segmentation if it were in this grid layout */}
        {/* <Card className="col-span-4"> ... </Card> */}

        <Card className="md:col-span-3 lg:col-span-3">
          {" "}
          {/* Adjusted span if segmentation is separate */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Customer Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={defaultRetentionRateData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-4 lg:col-span-4">
          {" "}
          {/* Adjusted span */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defaultChannelPerformanceData}>
                <XAxis dataKey="channel" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="acquisitions" fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
                <Bar yAxisId="right" dataKey="revenue" fill={theme === "dark" ? "#1e40af" : "#3b82f6"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-full md:col-span-3 lg:col-span-3">
        {" "}
        {/* Key Metrics card */}
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Customer Lifetime Value</p>
            <p className="text-2xl font-bold">$1,250</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Promoter Score</p>
            <p className="text-2xl font-bold">72</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Customer Acquisition Cost</p>
            <p className="text-2xl font-bold">$75</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
            <p className="text-2xl font-bold">$120</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
