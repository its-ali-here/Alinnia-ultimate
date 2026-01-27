"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createDashboardAction } from '@/app/actions/analytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface CreateDashboardDialogProps {
  onDashboardCreated: () => void
}

export function CreateDashboardDialog({ onDashboardCreated }: CreateDashboardDialogProps) {
  const { user, organizationId } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Dashboard name is required.")
      return
    }

    if (!organizationId || !user?.id) {
      toast.error("Session error. Please refresh the page.")
      return
    }

    setIsCreating(true)
    try {
      const result = await createDashboardAction({
        name,
        description,
        organizationId: organizationId,
        userId: user.id,
      })

      if (result.error) throw new Error(result.error)

      toast.success(`Dashboard "${name}" created successfully!`)
      onDashboardCreated()
      setIsOpen(false)

      // Reset form
      setName("")
      setDescription("")
    } catch (error) {
      console.error('Dashboard creation error:', error)
      toast.error((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Give your new dashboard a name and an optional description. You can add charts and widgets to it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating || !name.trim()}
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
