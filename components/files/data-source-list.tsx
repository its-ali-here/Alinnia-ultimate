"use client"

import { DataSource } from "@/hooks/use-data-sources"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, FileSpreadsheet, ExternalLink, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface DataSourceListProps {
  dataSources: DataSource[]
  onDelete: (id: string, source: string) => void
  filter?: 'all' | 'CSV' | 'Google Sheets' | 'Excel'
}

export function DataSourceList({ dataSources, onDelete, filter = 'all' }: DataSourceListProps) {
  const filtered = filter === 'all' 
    ? dataSources 
    : dataSources.filter(ds => ds.source === filter)

  const getIcon = (source: string) => {
    if (source === 'CSV') return <FileText className="h-5 w-5 text-blue-600" />
    if (source === 'Google Sheets') return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    // Excel: reuse spreadsheet icon with a different tint
    return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} data sources found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filtered.map((ds) => (
        <div key={ds.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getIcon(ds.source)}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{ds.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(ds.uploadedAt), { addSuffix: true })}</span>
                <span>•</span>
                <span className="font-mono text-xs">{ds.size}</span>
                {ds.rowCount && (
                  <>
                    <span>•</span>
                    <span>{ds.rowCount.toLocaleString()} rows</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(ds.status)}>
              {ds.status}
            </Badge>
            <Badge variant="secondary">
              {ds.source}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ds.source === 'Google Sheets' && ds.metadata?.webViewLink && (
                  <DropdownMenuItem onClick={() => window.open(ds.metadata!.webViewLink, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Google
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(ds.id, ds.source)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
