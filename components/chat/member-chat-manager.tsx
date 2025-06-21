"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChannelList } from "./channel-list" // Import the new component

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
          {/* Replace the placeholder with the actual component */}
          <ChannelList 
            onSelectChannel={setActiveChannelId} 
            activeChannelId={activeChannelId}
          />
        </CardContent>
      </div>

      {/* Right Panel: Conversation View */}
      <div>
        {/* This is still a placeholder, we will build it next */}
        <div className="p-4 h-full flex items-center justify-center text-muted-foreground">
          {activeChannelId ? (
            <p>Conversation view for {activeChannelId} will be here.</p>
          ) : (
            <p>Select a conversation to start chatting.</p>
          )}
        </div>
      </div>
    </Card>
  )
}