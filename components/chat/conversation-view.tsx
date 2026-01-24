"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
// --- FIX: Correctly import all necessary functions and types ---
import { getMessagesForChannel, sendMessage, type Message, type OrganizationUser } from "@/lib/database"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { toast } from "sonner"
import { ConversationHeader } from "./conversation-header";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface ConversationViewProps {
  channelId: string | null;
}

type Channel = {
  id: string;
  name?: string;
  type: 'dm' | 'group' | 'organization';
  other_member?: OrganizationUser;
};

export function ConversationView({ channelId }: ConversationViewProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (!channelId || !user) {
      setMessages([]);
      setActiveChannel(null);
      return;
    }
    const { organizationId } = user;

    const loadConversation = async () => {
      setIsLoading(true);
      console.log("Loading conversation for channel:", channelId);

      try {
        // Fetch channel data with additional info for DMs
        const { data: channelData, error: channelError } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .single();

        if (channelError) {
          console.error("Error fetching channel data:", channelError);
        } else {
          console.log("Channel data fetched:", channelData);

          // If it's a DM, fetch the other member's info
          if (channelData.type === 'dm' && user) {
            const { data: memberIds } = await supabase
              .from('channel_members')
              .select('user_id')
              .eq('channel_id', channelId)
              .neq('user_id', user.id);

            if (memberIds && memberIds.length > 0) {
              const { data: profile } = await supabase
                .from('organization_users')
                .select('*')
                .eq('user_id', memberIds[0].user_id)
                .eq('organization_id', organizationId)
                .single();

              setActiveChannel({
                ...channelData,
                other_member: profile
              });
            } else {
              setActiveChannel(channelData);
            }
          } else {
            setActiveChannel(channelData);
          }
        }

        console.log("Fetching messages for channel:", channelId);
        const messagesData = await getMessagesForChannel(channelId, organizationId);
        console.log("Messages received in component:", messagesData);
        setMessages(messagesData);

        setIsLoading(false);
        setTimeout(scrollToBottom, 0);
      } catch (error) {
        console.error("Error in loadConversation:", error);
        setIsLoading(false);
      }
    };

    loadConversation();

    console.log("Setting up real-time subscription for channel:", channelId);
    const subscription = supabase
      .channel(`messages_for_${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log("New message received via real-time:", payload.new);

          // Check if we already have this message (to prevent duplicates)
          setMessages((currentMessages) => {
            const messageExists = currentMessages.some(msg => msg.id === payload.new.id);
            if (messageExists) {
              console.log("Message already exists, skipping duplicate");
              return currentMessages;
            }

            // Add the message without author first (will be updated below)
            return [...currentMessages, payload.new as Message];
          });

          // Fetch the author profile for the new message
          const { data: profile } = await supabase
            .from('organization_users')
            .select('id, full_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .eq('organization_id', organizationId)
            .single();

          // Update the message with author info
          setMessages((currentMessages) =>
            currentMessages.map(msg =>
              msg.id === payload.new.id
                ? { ...msg, author: profile || { id: payload.new.user_id, full_name: 'Unknown User', avatar_url: null } }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId, user]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !user || !channelId) return;

      const originalMessage = newMessage;
      setNewMessage("");

      try {
          const sentMessage = await sendMessage(channelId, user.id, originalMessage);
          console.log("Message sent, adding to local state:", sentMessage);

          // Add the message immediately to local state with author info
          const messageWithAuthor = {
            ...sentMessage,
            author: {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email || 'You',
              avatar_url: user.user_metadata?.avatar_url || null
            }
          };

          setMessages((currentMessages) => [...currentMessages, messageWithAuthor]);
          setTimeout(scrollToBottom, 0);
      } catch (error) {
          console.error("Failed to send message:", error);
          toast.error("Failed to send message. Please try again.");
          setNewMessage(originalMessage);
      }
  };
  
  if (!channelId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <MessageCircle className="h-12 w-12 mb-4" />
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
          <Skeleton className="h-[65px] w-full" />
      ) : (
          activeChannel && <ConversationHeader channel={activeChannel} />
      )}
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-1/2 ml-auto" />
              <Skeleton className="h-12 w-2/3" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.user_id === user?.id ? "justify-end" : ""}`}
              >
                {msg.user_id !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.author?.avatar_url || ''} />
                    <AvatarFallback>{msg.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.user_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(msg.created_at), 'p')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}