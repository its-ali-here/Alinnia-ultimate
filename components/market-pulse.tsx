// components/market-pulse.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, TrendingUp, Bot, AlertTriangle } from "lucide-react"

// This defines the structure of the data we expect from our API
interface MarketPulseData {
  sentiment: string;
  indicator: string;
  suggestion: string;
}

export function MarketPulse() {
  const [data, setData] = useState<MarketPulseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The useEffect hook runs once when the component is first loaded.
  // This is the perfect place to fetch data from our backend.
  useEffect(() => {
    const fetchMarketPulse = async () => {
      try {
        const response = await fetch('/api/market-pulse');
        if (!response.ok) {
          throw new Error('Failed to fetch market pulse data.');
        }
        const pulseData: MarketPulseData = await response.json();
        setData(pulseData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketPulse();
  }, []); // The empty array [] means this effect runs only once.

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
        case 'positive':
        case 'optimistic':
            return <Badge variant="default" className="bg-green-500">Optimistic</Badge>;
        case 'negative':
        case 'pessimistic':
            return <Badge variant="destructive">Pessimistic</Badge>;
        default:
            return <Badge variant="secondary">Neutral</Badge>;
    }
  }

  // Show a loading state while we fetch data
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Market Pulse
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-4/5" />
            </CardContent>
        </Card>
    )
  }

  // Show an error message if the fetch fails
  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Market Pulse
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Market Pulse (AI-Powered)
            </div>
            {data && getSentimentBadge(data.sentiment)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h3 className="font-semibold text-sm mb-1 flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-yellow-400"/>Key Indicator</h3>
            <p className="text-muted-foreground text-sm">{data?.indicator}</p>
        </div>
        <div>
            <h3 className="font-semibold text-sm mb-1 flex items-center"><Bot className="h-4 w-4 mr-2 text-blue-400"/>AI Suggestion</h3>
            <p className="text-muted-foreground text-sm">{data?.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  )
}