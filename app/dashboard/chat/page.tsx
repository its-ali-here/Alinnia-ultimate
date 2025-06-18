import { AlinniaChatInterface } from "@/components/ai/alinnia-chat-interface"

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">AI Assistant</h1>
        <p className="text-muted-foreground">Chat with Alinnia AI for financial insights and assistance</p>
      </div>
      <div className="flex-1">
        <AlinniaChatInterface />
      </div>
    </div>
  )
}
