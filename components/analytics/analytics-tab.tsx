"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getReadyDatasourcesAction, getDashboardsForDatasourceAction, createDashboardAction } from "@/app/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, LayoutDashboard, Plus, Database, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Type definitions
interface Dashboard { id: string; name: string; description: string | null; }
interface DataSourceWithDashboards { id: string; file_name: string; row_count: number | null; dashboards: Dashboard[]; }

function NewDashboardDialog({ source, organizationId, userId, onDashboardCreated }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Dashboard name is required.");
            return;
        }
        setIsCreating(true);
        try {
            const result = await createDashboardAction({
                name,
                description,
                datasourceId: source.id,
                organizationId,
                userId,
            });
            if (result.error) throw new Error(result.error);
            toast.success(`Dashboard "${name}" created successfully!`);
            onDashboardCreated();
            setIsOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New Dashboard</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Dashboard for {source.file_name}</DialogTitle>
                    <DialogDescription>Give your new dashboard a name and optional description.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Dashboard Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q2 Sales Insights" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of this dashboard's purpose." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Dashboard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function AnalyticsTab() {
    const { user, organization } = useAuth();
    const [dataSources, setDataSources] = useState<DataSourceWithDashboards[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAnalyticsData = useCallback(async () => {
        if (!organization?.id) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const dsResult = await getReadyDatasourcesAction(organization.id);

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
    }, [organization?.id]);

    useEffect(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Our Analytics</CardTitle>
                    <CardDescription>
                        Create and manage dashboards from your available data sources. Only files with a "ready" status will appear here.
                    </CardDescription>
                </CardHeader>
            </Card>

            {dataSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[40vh]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Database className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No Ready Data Sources Found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        Please go to the "Files" page to upload a CSV or check the status of your existing files.
                    </p>
                    <Link href="/dashboard/files">
                        <Button>Go to Files</Button>
                    </Link>
                </div>
            ) : (
                dataSources.map((source) => (
                    <Card key={source.id}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                    <div>
                                        <CardTitle>{source.file_name}</CardTitle>
                                        <CardDescription>{source.row_count?.toLocaleString() ?? 0} rows processed</CardDescription>
                                    </div>
                                </div>
                                <NewDashboardDialog 
                                    source={source}
                                    organizationId={organization?.id}
                                    userId={user?.id}
                                    onDashboardCreated={loadAnalyticsData}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {source.dashboards.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {source.dashboards.map((dashboard) => (
                                        <Link key={dashboard.id} href={`/dashboard/analytics/${dashboard.id}`} className="block">
                                           <Card className="hover:border-primary hover:bg-accent transition-colors h-full">
                                               <CardHeader>
                                                   <CardTitle className="text-base flex items-center gap-2">
                                                       <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                                       {dashboard.name}
                                                   </CardTitle>
                                               </CardHeader>
                                               <CardContent>
                                                   <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}