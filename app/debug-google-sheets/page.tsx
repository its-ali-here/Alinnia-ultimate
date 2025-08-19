"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'

export default function DebugGoogleSheetsPage() {
  const { organization } = useAuth()
  const { data: session } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})

  const runTest = async (testName: string, url: string) => {
    setTestResults(prev => ({ ...prev, [testName]: { loading: true } }))
    try {
      const response = await fetch(url)
      const data = await response.json()
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          loading: false, 
          success: response.ok, 
          status: response.status,
          data 
        } 
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          loading: false, 
          success: false, 
          error: (error as Error).message 
        } 
      }))
    }
  }

  const runAllTests = async () => {
    if (!organization?.id) return

    setLoading(true)
    
    // Test 1: Check migration status
    await runTest('migration', '/api/check-migration')
    
    // Test 2: Check session
    await runTest('session', '/api/debug-session')
    
    // Test 3: Check data sources
    await runTest('dataSources', `/api/data-sources?organizationId=${organization.id}`)
    
    // Test 4: Test Google Sheets API
    await runTest('googleSheetsAPI', '/api/google-sheets?action=list')
    
    // Test 5: Test Google Sheets integration
    await runTest('integration', `/api/test-google-sheets?organizationId=${organization.id}&action=check`)
    
    setLoading(false)
  }

  const TestResult = ({ testName, result }: { testName: string, result: any }) => {
    if (!result) return null

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{testName}</CardTitle>
            {result.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {result.loading ? (
            <p className="text-sm text-muted-foreground">Running test...</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  Status: {result.status || 'Error'}
                </Badge>
              </div>
              {result.error && (
                <p className="text-sm text-red-600">Error: {result.error}</p>
              )}
              {result.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">View Response</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Google Sheets Integration Debug</h1>
          <p className="text-muted-foreground">
            Debug and test Google Sheets integration functionality
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Organization:</span>
              <Badge variant="outline">{organization?.id || 'Not found'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Session:</span>
              <Badge variant={session ? "default" : "destructive"}>
                {session ? 'Active' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Google Access Token:</span>
              <Badge variant={session?.accessToken ? "default" : "destructive"}>
                {session?.accessToken ? 'Available' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">User Email:</span>
              <span className="text-sm text-muted-foreground">{session?.user?.email || 'Not available'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Run Tests</CardTitle>
            <CardDescription>
              Test all Google Sheets integration components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={loading || !organization?.id}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          
          <TestResult testName="Database Migration" result={testResults.migration} />
          <TestResult testName="Session Status" result={testResults.session} />
          <TestResult testName="Data Sources API" result={testResults.dataSources} />
          <TestResult testName="Google Sheets API" result={testResults.googleSheetsAPI} />
          <TestResult testName="Integration Test" result={testResults.integration} />
        </div>
      </div>
    </div>
  )
}
