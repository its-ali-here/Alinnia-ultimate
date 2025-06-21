"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOrganizationMembers, type Profile } from "@/lib/database"
import { getOrCreateDmChannelAction } from "@/app/actions/chat"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface NewMessageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDmCreated: (channelId: string) => void;
}

export function NewMessageModal({ isOpen, onOpenChange, onDmCreated }: NewMessageModalProps) {
  const { user, organizationId } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && organizationId) {
      setIsLoading(true);
      getOrganizationMembers(organizationId).then(data => {
        setMembers(data.filter(m => m.profiles.id !== user?.id).map(m => m.profiles))
        setIsLoading(false)
      })
    }
  }, [isOpen, organizationId, user])

  const handleSelectMember = async (memberId: string) => {
    if (!user || !organizationId) return;
    
    setIsCreating(true);
    try {
      const channel = await getOrCreateDmChannelAction({
        organizationId,
        currentUserId: user.id,
        otherUserId: memberId,
      });
      onDmCreated(channel.id);
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to start chat: ${(error as Error).message}`)
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Select a member to start a direct message conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-[400px] w-full">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <div className="space-y-1">
                    {members.map(member => (
                    <Button
                        key={member.id}
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleSelectMember(member.id)}
                        disabled={isCreating}
                    >
                        <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={member.avatar_url || ''} />
                            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.full_name}
                    </Button>
                    ))}
                </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}