"use client"

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

export function AlinniaChatButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      title="Summon AlinBot"
      className="flex items-center gap-2"
      onClick={onClick}
    >
      <Bot className="h-5 w-5" />
      <span className="sr-only">Open AI Chat</span>
    </Button>
  )
}