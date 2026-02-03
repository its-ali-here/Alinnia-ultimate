"use client"

import { ReactNode, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit, Wand2, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface WidgetWrapperProps {
  children: ReactNode;
  widgetConfig: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function WidgetWrapper({ children, widgetConfig, onEdit, onDelete }: WidgetWrapperProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setInsight(null);
    try {
      const res = await fetch('/api/ai/analyze-widget', {
        method: 'POST',
        body: JSON.stringify({
            widgetConfig: widgetConfig,
            datasourceId: widgetConfig.datasourceId
        })
      });
      const data = await res.json();
      if (data.insight) {
        setInsight(data.insight);
      } else {
        throw new Error("No insight generated");
      }
    } catch (e) {
      toast.error("Could not analyze data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col relative group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium truncate pr-8" title={widgetConfig.title}>
          {widgetConfig.title}
        </CardTitle>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* AI Analysis Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50" 
                onClick={handleAnalyze}
                title="Get AI Insight"
            >
                <Wand2 className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-4 pt-0">
        {children}
      </CardContent>

      {/* AI Insight Overlay/Footer */}
      {(isAnalyzing || insight) && (
        <div className="bg-indigo-50/90 backdrop-blur-sm p-3 border-t border-indigo-100 text-xs animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2">
                    <Wand2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                    {isAnalyzing ? (
                        <div className="space-y-1 w-full">
                            <Skeleton className="h-3 w-40 bg-indigo-200" />
                            <Skeleton className="h-3 w-32 bg-indigo-200" />
                        </div>
                    ) : (
                        <p className="text-indigo-900 leading-relaxed">{insight}</p>
                    )}
                </div>
                {!isAnalyzing && (
                    <Button variant="ghost" size="icon" className="h-4 w-4 text-indigo-400 hover:text-indigo-700" onClick={() => setInsight(null)}>
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
      )}
    </Card>
  );
}