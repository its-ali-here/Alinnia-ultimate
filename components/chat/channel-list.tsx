"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
// Make sure to import all the necessary actions
import { getChannelsForUserAction, leaveGroupChannelAction, deleteGroupChannelAction } from "@/app/actions/chat"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Hash, MessageSquare, Plus, MoreHorizontal, LogOut, Trash2, Star, BellOff } from "lucide-react"
import { CreateTeamModal } from "./create-team-modal"
import { NewMessageModal } from "./new-message-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type ChannelWithDetails = Awaited<ReturnType<typeof getChannelsForUserAction>>[number];

interface ChannelListProps {
  onSelectChannel: (channelId: string | null) => void;
  activeChannelId: string | null;
}

export function ChannelList({ onSelectChannel, activeChannelId }: ChannelListProps) {
  const { user } = useAuth()
  const [channels, setChannels] = useState<ChannelWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  
  // State for handling actions
  const [channelToAction, setChannelToAction] = useState<ChannelWithDetails | null>(null);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const fetchChannels = useCallback(() => {
    if (user?.id) {
      setIsLoading(true);
      // The updated action now includes an 'is_owner' flag
      getChannelsForUserAction(user.id).then(data => {
        setChannels(data);
      }).finally(() => setIsLoading(false));
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleDmCreated = (newChannelId: string) => {
    fetchChannels();
    onSelectChannel(newChannelId);
  };

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    try {
        await action();
        toast.success(successMessage);
        onSelectChannel(null);
        fetchChannels();
    } catch (error) {
        toast.error((error as Error).message);
    }
  };

  const onLeaveGroup = () => {
    if (!channelToAction || !user) return;
    handleAction(() => leaveGroupChannelAction(channelToAction.id, user.id), "You have left the group.");
    setIsLeaveAlertOpen(false);
  };

  const onDeleteGroup = () => {
    if (!channelToAction || !user) return;
    handleAction(() => deleteGroupChannelAction(channelToAction.id, user.id), "Group deleted successfully.");
    setIsDeleteAlertOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    );
  }
  
  const organizationChannel = channels.find(c => c.type === 'organization');
  const groupChannels = channels.filter(c => c.type === 'group');
  const dmChannels = channels.filter(c => c.type === 'dm');

  const ChannelButton = ({ channel }: { channel: ChannelWithDetails }) => (
    <div className="group relative flex items-center pr-2">
        <Button
            variant={activeChannelId === channel.id ? "secondary" : "ghost"}
            className="w-full h-9 justify-start gap-2 px-2"
            onClick={() => onSelectChannel(channel.id)}
        >
            {channel.type === 'dm' ? (
                <Avatar className="h-5 w-5"><AvatarImage src={channel.other_member_avatar_url || ''} /><AvatarFallback>{channel.name?.charAt(0) || '?'}</AvatarFallback></Avatar>
            ) : (
                <Hash className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="truncate flex-1 text-left">{channel.name || 'Direct Message'}</span>
        </Button>
        {/* Only show the menu for groups and DMs */}
        {channel.type !== 'organization' && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toast.info("Pinning feature coming soon!")}><Star className="mr-2 h-4 w-4"/> Pin</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Mute feature coming soon!")}><BellOff className="mr-2 h-4 w-4"/> Mute</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {channel.type === 'group' && !channel.is_owner && (
                        <DropdownMenuItem className="text-red-500" onClick={() => { setChannelToAction(channel); setIsLeaveAlertOpen(true); }}>
                            <LogOut className="mr-2 h-4 w-4"/> Leave Group
                        </DropdownMenuItem>
                    )}
                    {channel.type === 'group' && channel.is_owner && (
                        <DropdownMenuItem className="text-red-500" onClick={() => { setChannelToAction(channel); setIsDeleteAlertOpen(true); }}>
                            <Trash2 className="mr-2 h-4 w-4"/> Delete Group
                        </DropdownMenuItem>
                    )}
                    {channel.type === 'dm' && (
                        <DropdownMenuItem className="text-red-500" onClick={() => toast.info("Hiding DMs coming soon!")}>
                            <Trash2 className="mr-2 h-4 w-4"/> Hide Chat
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )}
    </div>
  );

  return (
    <>
      <div className="p-2 space-y-2">
        {organizationChannel && <ChannelButton channel={organizationChannel} />}

        <Accordion type="multiple" defaultValue={['teams', 'dms']} className="w-full">
          <AccordionItem value="teams" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Teams</div>
            </AccordionTrigger>
            <AccordionContent className="p-0 pl-4 space-y-1">
              {groupChannels.map(channel => <ChannelButton key={channel.id} channel={channel} />)}
              <Button onClick={() => setIsCreateTeamModalOpen(true)} variant="ghost" className="w-full justify-start gap-2 text-muted-foreground"><Plus className="h-4 w-4" /> Create Team</Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="dms" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Direct Messages</div>
            </AccordionTrigger>
            <AccordionContent className="p-0 pl-4 space-y-1">
              {dmChannels.map(channel => <ChannelButton key={channel.id} channel={channel} />)}
              <Button onClick={() => setIsNewMessageModalOpen(true)} variant="ghost" className="w-full justify-start gap-2 text-muted-foreground"><Plus className="h-4 w-4" /> New Message</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <CreateTeamModal isOpen={isCreateTeamModalOpen} onOpenChange={setIsCreateTeamModalOpen} onTeamCreated={fetchChannels} />
      <NewMessageModal isOpen={isNewMessageModalOpen} onOpenChange={setIsNewMessageModalOpen} onDmCreated={handleDmCreated} />

      <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure you want to leave "{channelToAction?.name}"?</AlertDialogTitle><AlertDialogDescription>You will need to be re-invited to rejoin this group.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onLeaveGroup}>Leave</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the "{channelToAction?.name}" group and all of its messages for everyone. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Group</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  )
}