"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function MicrosoftExcelIntegration() {
  const handleConnect = () => {
    toast.info('Microsoft Excel integration coming soon!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <div>
            <h4 className="font-medium">Microsoft Excel</h4>
            <p className="text-sm text-muted-foreground">
              Import data from Excel files and OneDrive
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Coming Soon
          </Badge>
          <Button size="sm" disabled onClick={handleConnect}>
            Connect
          </Button>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h5 className="text-sm font-medium mb-2">Coming soon features:</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Import data directly from Excel files</li>
          <li>• Connect to OneDrive for cloud access</li>
          <li>• Real-time synchronization with Excel Online</li>
          <li>• Support for .xlsx and .xls formats</li>
        </ul>
      </div>
    </div>
  )
}
