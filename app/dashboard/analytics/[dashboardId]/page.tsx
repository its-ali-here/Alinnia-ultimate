"use client";

import { useEffect, useState, useCallback } from 'react';
import { getDashboardByIdAction, updateDashboardLayoutAction, updateWidgetAction, deleteWidgetAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid, Loader2, BarChart, Hash, Edit } from 'lucide-react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartWidget } from '@/components/analytics/widgets/chart-widget';
import { SingleValueWidget } from '@/components/analytics/widgets/single-value-widget';
import { WidgetWrapper } from '@/components/analytics/widgets/widget-wrapper';
import { DateRangePicker } from "@/components/date-range-picker";
import { type DateRange } from "react-day-picker";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardViewPage({ params }: { params: { dashboardId: string } }) {
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for creating/editing widgets
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<any>(null);
    const [widgetToDelete, setWidgetToDelete] = useState<any>(null);
    const [widgetTypeToCreate, setWidgetTypeToCreate] = useState<null | 'chart' | 'summary-card'>(null);
    
    // Form state
    const [widgetTitle, setWidgetTitle] = useState("");
    const [isSavingWidget, setIsSavingWidget] = useState(false);
    const [filters, setFilters] = useState<any>({
        dateRange: {
            from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last 30 days
            to: new Date(),
        },
        dateColumn: 'OrderDate', // IMPORTANT: This must match a date column in your CSV
    });

    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        if (newDateRange) {
            setFilters((prev: any) => ({ ...prev, dateRange: newDateRange }));
        }
    };
    
    // Chart-specific state
    const [widgetChartType, setWidgetChartType] = useState("bar");
    const [widgetCategoryKey, setWidgetCategoryKey] = useState<string | undefined>();
    const [widgetValueKey, setWidgetValueKey] = useState<string | undefined>();

    // Summary Card-specific state
    const [widgetColumnName, setWidgetColumnName] = useState<string | undefined>();
    const [widgetAggregationType, setWidgetAggregationType] = useState('sum');
    const [widgetNumberFormat, setWidgetNumberFormat] = useState('number');

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

    const resetFormState = () => {
        setEditingWidget(null);
        setWidgetTitle("");
        setWidgetChartType("bar");
        setWidgetCategoryKey(undefined);
        setWidgetValueKey(undefined);
        setWidgetColumnName(undefined);
        setWidgetAggregationType("sum");
        setWidgetNumberFormat('number');
    };

    const handleOpenCreateDialog = (type: 'chart' | 'summary-card') => {
        resetFormState();
        setWidgetTypeToCreate(type);
        setIsTypeSelectorOpen(false);
        setIsConfigOpen(true);
    };

    const handleOpenEditDialog = (widget: any) => {
        resetFormState();
        setEditingWidget(widget);
        setWidgetTitle(widget.title);
        if (widget.widgetType === 'chart') {
            setWidgetTypeToCreate('chart');
            setWidgetChartType(widget.chartType);
            setWidgetCategoryKey(widget.query.categoryKey);
            setWidgetValueKey(widget.query.valueKey);
        } else if (widget.widgetType === 'summary-card') {
            setWidgetTypeToCreate('summary-card');
            setWidgetColumnName(widget.query.columnName);
            setWidgetAggregationType(widget.query.aggregationType);
            setWidgetNumberFormat(widget.query.format || 'number');
        }
        setIsConfigOpen(true);
    };

    const handleSaveWidget = async () => {
        setIsSavingWidget(true);
        let widgetData;

        if (widgetTypeToCreate === 'chart') {
            if (!widgetTitle || !widgetCategoryKey || !widgetValueKey) { toast.error("Please complete all chart fields."); setIsSavingWidget(false); return; }
            widgetData = { title: widgetTitle, chartType: widgetChartType, widgetType: 'chart', query: { categoryKey: widgetCategoryKey, valueKey: widgetValueKey } };
        } else if (widgetTypeToCreate === 'summary-card') {
            if (!widgetTitle || !widgetColumnName) { toast.error("Please complete all summary card fields."); setIsSavingWidget(false); return; }
            widgetData = { title: widgetTitle, widgetType: 'summary-card', query: { columnName: widgetColumnName, aggregationType: widgetAggregationType, format: widgetNumberFormat } };
        } else {
            setIsSavingWidget(false); return;
        }

        try {
            if (editingWidget) {
                const result = await updateWidgetAction({ dashboardId: dashboard.id, widget: { ...editingWidget, ...widgetData } });
                if (result.error) throw new Error(result.error);
                toast.success("Widget updated successfully!");
            } else {
                const newWidget = { ...widgetData, i: `widget-${Date.now()}`, x: (dashboard.layout?.length * 4) % 12, y: Infinity, w: 6, h: 3 };
                const newLayout = [...(dashboard.layout || []), newWidget];
                const result = await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newLayout });
                if (result.error) throw new Error(result.error);
                toast.success("Widget added successfully!");
            }
            await loadDashboard();
            setIsConfigOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSavingWidget(false);
        }
    };

    const handleDeleteWidget = async () => {
        if (!widgetToDelete) return;
        try {
            await deleteWidgetAction({ dashboardId: dashboard.id, widgetId: widgetToDelete.i });
            toast.success("Widget deleted!");
            await loadDashboard();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setWidgetToDelete(null);
        }
    };
    
    const onLayoutChange = async (newLayout: ReactGridLayout.Layout[]) => { /* ... no change needed ... */ };

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
                        <DialogHeader><DialogTitle>Choose a widget type</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Card onClick={() => handleOpenCreateDialog('summary-card')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center gap-2"><Hash className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">Summary Card</p><p className="text-xs text-muted-foreground">Display a single metric.</p></div></Card>
                            <Card onClick={() => handleOpenCreateDialog('chart')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center gap-2"><BarChart className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">Chart</p><p className="text-xs text-muted-foreground">Visualize data with a chart.</p></div></Card>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isConfigOpen} onOpenChange={(open) => { if (!open) { resetFormState(); setIsConfigOpen(false); } else { setIsConfigOpen(open); } }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingWidget ? 'Edit' : 'Configure'} {widgetTypeToCreate === 'chart' ? 'Chart' : 'Summary Card'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Widget Title</Label><Input value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="e.g., Total Revenue" /></div>
                            {widgetTypeToCreate === 'chart' && (<>
                                <div className="space-y-2"><Label>Chart Type</Label><Select value={widgetChartType} onValueChange={(v) => setWidgetChartType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bar">Bar</SelectItem><SelectItem value="line">Line</SelectItem><SelectItem value="pie">Pie</SelectItem><SelectItem value="area">Area</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Category (X-Axis / Labels)</Label><Select value={widgetCategoryKey} onValueChange={setWidgetCategoryKey}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-2"><Label>Value (Y-Axis / Numbers)</Label><Select value={widgetValueKey} onValueChange={setWidgetValueKey}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                            </>)}
                            {widgetTypeToCreate === 'summary-card' && (<>
                                <div className="space-y-2"><Label>Data Column</Label><Select value={widgetColumnName} onValueChange={setWidgetColumnName}><SelectTrigger><SelectValue placeholder="Select a column..."/></SelectTrigger><SelectContent>{columnDefinitions.filter(Boolean).map((c:string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-2"><Label>Calculation</Label><Select value={widgetAggregationType} onValueChange={(v) => setWidgetAggregationType(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sum">Sum</SelectItem><SelectItem value="average">Average</SelectItem><SelectItem value="count">Count</SelectItem><SelectItem value="median">Median</SelectItem><SelectItem value="min">Minimum</SelectItem><SelectItem value="max">Maximum</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Number Formatting</Label><Select value={widgetNumberFormat} onValueChange={(v) => setWidgetNumberFormat(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="number">Number</SelectItem><SelectItem value="currency">Currency ($)</SelectItem><SelectItem value="percent">Percent (%)</SelectItem></SelectContent></Select></div>
                            </>)}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveWidget} disabled={isSavingWidget}>{isSavingWidget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 border-b pb-4">
                <DateRangePicker />
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Filter
                </Button>
            </div>
            
            {(dashboard.layout && dashboard.layout.length > 0) ? (
                <ResponsiveGridLayout className="layout" layouts={{ lg: dashboard.layout }} onLayoutChange={onLayoutChange} {...{breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}, cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}, rowHeight: 100}}>
                    {(dashboard.layout).map((widgetConfig: any) => (
                        <div key={widgetConfig.i}>
                           <WidgetWrapper widgetConfig={widgetConfig} onEdit={() => handleOpenEditDialog(widgetConfig)} onDelete={() => setWidgetToDelete(widgetConfig)}>
                                {widgetConfig.widgetType === 'summary-card' ? <SingleValueWidget widgetConfig={widgetConfig} datasourceId={dashboard.datasource.id} /> : <ChartWidget widgetConfig={widgetConfig} datasourceId={dashboard.datasource.id} />}
                           </WidgetWrapper>
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

            <AlertDialog open={!!widgetToDelete} onOpenChange={() => setWidgetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove the "{widgetToDelete?.title}" widget from this dashboard.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWidget} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}