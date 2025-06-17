import { FileManager } from "@/components/files/file-manager"

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground">Upload and manage your CSV data files for analysis and insights.</p>
      </div>

      <FileManager />
    </div>
  )
}
