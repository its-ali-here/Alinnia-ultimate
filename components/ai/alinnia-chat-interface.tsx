"use client"

import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle, User, Loader2, PlusCircle, LayoutDashboard } from "lucide-react"
import { ChartWidget } from "@/components/analytics/widgets/chart-widget"
import { SingleValueWidget } from "@/components/analytics/widgets/single-value-widget"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  widgetConfig?: any;
  timestamp: Date;
}

export function AlinniaChatInterface() {
  const { user, organizationId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the Save Dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [widgetToSave, setWidgetToSave] = useState<any>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          organizationId: organizationId 
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        widgetConfig: data.widgetConfig,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSaveDialog = (config: any) => {
    setWidgetToSave(config);
    setIsSaveDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col shadow-none border-0 sm:border">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-base">Alinnia Analyst</CardTitle>
                    <p className="text-xs text-muted-foreground">Powered by Alinnia Intelligence</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="New Chat">
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center space-y-4 py-12">
                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">How can I help you analyze data?</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try asking:</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => { setInput("Show me total revenue by month"); }} className="text-xs">"Show total revenue by month"</Button>
                        <Button variant="outline" size="sm" onClick={() => { setInput("What are the top selling products?"); }} className="text-xs">"Top selling products"</Button>
                    </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarFallback className={msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                        {msg.content}
                    </div>

                    {msg.widgetConfig && (
                        <div className="w-full bg-background border rounded-xl p-2 shadow-sm mt-1 overflow-hidden group relative">
                            {/* The Widget */}
                            <div className="h-[300px]">
                                {msg.widgetConfig.widgetType === 'summary-card' ? (
                                    <SingleValueWidget 
                                        widgetConfig={{ title: msg.widgetConfig.title, query: msg.widgetConfig.query }} 
                                        datasourceId={msg.widgetConfig.datasourceId} 
                                        filters={{}} 
                                    />
                                ) : (
                                    <ChartWidget 
                                        widgetConfig={{
                                            title: msg.widgetConfig.title,
                                            chartType: msg.widgetConfig.chartType,
                                            query: msg.widgetConfig.query
                                        }} 
                                        datasourceId={msg.widgetConfig.datasourceId} 
                                        filters={{}} 
                                    />
                                )}
                            </div>

                            {/* The Pin Button (Appears on Hover or always visible) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="sm" 
                                    className="h-8 text-xs shadow-md" 
                                    onClick={() => handleOpenSaveDialog(msg.widgetConfig)}
                                >
                                    <LayoutDashboard className="w-3 h-3 mr-2" />
                                    Pin to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                    <Avatar className="h-8 w-8 mt-1 border"><AvatarFallback className="bg-muted"><MessageCircle className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs text-muted-foreground">Analyzing your data...</span>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-background border-t">
            <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask questions about your data..." 
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}