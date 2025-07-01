"use client"

import { useState, useCallback, useEffect, type ChangeEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { UploadCloud, Trash2, FileText, RefreshCw, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataSourceFile {
  id: string;
  created_at: string;
  file_name: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  row_count: number | null;
  storage_path: string;
}

export function FileManager() {
  const { user, organization } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dateFormat, setDateFormat] = useState<string>("yyyy-MM-dd"); // State for date format
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<DataSourceFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  const fetchFiles = useCallback(async () => {
    if (!organization?.id || !isSupabaseConfigured()) {
      setIsLoadingFiles(false);
      return;
    }
    setIsLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from("datasources")
        .select('id, file_name, status, row_count, created_at, storage_path')
        .eq('organization_id', organization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      toast.error("Failed to fetch files: " + (error as Error).message);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user || !organization) return;

    setIsUploading(true);
    let datasourceId = ''; 

    try {
      const { data: datasourceRecord, error: dbError } = await supabase
        .from('datasources')
        .insert({
          file_name: selectedFile.name,
          organization_id: organization.id,
          uploaded_by_user_id: user.id,
          status: 'uploading',
          storage_path: 'pending',
          date_format: dateFormat, // Save the selected date format
        })
        .select('id')
        .single();

      if (dbError) throw dbError;
      datasourceId = datasourceRecord.id;

      const filePath = `${organization.id}/${datasourceId}/${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      await supabase
        .from('datasources')
        .update({ storage_path: filePath, status: 'processing' })
        .eq('id', datasourceId);

      const { error: functionError } = await supabase.functions.invoke('process-csv', {
        body: { datasourceId },
      });
      if (functionError) throw functionError;

      toast.success(`"${selectedFile.name}" uploaded. Processing started.`);
      await fetchFiles();

    } catch (error) {
      toast.error(`Upload failed: ${(error as Error).message}`);
      if (datasourceId) {
        await supabase.from('datasources').delete().eq('id', datasourceId);
      }
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDeleteFile = async (file: DataSourceFile) => {
    if (!isSupabaseConfigured()) return;
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) return;

    try {
      const { error: storageError } = await supabase.storage.from("files").remove([file.storage_path]);
      if (storageError) throw storageError;
      
      await supabase.from('datasources').delete().eq('id', file.id);

      toast.success(`"${file.file_name}" deleted successfully.`);
      fetchFiles();
    } catch (error) {
      toast.error("Failed to delete file: " + (error as Error).message)
    }
  };

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
          <CardDescription>Upload CSV files to be processed for analytics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="file-upload-input">CSV File</Label>
                <Input id="file-upload-input" type="file" onChange={handleFileChange} disabled={isUploading} accept=".csv" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-format-select">Date Format in your file</Label>
                 <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format-select">
                        <SelectValue placeholder="Select date format..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (e.g., 2023-12-25)</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (e.g., 12/25/2023)</SelectItem>
                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (e.g., 25/12/2023)</SelectItem>
                        <SelectItem value="MM-dd-yyyy">MM-DD-YYYY (e.g., 12-25-2023)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

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
            <CardTitle>Processed Files</CardTitle>
            <Button variant="outline" size="icon" onClick={fetchFiles} disabled={isLoadingFiles}>
              <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>Manage your organization's processed data sources.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading files...</div>
          ) : !uploadedFiles.length ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No data sources</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a CSV file.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.file_name}</TableCell>
                    <TableCell>
                      <Badge variant={file.status === 'ready' ? 'default' : file.status === 'error' ? 'destructive' : 'secondary'}>
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.row_count?.toLocaleString() ?? '...'}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</TableCell>
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