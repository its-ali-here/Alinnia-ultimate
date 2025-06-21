"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getChannelsForUserAction } from "@/app/actions/chat.ts"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Hash, MessageSquare, Plus } from "lucide-react"
import { CreateTeamModal } from "./create-team-modal"
import { NewMessageModal } from "./new-message-modal"

type ChannelWithDetails = Awaited<ReturnType<typeof getChannelsForUserAction>>[number];

interface ChannelListProps {
  onSelectChannel: (channelId: string) => void;
  activeChannelId: string | null;
}

export function ChannelList({ onSelectChannel, activeChannelId }: ChannelListProps) {
  const { user } = useAuth()
  const [channels, setChannels] = useState<ChannelWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const fetchChannels = () => {
    if (user?.id) {
      setIsLoading(true);
      getChannelsForUserAction(user.id).then(data => {
        setChannels(data)
        setIsLoading(false)
      })
    }
  }
  
  useEffect(() => {
    fetchChannels();
  }, [user?.id])

  const handleDmCreated = (newChannelId: string) => {
    fetchChannels();
    onSelectChannel(newChannelId);
  }

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }
  
  const organizationChannel = channels.find(c => c.type === 'organization');
  const groupChannels = channels.filter(c => c.type === 'group');
  const dmChannels = channels.filter(c => c.type === 'dm');

  const ChannelButton = ({ channel }: { channel: ChannelWithDetails }) => (
    <Button
      variant={activeChannelId === channel.id ? "secondary" : "ghost"}
      className="w-full justify-start gap-2 px-2"
      onClick={() => onSelectChannel(channel.id)}
    >
      {channel.type === 'dm' ? (
        <Avatar className="h-5 w-5">
          <AvatarImage src={channel.other_member_avatar_url || ''} />
          <AvatarFallback>{channel.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
      ) : channel.type === 'group' ? (
        <Users className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Hash className="h-5 w-5 text-muted-foreground" />
      )}
      <span className="truncate flex-1 text-left">{channel.name || 'Direct Message'}</span>
    </Button>
  );

  return (
    <>
      <div className="p-2 space-y-2">
        {organizationChannel && <ChannelButton channel={organizationChannel} />}

        <Accordion type="multiple" defaultValue={['teams', 'dms']} className="w-full">
          <AccordionItem value="teams" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Teams
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 pl-4 space-y-1">
              {groupChannels.map(channel => <ChannelButton key={channel.id} channel={channel} />)}
              <Button onClick={() => setIsCreateTeamModalOpen(true)} variant="ghost" className="w-full justify-start gap-2 text-muted-foreground"><Plus className="h-4 w-4" /> Create Team</Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="dms" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Direct Messages
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 pl-4 space-y-1">
              {dmChannels.map(channel => <ChannelButton key={channel.id} channel={channel} />)}
              <Button onClick={() => setIsNewMessageModalOpen(true)} variant="ghost" className="w-full justify-start gap-2 text-muted-foreground"><Plus className="h-4 w-4" /> New Message</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <CreateTeamModal 
        isOpen={isCreateTeamModalOpen}
        onOpenChange={setIsCreateTeamModalOpen}
        onTeamCreated={fetchChannels}
      />
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onOpenChange={setIsNewMessageModalOpen}
        onDmCreated={handleDmCreated}
      />
    </>
  )
}