"use client"

import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle, User, Loader2, PlusCircle, AlertCircle } from "lucide-react"

// Simple markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Simple markdown parsing for basic formatting
  const parseMarkdown = (text: string) => {
    // Split by lines to handle different elements
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-900">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-900">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold mt-4 mb-3 text-gray-900">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 mb-1 list-disc list-inside">
            {formatInlineMarkdown(line.replace(/^[*-] /, ''))}
          </li>
        );
      }
      // Numbered lists
      else if (/^\d+\. /.test(line)) {
        elements.push(
          <li key={index} className="ml-4 mb-1 list-decimal list-inside">
            {formatInlineMarkdown(line.replace(/^\d+\. /, ''))}
          </li>
        );
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<br key={index} />);
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={index} className="mb-2 leading-relaxed">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    });

    return elements;
  };

  // Format inline markdown (bold, italic, code)
  const formatInlineMarkdown = (text: string) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Handle bold text **text**
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return `<strong>${content}</strong>`;
    });

    // Handle italic text *text*
    currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
      return `<em>${content}</em>`;
    });

    // Handle inline code `code`
    currentText = currentText.replace(/`(.*?)`/g, (match, content) => {
      return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${content}</code>`;
    });

    // Return as JSX with dangerouslySetInnerHTML for simple formatting
    return <span dangerouslySetInnerHTML={{ __html: currentText }} />;
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      {parseMarkdown(content)}
    </div>
  );
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AlinniaChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    console.log("New chat started, history cleared.");
  };

  // Custom function to send messages
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending message to API:", userMessage);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.text || "I received your message but couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted. Current input:", input);
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
                <CardTitle>Alinnia Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Your intelligent financial assistant</p>
            </div>
          </div>
           {/* --- FIX 2: "New Chat" button --- */}
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Alinnia</h3>
                  <p className="text-sm">I can help with financial analysis, business insights, strategic planning, and more!</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <MessageCircle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="text-sm">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <MessageCircle className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-red-100">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {error.message || "Something went wrong. Please try again."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Alinnia anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}