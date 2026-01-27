"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getAllDashboardsAction } from "@/app/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { LayoutDashboard, FileText, Calendar, RefreshCw } from "lucide-react"
import { CreateDashboardDialog } from "./create-dashboard-dialog"
import { EditDashboardDialog } from "./edit-dashboard-dialog"

// Updated type definition
interface Dashboard {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    datasource: {
        id: string;
        file_name: string;
        status: string;
    } | null;
}

function DashboardCard({ dashboard, onDashboardUpdated }: { dashboard: Dashboard; onDashboardUpdated: () => void }) {
    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    </div>
                </div>
                {dashboard.description && (
                    <CardDescription className="text-sm pt-1">
                        {dashboard.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                    {/* Data Sources Summary */}
                    <div className="space-y-2 min-h-[24px]">
                        {dashboard.datasource && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="truncate" title={dashboard.datasource.file_name}>
                                    Primary: {dashboard.datasource.file_name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/analytics/${dashboard.id}`}>
                            Open Dashboard
                        </Link>
                    </Button>
                    <EditDashboardDialog
                        dashboard={dashboard}
                        onDashboardUpdated={onDashboardUpdated}
                        onDashboardDeleted={onDashboardUpdated}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export function AnalyticsTab() {
    const { organizationId } = useAuth();
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDashboards = useCallback(async () => {
        if (!organizationId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const result = await getAllDashboardsAction(organizationId);

            if (result.error) {
                toast.error(result.error);
                setDashboards([]);
            } else {
                // The data from the action should now match the updated Dashboard type
                setDashboards(result.data as Dashboard[] || []);
            }
        } catch (error) {
            toast.error("Failed to load dashboards");
            setDashboards([]);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        loadDashboards();
    }, [loadDashboards]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">My Dashboards</h2>
                        <p className="text-muted-foreground">Create and manage your analytics dashboards</p>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">My Dashboards</h2>
                    <p className="text-muted-foreground">
                        Create and manage your analytics dashboards.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadDashboards}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <CreateDashboardDialog onDashboardCreated={loadDashboards} />
                </div>
            </div>

            {/* Dashboard Grid */}
            {dashboards.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[40vh]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No Dashboards Yet</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        Create your first dashboard to get started.
                    </p>
                    <CreateDashboardDialog onDashboardCreated={loadDashboards} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboards.map((dashboard) => (
                        <DashboardCard
                            key={dashboard.id}
                            dashboard={dashboard}
                            onDashboardUpdated={loadDashboards}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}