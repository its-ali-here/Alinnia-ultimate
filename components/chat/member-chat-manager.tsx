"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChannelList } from "./channel-list"
import { ConversationView } from "./conversation-view" // Import the new component

export function MemberChatManager() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  return (
    <Card className="flex-1 grid grid-cols-[300px_1fr]">
      {/* Left Panel: Channel List */}
      <div className="border-r">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChannelList 
            onSelectChannel={setActiveChannelId} 
            activeChannelId={activeChannelId}
          />
        </CardContent>
      </div>

      {/* Right Panel: Conversation View */}
      {/* Replace the placeholder with the actual component */}
      <div className="flex flex-col h-full">
        <ConversationView channelId={activeChannelId} />
      </div>
    </Card>
  )
}