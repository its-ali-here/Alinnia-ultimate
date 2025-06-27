// app/dashboard/analytics/[dashboardId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from 'react';
import { getDashboardByIdAction, updateDashboardLayoutAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid, Loader2, BarChart, Hash } from 'lucide-react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartWidget } from '@/components/analytics/widgets/chart-widget';
import { SingleValueWidget } from '@/components/analytics/widgets/single-value-widget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardViewPage({ params }: { params: { dashboardId: string } }) {
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [widgetTypeToCreate, setWidgetTypeToCreate] = useState<null | 'chart' | 'summary-card'>(null);
    
    // Form state
    const [widgetTitle, setWidgetTitle] = useState("");
    const [isSavingWidget, setIsSavingWidget] = useState(false);
    
    // Chart-specific state
    const [widgetChartType, setWidgetChartType] = useState("bar");
    const [widgetCategoryKey, setWidgetCategoryKey] = useState<string | undefined>();
    const [widgetValueKey, setWidgetValueKey] = useState<string | undefined>();

    // Summary Card-specific state
    const [widgetColumnName, setWidgetColumnName] = useState<string | undefined>();
    const [widgetAggregationType, setWidgetAggregationType] = useState('sum');

    const loadDashboard = useCallback(async () => {
        if (!params.dashboardId) return;
        const result = await getDashboardByIdAction(params.dashboardId);
        if (result.error) {
            toast.error(result.error);
            setDashboard(null);
        } else {
            setDashboard(result.data);
        }
        setIsLoading(false);
    }, [params.dashboardId]);

    useEffect(() => {
        setIsLoading(true);
        loadDashboard();
    }, [loadDashboard]);

    const openWidgetConfig = (type: 'chart' | 'summary-card') => {
        setWidgetTypeToCreate(type);
        setIsTypeSelectorOpen(false);
        setIsConfigOpen(true);
    };
    
    const resetFormState = () => {
        setWidgetTitle("");
        setWidgetChartType("bar");
        setWidgetCategoryKey(undefined);
        setWidgetValueKey(undefined);
        setWidgetColumnName(undefined);
        setWidgetAggregationType("sum");
    };

    // --- THIS IS THE COMPLETE, CORRECTED FUNCTION ---
    const handleSaveWidget = async () => {
        setIsSavingWidget(true);
        let newWidget;

        if (widgetTypeToCreate === 'chart') {
            if (!widgetTitle || !widgetCategoryKey || !widgetValueKey) {
                toast.error("Please fill out all fields for the new chart widget.");
                setIsSavingWidget(false);
                return;
            }
            newWidget = {
                i: `widget-${Date.now()}`, x: (dashboard.layout?.length * 4) % 12, y: Infinity, w: 6, h: 3,
                widgetType: 'chart', title: widgetTitle, chartType: widgetChartType,
                query: { categoryKey: widgetCategoryKey, valueKey: widgetValueKey },
            };
        } else if (widgetTypeToCreate === 'summary-card') {
            if (!widgetTitle || !widgetColumnName) {
                toast.error("Please fill out all fields for the new summary card.");
                setIsSavingWidget(false);
                return;
            }
            newWidget = {
                i: `widget-${Date.now()}`, x: (dashboard.layout?.length * 3) % 12, y: Infinity, w: 3, h: 1.2,
                widgetType: 'summary-card', title: widgetTitle,
                query: { columnName: widgetColumnName, aggregationType: widgetAggregationType },
            };
        } else {
             setIsSavingWidget(false);
             return; // Should not happen
        }

        const newLayout = [...(dashboard.layout || []), newWidget];

        try {
            const result = await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newLayout });
            if (result.error) throw new Error(result.error);
            toast.success("Widget added successfully!");
            await loadDashboard();
            setIsConfigOpen(false);
            resetFormState();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSavingWidget(false);
        }
    };
    
    const onLayoutChange = async (newLayout: ReactGridLayout.Layout[]) => {
        if (dashboard && dashboard.layout && JSON.stringify(newLayout) !== JSON.stringify(dashboard.layout)) {
            await updateDashboardLayoutAction({
                dashboardId: dashboard.id,
                layout: newLayout,
            });
        }
    };

    if (isLoading) return <Skeleton className="h-[80vh] w-full" />;
    if (!dashboard) return <div className="p-8 font-semibold">Dashboard not found.</div>;

    const columnDefinitions = dashboard.datasource.column_definitions || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
                    <p className="text-muted-foreground">{dashboard.description || `Analytics from ${dashboard.datasource.file_name}`}</p>
                </div>
                
                <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
                    <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Widget</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Choose a widget type</DialogTitle>
                            <DialogDescription>What would you like to add to your dashboard?</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Card onClick={() => openWidgetConfig('summary-card')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center">
                                <Hash className="h-8 w-8 mb-2 text-muted-foreground" />
                                <p className="font-semibold">Summary Card</p>
                                <p className="text-xs text-muted-foreground">Display a single key metric.</p>
                            </Card>
                            <Card onClick={() => openWidgetConfig('chart')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center">
                                <BarChart className="h-8 w-8 mb-2 text-muted-foreground" />
                                <p className="font-semibold">Chart</p>
                                <p className="text-xs text-muted-foreground">Visualize data with a chart.</p>
                            </Card>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isConfigOpen} onOpenChange={(open) => { if (!open) resetFormState(); setIsConfigOpen(open); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configure {widgetTypeToCreate === 'chart' ? 'Chart' : 'Summary Card'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Widget Title</Label>
                                <Input value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="e.g., Total Revenue" />
                            </div>
                            {widgetTypeToCreate === 'chart' && (<>
                                <div className="space-y-2">
                                    <Label>Chart Type</Label>
                                    <Select value={widgetChartType} onValueChange={(v) => setWidgetChartType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bar">Bar</SelectItem><SelectItem value="line">Line</SelectItem><SelectItem value="pie">Pie</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category (X-Axis / Labels)</Label>
                                    <Select value={widgetCategoryKey} onValueChange={setWidgetCategoryKey}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value (Y-Axis / Numbers)</Label>
                                    <Select value={widgetValueKey} onValueChange={setWidgetValueKey}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                </div>
                            </>)}
                            {widgetTypeToCreate === 'summary-card' && (<>
                                <div className="space-y-2">
                                    <Label>Data Column</Label>
                                    <Select value={widgetColumnName} onValueChange={setWidgetColumnName}><SelectTrigger><SelectValue placeholder="Select a column..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Calculation</Label>
                                    <Select value={widgetAggregationType} onValueChange={(v) => setWidgetAggregationType(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sum">Sum (Total)</SelectItem><SelectItem value="average">Average</SelectItem><SelectItem value="count">Count (Rows)</SelectItem></SelectContent></Select>
                                </div>
                            </>)}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveWidget} disabled={isSavingWidget}>
                                {isSavingWidget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add to Dashboard
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            {(dashboard.layout && dashboard.layout.length > 0) ? (
                <ResponsiveGridLayout
                    className="layout" layouts={{ lg: dashboard.layout }}
                    onLayoutChange={onLayoutChange}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={100}
                >
                    {dashboard.layout.map((widgetConfig: any) => {
                        if (widgetConfig.widgetType === 'chart') {
                            return (
                                <div key={widgetConfig.i}>
                                    <ChartWidget
                                        widgetConfig={widgetConfig}
                                        datasourceId={dashboard.datasource.id}
                                    />
                                </div>
                            );
                        }
                        if (widgetConfig.widgetType === 'summary-card') {
                            return (
                                <div key={widgetConfig.i}>
                                    <SingleValueWidget
                                        widgetConfig={widgetConfig}
                                        datasourceId={dashboard.datasource.id}
                                    />
                                </div>
                            );
                        }
                        // Return null or a placeholder for any unknown widget types to prevent crashes
                        return null; 
                    })}
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