"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, File, Sheet, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { type DataSource } from "@/hooks/use-data-sources"
import { Badge } from "@/components/ui/badge"

interface DataSourceListProps {
  dataSources: DataSource[]
  onDelete: (id: string, source: 'CSV' | 'Google Sheets') => void
}

const SourceIcon = ({ source }: { source: 'CSV' | 'Google Sheets' }) => {
  if (source === 'Google Sheets') {
    return <Sheet className="h-4 w-4 text-green-500" />
  }
  return <File className="h-4 w-4 text-blue-500" />
}

const StatusBadge = ({ status }: { status: DataSource['status'] }) => {
  switch (status) {
    case 'ready':
      return <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>
    case 'processing':
      return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"><Clock className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>
    case 'error':
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function DataSourceList({ dataSources, onDelete }: DataSourceListProps) {
  if (dataSources.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No data sources found</h3>
        <p className="text-sm text-muted-foreground">Upload a CSV or connect Google Sheets to get started.</p>
      </div>
    )
  }
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataSources.map((ds) => (
            <TableRow key={ds.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <SourceIcon source={ds.source} />
                {ds.name}
              </TableCell>
              <TableCell>{ds.source}</TableCell>
              <TableCell>{ds.size}</TableCell>
              <TableCell>{new Date(ds.uploadedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusBadge status={ds.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {ds.source === 'Google Sheets' && ds.metadata?.webViewLink && (
                       <DropdownMenuItem asChild>
                         <a href={ds.metadata.webViewLink} target="_blank" rel="noopener noreferrer">View in Google</a>
                       </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(ds.id, ds.source)} className="text-red-500">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}