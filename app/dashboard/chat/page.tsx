import { MemberChatManager } from "@/components/chat/member-chat-manager"

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-8rem)]">
      {/* The h-[calc(100vh-8rem)] class helps the chat interface take up the full screen height */}
      <MemberChatManager />
    </div>
  )
}