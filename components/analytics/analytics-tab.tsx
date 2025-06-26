// components/analytics/analytics-tab.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getReadyDatasourcesAction, getDashboardsForDatasourceAction } from "@/app/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, LayoutDashboard, Plus, Database } from "lucide-react"

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
}

interface DataSourceWithDashboards {
  id: string;
  file_name: string;
  row_count: number | null;
  dashboards: Dashboard[];
}

export function AnalyticsTab() {
  const { organizationId } = useAuth();
  const [dataSources, setDataSources] = useState<DataSourceWithDashboards[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    const dsResult = await getReadyDatasourcesAction(organizationId);

    if (dsResult.error) {
      toast.error(dsResult.error);
      setIsLoading(false);
      return;
    }

    const sources = dsResult.data || [];
    const sourcesWithDashboards = await Promise.all(
      sources.map(async (source) => {
        const dashResult = await getDashboardsForDatasourceAction(source.id);
        return {
          ...source,
          dashboards: dashResult.data || [],
        };
      })
    );

    setDataSources(sourcesWithDashboards);
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>Our Analytics</CardTitle>
              <CardDescription>
                  Create and manage dashboards from your data sources. Each data source can have multiple dashboards.
              </CardDescription>
          </CardHeader>
      </Card>

      {dataSources.length === 0 ? (
          <Card className="text-center py-12">
               <CardContent>
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Data Sources Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Please upload and process a CSV file in the "Files" section to begin.</p>
              </CardContent>
          </Card>
      ) : (
          dataSources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                          <CardTitle>{source.file_name}</CardTitle>
                          <CardDescription>{source.row_count?.toLocaleString() ?? 0} rows</CardDescription>
                      </div>
                  </div>
                  <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New Dashboard</Button>
              </div>
            </CardHeader>
            <CardContent>
              {source.dashboards.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {source.dashboards.map((dashboard) => (
                    <Link key={dashboard.id} href={`/dashboard/analytics/${dashboard.id}`}>
                       <Card className="hover:border-primary transition-colors">
                           <CardHeader>
                               <CardTitle className="text-base flex items-center gap-2">
                                   <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                   {dashboard.name}
                               </CardTitle>
                           </CardHeader>
                           <CardContent>
                               <p className="text-sm text-muted-foreground line-clamp-2">
                                   {dashboard.description || "No description."}
                               </p>
                           </CardContent>
                       </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                  <p>No dashboards have been created for this data source yet.</p>
                  <Button variant="link" className="mt-2">Create the first one</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}