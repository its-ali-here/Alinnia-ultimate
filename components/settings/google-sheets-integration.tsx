"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GoogleSheetsIntegration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Sheets</CardTitle>
        <CardDescription>
          Connect your Google Sheets account to sync your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Connect Google Sheets</Button>
      </CardContent>
    </Card>
  )
}
