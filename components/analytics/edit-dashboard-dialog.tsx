"use client"

import React, { useState, useEffect } from 'react'
import { updateDashboardAction, deleteDashboardAction } from '@/app/actions/analytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Dashboard {
  id: string
  name: string
  description: string | null
}

interface EditDashboardDialogProps {
  dashboard: Dashboard
  onDashboardUpdated: () => void
  onDashboardDeleted: () => void
}

export function EditDashboardDialog({ dashboard, onDashboardUpdated, onDashboardDeleted }: EditDashboardDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(dashboard.name)
  const [description, setDescription] = useState(dashboard.description || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form when dashboard prop changes
  useEffect(() => {
    setName(dashboard.name)
    setDescription(dashboard.description || "")
  }, [dashboard])

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Dashboard name is required.")
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateDashboardAction({
        dashboardId: dashboard.id,
        name,
        description,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Dashboard</DialogTitle>
          <DialogDescription>
            Update the dashboard's name and description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dashboard-name">Dashboard Name *</Label>
              <Input
                id="edit-dashboard-name"
                placeholder="e.g., Sales Performance, Monthly Revenue"
                value={name}
                onChange={(e) => setName(e.targe.value)}
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

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the "{dashboard.name}" dashboard and all of its data. This action cannot be undone.
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
                      'Yes, delete dashboard'
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
                disabled={isUpdating || !name.trim()}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
