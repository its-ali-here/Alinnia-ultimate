"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { getMessagesForChannel, sendMessage, type Message } from "@/lib/database"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface ConversationViewProps {
  channelId: string | null;
}

export function ConversationView({ channelId }: ConversationViewProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  // This useEffect hook runs whenever the selected channelId changes
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    // 1. Fetch the initial message history
    const fetchMessages = async () => {
      setIsLoading(true)
      const data = await getMessagesForChannel(channelId)
      setMessages(data)
      setIsLoading(false)
      // Use a timeout to ensure the DOM has updated before scrolling
      setTimeout(scrollToBottom, 0)
    }
    fetchMessages()

    // 2. Set up the Realtime Subscription
    const subscription = supabase
      .channel(`messages_for_${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          // When a new message arrives, add it to our state
          const newMessage = payload.new as Message
          setMessages((currentMessages) => [...currentMessages, newMessage])
        }
      )
      .subscribe()

    // 3. Cleanup: Unsubscribe when the component unmounts or the channelId changes
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [channelId])

  // Automatically scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !channelId) return

    await sendMessage(channelId, user.id, newMessage)
    setNewMessage("")
  }
  
  // Display a prompt if no channel is selected
  if (!channelId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <MessageCircle className="h-12 w-12 mb-4" />
        <p>Select a conversation to start chatting.</p>
      </div>
    )
  }

  // Display a loading skeleton while fetching initial messages
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-12 w-1/2 self-end" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
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
          ))}
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
          <Button type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}