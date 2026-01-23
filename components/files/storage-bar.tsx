"use client"

import { Progress } from "@/components/ui/progress"
import { HardDrive } from "lucide-react"

interface StorageBarProps {
  used: number
  limit: number
  percentage: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function StorageBar({ used, limit, percentage }: StorageBarProps) {
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-primary'
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Storage</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatBytes(used)} / {formatBytes(limit)}
        </span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={getColorClass()} />
      <p className="text-xs text-muted-foreground mt-1">
        {percentage}% used • {formatBytes(limit - used)} remaining
      </p>
    </div>
  )
}
