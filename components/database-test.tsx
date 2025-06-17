"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Users, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DatabaseTest() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results: Record<string, boolean> = {}

    // Test 1: Check if we can connect to Supabase
    try {
      const { data, error } = await supabase.from("permissions").select("count").single()
      results.connection = !error
    } catch {
      results.connection = false
    }

    // Test 2: Check if permissions table has data
    try {
      const { data, error } = await supabase.from("permissions").select("*").limit(1)
      results.permissions = !error && data && data.length > 0
    } catch {
      results.permissions = false
    }

    // Test 3: Check if we can read organizations table
    try {
      const { error } = await supabase.from("organizations").select("id").limit(1)
      results.organizations = !error
    } catch {
      results.organizations = false
    }

    // Test 4: Check if we can read users table
    try {
      const { error } = await supabase.from("users").select("id").limit(1)
      results.users = !error
    } catch {
      results.users = false
    }

    setTestResults(results)
    setTesting(false)
  }

  const tests = [
    { key: "connection", name: "Database Connection", icon: Database },
    { key: "permissions", name: "Permissions Data", icon: CheckCircle },
    { key: "organizations", name: "Organizations Table", icon: Building2 },
    { key: "users", name: "Users Table", icon: Users },
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? "Testing..." : "Run Database Tests"}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            {tests.map((test) => {
              const TestIcon = test.icon
              const passed = testResults[test.key]
              return (
                <div key={test.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TestIcon className="h-4 w-4" />
                    <span className="text-sm">{test.name}</span>
                  </div>
                  {passed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pass
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Fail
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
