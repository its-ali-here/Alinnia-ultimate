"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOrganizationMembers, type Profile } from "@/lib/database"
import { createGroupChannelAction } from "@/app/actions/chat"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreateTeamModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTeamCreated: () => void;
}

export function CreateTeamModal({ isOpen, onOpenChange, onTeamCreated }: CreateTeamModalProps) {
  const { user, organizationId } = useAuth()
  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState<Profile[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && organizationId) {
      // Fetch organization members when the modal opens
      getOrganizationMembers(organizationId).then(data => {
        // Exclude the current user from the list of members to select
        setMembers(data.filter(m => m.profiles.id !== user?.id).map(m => m.profiles))
      })
      // Reset state when opening
      setSelectedMemberIds(new Set(user ? [user.id] : []));
      setTeamName("");
    }
  }, [isOpen, organizationId, user])

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name.")
      return
    }
    if (!user || !organizationId) {
      toast.error("Authentication error. Please refresh the page.")
      return
    }

    setIsLoading(true)
    try {
      await createGroupChannelAction({
        organizationId,
        creatorId: user.id,
        name: teamName,
        memberIds: Array.from(selectedMemberIds),
      });
      toast.success(`Team "${teamName}" created successfully!`)
      onTeamCreated(); // This will tell the parent to refresh the channel list
      onOpenChange(false); // Close the modal
    } catch (error) {
      toast.error(`Failed to create team: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription>
            Give your team a name and select members to invite.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input id="name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., Marketing Squad" />
          </div>
          <div className="space-y-2">
            <Label>Select Members</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMemberIds.has(member.id)}
                      onCheckedChange={() => handleMemberSelect(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || ''} />
                      <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <label htmlFor={`member-${member.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {member.full_name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleCreateTeam} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}