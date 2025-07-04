// components/chat/conversation-header.tsx

'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pin, Trash2, VolumeX } from "lucide-react";

// Define the expected shape of the channel data
interface Channel {
  id: string; // Add id for keying if needed
  name: string;
}

interface ConversationHeaderProps {
  channel: Channel;
}

// --- FIX: Add the 'export' keyword to the component definition ---
export const ConversationHeader = ({ channel }: ConversationHeaderProps) => {
  const onPin = () => alert(`Pin action for ${channel.name}`);
  const onMute = () => alert(`Mute action for ${channel.name}`);
  const onClearChat = () => alert(`Clear Chat action for ${channel.name}`);

  // This component now correctly assumes 'channel' will not be null
  // The parent component is responsible for ensuring this.
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {channel.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg">{channel.name}</h2>
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