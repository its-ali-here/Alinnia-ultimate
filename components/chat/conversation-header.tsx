// components/chat/conversation-header.tsx

'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pin, Trash2, VolumeX } from "lucide-react";
import { getChannelMembers, type Profile } from "@/lib/database";
import { useAuth } from "@/contexts/auth-context";

// Define the expected shape of the channel data
interface Channel {
  id: string;
  name?: string;
  type: 'dm' | 'group' | 'organization';
  other_member?: Profile;
}

interface ConversationHeaderProps {
  channel: Channel;
}

export const ConversationHeader = ({ channel }: ConversationHeaderProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (channel.type === 'group') {
        setIsLoading(true);
        try {
          const channelMembers = await getChannelMembers(channel.id);
          setMembers(channelMembers);
        } catch (error) {
          console.error("Error fetching channel members:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [channel.id, channel.type]);

  const onPin = () => alert(`Pin action for ${getDisplayName()}`);
  const onMute = () => alert(`Mute action for ${getDisplayName()}`);
  const onClearChat = () => alert(`Clear Chat action for ${getDisplayName()}`);

  const getDisplayName = () => {
    if (channel.type === 'dm') {
      return channel.other_member?.full_name || channel.other_member?.email || 'Direct Message';
    }
    return channel.name || 'Unknown Channel';
  };

  const getDisplayInitial = () => {
    if (channel.type === 'dm') {
      const name = channel.other_member?.full_name || channel.other_member?.email;
      return name?.charAt(0).toUpperCase() || 'D';
    }
    return channel.name?.charAt(0).toUpperCase() || 'C';
  };

  const getMemberNames = () => {
    if (channel.type !== 'group' || isLoading) {
      return '';
    }

    // Filter out the current user and get names
    const otherMembers = members.filter(member => member.id !== user?.id);

    if (otherMembers.length === 0) return '';

    if (otherMembers.length === 1) {
      return otherMembers[0].full_name || otherMembers[0].email || 'Unknown';
    }

    if (otherMembers.length === 2) {
      return `${otherMembers[0].full_name || otherMembers[0].email || 'Unknown'} and ${otherMembers[1].full_name || otherMembers[1].email || 'Unknown'}`;
    }

    // For more than 2 members, show first two and count
    return `${otherMembers[0].full_name || otherMembers[0].email || 'Unknown'}, ${otherMembers[1].full_name || otherMembers[1].email || 'Unknown'} and ${otherMembers.length - 2} other${otherMembers.length - 2 > 1 ? 's' : ''}`;
  };

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getDisplayInitial()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg">{getDisplayName()}</h2>
          {channel.type === 'group' && !isLoading && getMemberNames() && (
            <p className="text-sm text-muted-foreground font-normal mt-0.5">
              {getMemberNames()}
            </p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPin}>
            <Pin className="mr-2 h-4 w-4" />
            <span>Pin</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMute}>
            <VolumeX className="mr-2 h-4 w-4" />
            <span>Mute</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onClearChat} className="text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};