"use client"

import React, { useState, useEffect } from 'react'
import { useDataSources } from '@/hooks/use-data-sources'
import { updateDashboardAction, deleteDashboardAction } from '@/app/actions/analytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, Edit, Trash2, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Dashboard {
  id: string
  name: string
  description: string | null
  dataSources: {
    csv: Array<{ id: string; file_name: string; status: string }>
    googleSheets: string[]
  }
}

interface EditDashboardDialogProps {
  dashboard: Dashboard
  onDashboardUpdated: () => void
  onDashboardDeleted: () => void
}

export function EditDashboardDialog({ dashboard, onDashboardUpdated, onDashboardDeleted }: EditDashboardDialogProps) {
  const { dataSources, loading: dataSourcesLoading } = useDataSources()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(dashboard.name)
  const [description, setDescription] = useState(dashboard.description || "")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(
    dashboard.dataSources.csv.map(ds => ds.id)
  )
  const [selectedGoogleSheets, setSelectedGoogleSheets] = useState<string[]>(
    dashboard.dataSources.googleSheets
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form when dashboard changes
  useEffect(() => {
    setName(dashboard.name)
    setDescription(dashboard.description || "")
    setSelectedDataSources(dashboard.dataSources.csv.map(ds => ds.id))
    setSelectedGoogleSheets(dashboard.dataSources.googleSheets)
  }, [dashboard])

  // Filter data sources by type and status
  const csvDataSources = dataSources.filter(ds => ds.source === 'CSV' && ds.status === 'ready')
  const googleSheetsDataSources = dataSources.filter(ds => ds.source === 'Google Sheets')

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

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Dashboard name is required.")
      return
    }

    if (selectedDataSources.length === 0 && selectedGoogleSheets.length === 0) {
      toast.error("Please select at least one data source.")
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateDashboardAction({
        dashboardId: dashboard.id,
        name,
        description,
        datasourceIds: selectedDataSources,
        googleSheetsIds: selectedGoogleSheets,
      })

      if (result.error) throw new Error(result.error)

      toast.success(`Dashboard "${name}" updated successfully!`)
      onDashboardUpdated()
      setIsOpen(false)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteDashboardAction(dashboard.id)

      if (result.error) throw new Error(result.error)

      toast.success(`Dashboard "${dashboard.name}" deleted successfully!`)
      onDashboardDeleted()
      setIsOpen(false)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsDeleting(false)
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
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dashboard</DialogTitle>
          <DialogDescription>
            Update the dashboard name, description, and data sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dashboard-name">Dashboard Name *</Label>
              <Input
                id="edit-dashboard-name"
                placeholder="e.g., Sales Performance, Monthly Revenue"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dashboard-description">Description</Label>
              <Textarea
                id="edit-dashboard-description"
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
          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Dashboard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{dashboard.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating || !name.trim() || totalSelected === 0}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Dashboard'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
