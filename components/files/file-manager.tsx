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
function formatBytes(bytes: number | null | undefined, decimals = 2) {
  if (!bytes) return '0 Bytes'; // Handles null, undefined, and 0
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

  // In components/files/file-manager.tsx

const handleFileUpload = async () => {
  if (!selectedFile || !user || !organizationId || !isSupabaseConfigured()) {
    toast.error("Cannot upload file. Please check if you are logged in and a file is selected.");
    return;
  }

  setIsUploading(true);
  let datasourceId = ''; // Variable to hold the ID of our new datasource record

  try {
    // Step 1: Create a record in our new 'datasources' table.
    const { data: datasourceRecord, error: dbError } = await supabase
      .from('datasources')
      .insert({
        file_name: selectedFile.name,
        organization_id: organizationId,
        uploaded_by_user_id: user.id,
        status: 'uploading',
        // We don't know the storage path yet, so we use a temporary placeholder
        storage_path: 'pending' 
      })
      .select('id')
      .single();

    if (dbError) throw dbError;
    datasourceId = datasourceRecord.id;

    // Step 2: Define the actual storage path using the new ID for a clean structure.
    const filePath = `${organizationId}/${datasourceId}/${selectedFile.name}`;

    // Step 3: Upload the file to Supabase Storage.
    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false, // It's a new file, so we don't need to upsert.
      });

    if (uploadError) throw uploadError;

    // Step 4: Update our datasource record with the final storage path and set status to 'processing'.
    await supabase
      .from('datasources')
      .update({ storage_path: filePath, status: 'processing' })
      .eq('id', datasourceId);

    // Step 5: Invoke the Edge Function to process the file in the background.
    const { error: functionError } = await supabase.functions.invoke('process-csv', {
      body: { datasourceId },
    })
    if (functionError) throw functionError;
    
    toast.success(`"${selectedFile.name}" uploaded. Processing has started.`);
    fetchFiles(); // This will now show the file with its 'processing' status

  } catch (error) {
    toast.error(`Upload failed: ${(error as Error).message}`);
    // If something failed, clean up the record in the datasources table.
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
                    <TableCell>
                    {file.metadata?.lastModified 
                      ? formatDistanceToNow(new Date(file.metadata.lastModified), { addSuffix: true }) 
                      : 'N/A'}
                    </TableCell>
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