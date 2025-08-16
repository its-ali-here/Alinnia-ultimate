"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useDataSources } from '@/hooks/use-data-sources'
import { createDashboardAction } from '@/app/actions/analytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CreateDashboardDialogProps {
  onDashboardCreated: () => void
}

export function CreateDashboardDialog({ onDashboardCreated }: CreateDashboardDialogProps) {
  const { user, organization } = useAuth()
  const { dataSources, loading: dataSourcesLoading } = useDataSources()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [selectedGoogleSheets, setSelectedGoogleSheets] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Filter data sources by type and status
  const csvDataSources = dataSources.filter(ds => ds.source === 'CSV' && ds.status === 'ready')
  const googleSheetsDataSources = dataSources.filter(ds => ds.source === 'Google Sheets')

  console.log('Data sources in create dialog:', {
    total: dataSources.length,
    csv: csvDataSources.length,
    googleSheets: googleSheetsDataSources.length,
    loading: dataSourcesLoading
  })

  const handleDataSourceToggle = (dataSourceId: string, isGoogleSheet: boolean) => {
    if (isGoogleSheet) {
      setSelectedGoogleSheets(prev => 
        prev.includes(dataSourceId) 
          ? prev.filter(id => id !== dataSourceId)
          : [...prev, dataSourceId]
      )
    } else {
      setSelectedDataSources(prev => 
        prev.includes(dataSourceId) 
          ? prev.filter(id => id !== dataSourceId)
          : [...prev, dataSourceId]
      )
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Dashboard name is required.")
      return
    }

    if (selectedDataSources.length === 0 && selectedGoogleSheets.length === 0) {
      toast.error("Please select at least one data source.")
      return
    }

    if (selectedDataSources.length === 0) {
      toast.error("Please select at least one CSV data source as the primary source.")
      return
    }

    if (!organization?.id || !user?.id) {
      toast.error("Organization or user information is missing.")
      return
    }

    setIsCreating(true)
    try {
      console.log('Creating dashboard with:', {
        name,
        description,
        datasourceIds: selectedDataSources,
        googleSheetsIds: selectedGoogleSheets,
        organizationId: organization.id,
        userId: user.id,
      })

      const result = await createDashboardAction({
        name,
        description,
        datasourceIds: selectedDataSources,
        googleSheetsIds: selectedGoogleSheets,
        organizationId: organization.id,
        userId: user.id,
      })

      console.log('Dashboard creation result:', result)

      if (result.error) throw new Error(result.error)

      toast.success(`Dashboard "${name}" created successfully!`)
      onDashboardCreated()
      setIsOpen(false)

      // Reset form
      setName("")
      setDescription("")
      setSelectedDataSources([])
      setSelectedGoogleSheets([])
    } catch (error) {
      console.error('Dashboard creation error:', error)
      toast.error((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'CSV':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'Google Sheets':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const totalSelected = selectedDataSources.length + selectedGoogleSheets.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Create a dashboard by selecting CSV files (required) and Google Sheets (optional). You need at least one CSV file as the primary data source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name *</Label>
              <Input
                id="dashboard-name"
                placeholder="e.g., Sales Performance, Monthly Revenue"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
                placeholder="Describe what this dashboard will show..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Data Source Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Data Sources *</Label>
              <p className="text-sm text-muted-foreground">
                Choose the files you want to include in this dashboard ({totalSelected} selected)
              </p>
            </div>

            {dataSourcesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading data sources...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* CSV Data Sources */}
                {csvDataSources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">CSV Files</h4>
                    <div className="space-y-2">
                      {csvDataSources.map((dataSource) => (
                        <Card 
                          key={dataSource.id} 
                          className={`cursor-pointer transition-colors ${
                            selectedDataSources.includes(dataSource.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleDataSourceToggle(dataSource.id, false)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                checked={selectedDataSources.includes(dataSource.id)}
                                onChange={() => {}} // Handled by card click
                              />
                              {getSourceIcon(dataSource.source)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{dataSource.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {dataSource.rowCount?.toLocaleString() || 0} rows • {dataSource.size}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Sheets Data Sources */}
                {googleSheetsDataSources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Google Sheets</h4>
                    <div className="space-y-2">
                      {googleSheetsDataSources.map((dataSource) => (
                        <Card 
                          key={dataSource.id} 
                          className={`cursor-pointer transition-colors ${
                            selectedGoogleSheets.includes(dataSource.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleDataSourceToggle(dataSource.id, true)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                checked={selectedGoogleSheets.includes(dataSource.id)}
                                onChange={() => {}} // Handled by card click
                              />
                              {getSourceIcon(dataSource.source)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{dataSource.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Modified {new Date(dataSource.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data Sources Available */}
                {csvDataSources.length === 0 && googleSheetsDataSources.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No data sources available. Upload CSV files or connect Google Sheets first.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating || !name.trim() || totalSelected === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Dashboard'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
