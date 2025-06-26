// app/dashboard/analytics/[dashboardId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { getDashboardByIdAction, updateDashboardLayoutAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid, Loader2 } from 'lucide-react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardViewPage({ params }: { params: { dashboardId: string } }) {
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

    // State for the new widget form
    const [widgetTitle, setWidgetTitle] = useState("");
    const [widgetChartType, setWidgetChartType] = useState("bar");
    const [widgetCategoryKey, setWidgetCategoryKey] = useState<string | undefined>();
    const [widgetValueKey, setWidgetValueKey] = useState<string | undefined>();
    const [isSavingWidget, setIsSavingWidget] = useState(false);

    const loadDashboard = async () => {
        if (!params.dashboardId) return;
        // No need to set loading true here, handled by initial load
        const result = await getDashboardByIdAction(params.dashboardId);
        if (result.error) {
            toast.error(result.error);
            setDashboard(null);
        } else {
            setDashboard(result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadDashboard();
    }, [params.dashboardId]);

    const handleSaveWidget = async () => {
        if (!widgetTitle || !widgetCategoryKey || !widgetValueKey) {
            toast.error("Please fill out all fields for the new widget.");
            return;
        }
        setIsSavingWidget(true);

        // Define the new widget configuration
        const newWidget = {
            i: `widget-${Date.now()}`, // Unique ID for the widget
            x: (dashboard.layout.length * 4) % 12, // Simple logic to place new widgets
            y: Infinity, // Places it at the bottom
            w: 4,
            h: 2,
            title: widgetTitle,
            chartType: widgetChartType,
            query: {
                categoryKey: widgetCategoryKey,
                valueKey: widgetValueKey,
            },
        };

        const newLayout = [...dashboard.layout, newWidget];

        try {
            const result = await updateDashboardLayoutAction({
                dashboardId: dashboard.id,
                layout: newLayout,
            });

            if (result.error) throw new Error(result.error);

            toast.success("Widget added successfully!");
            await loadDashboard(); // Refresh the dashboard to show the new widget
            setIsAddWidgetOpen(false);

            // Reset form
            setWidgetTitle("");
            setWidgetCategoryKey(undefined);
            setWidgetValueKey(undefined);

        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSavingWidget(false);
        }
    };

    if (isLoading) {
        return <Skeleton className="h-[80vh] w-full" />;
    }

    if (!dashboard) {
        return <div className="p-8">Dashboard not found.</div>;
    }

    const columnDefinitions = dashboard.datasource.column_definitions || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
                    <p className="text-muted-foreground">{dashboard.description || `Analytics from ${dashboard.datasource.file_name}`}</p>
                </div>

                <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Widget</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Widget</DialogTitle>
                            <DialogDescription>Configure your new chart widget.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Widget Title</Label>
                                <Input value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="e.g., Sales by Region" />
                            </div>
                            <div className="space-y-2">
                                <Label>Chart Type</Label>
                                <Select value={widgetChartType} onValueChange={setWidgetChartType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="bar">Bar Chart</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category (X-Axis)</Label>
                                <Select value={widgetCategoryKey} onValueChange={setWidgetCategoryKey}>
                                    <SelectTrigger><SelectValue placeholder="Select a column..." /></SelectTrigger>
                                    <SelectContent>
                                        {columnDefinitions..filter(Boolean)map((col: string) => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value (Y-Axis)</Label>
                                <Select value={widgetValueKey} onValueChange={setWidgetValueKey}>
                                    <SelectTrigger><SelectValue placeholder="Select a column..." /></SelectTrigger>
                                    <SelectContent>
                                        {columnDefinitions..filter(Boolean)map((col: string) => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveWidget} disabled={isSavingWidget}>
                                {isSavingWidget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add to Dashboard
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {dashboard.layout && dashboard.layout.length > 0 ? (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: dashboard.layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={100}
                >
                    {dashboard.layout.map((widget: any) => (
                        <div key={widget.i} className="p-2">
                            <Card className="h-full w-full">
                                <CardHeader>
                                    <CardTitle className="text-base">{widget.title || 'Untitled Widget'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Chart will be rendered here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            ) : (
                <div className="border-2 border-dashed rounded-lg min-h-[60vh] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <LayoutGrid className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">This dashboard is empty.</h3>
                        <p className="mt-1 text-sm">Click "Add Widget" to start building your dashboard.</p>
                    </div>
                </div>
            )}
        </div>
    );
}