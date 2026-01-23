"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GoogleSheetsSync() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Sheets Sync</CardTitle>
        <CardDescription>
          Sync your data with Google Sheets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Sync Now</Button>
      </CardContent>
    </Card>
  )
}
