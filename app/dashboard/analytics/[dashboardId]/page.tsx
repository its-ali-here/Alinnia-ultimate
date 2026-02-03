"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { use } from 'react';
import { getDashboardByIdAction, updateDashboardLayoutAction, updateWidgetAction, deleteWidgetAction, getReadyDatasourcesAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid } from 'lucide-react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartWidget } from '@/components/analytics/widgets/chart-widget';
import { SingleValueWidget } from '@/components/analytics/widgets/single-value-widget';
import { WidgetWrapper } from '@/components/analytics/widgets/widget-wrapper';
import { DateRangePicker } from "@/components/date-range-picker";
import { type DateRange } from "react-day-picker";
import 'leaflet/dist/leaflet.css';
import { GeoWidget } from '@/components/analytics/widgets/geo-widget';
import { UnifiedQueryBuilder } from '@/components/analytics/query-builder/unified-query-builder';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardViewPage({ params: paramsPromise }: { params: Promise<{ dashboardId: string }> }) {
    const params = use(paramsPromise);
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [datasources, setDatasources] = useState<any[]>([]);
    
    // --- SIMPLIFIED STATE ---
    // We removed 'isTypeSelectorOpen' because we don't need it anymore.
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<any>(null);
    const [widgetToDelete, setWidgetToDelete] = useState<any>(null);
    
    const [isSavingWidget, setIsSavingWidget] = useState(false);
    
    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
    });
    const [isCategoryFilterEnabled, setIsCategoryFilterEnabled] = useState(false);
    const [categoryColumn, setCategoryColumn] = useState<string>('');
    const [categoryValue, setCategoryValue] = useState<string>('');
    const [uniqueCategoryValues, setUniqueCategoryValues] = useState<string[]>([]);

    const loadDashboard = useCallback(async () => {
        if (!params.dashboardId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const result = await getDashboardByIdAction(params.dashboardId);
            if (result.error) {
                toast.error(result.error);
                setDashboard(null);
            } else {
                setDashboard(result.data);
                if (result.data?.organization_id) {
                    const dsResult = await getReadyDatasourcesAction(result.data.organization_id);
                    if (dsResult.data) {
                        setDatasources(dsResult.data);
                    }
                }
            }
        } catch (error) {
            toast.error("Failed to load dashboard data.");
            setDashboard(null);
        } finally {
            setIsLoading(false);
        }
    }, [params.dashboardId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const activeFilters = useMemo(() => {
        const filters: any = {};
        if (isDateFilterEnabled && dashboard?.datasource?.date_column) {
            filters.dateRange = dateRange;
            filters.dateColumn = dashboard.datasource.date_column;
            filters.dateFormat = 'DD-MM-yyyy';
        }
        if (isCategoryFilterEnabled && categoryColumn && categoryValue) {
            filters.categoryFilter = {
                column: categoryColumn,
                value: categoryValue
            };
        }
        return filters;
    }, [isDateFilterEnabled, dateRange, dashboard, isCategoryFilterEnabled, categoryColumn, categoryValue]);
    
    useEffect(() => {
        if (categoryColumn && dashboard?.datasource?.processed_data) {
            const allValues = dashboard.datasource.processed_data.map((row: any) => row[categoryColumn]);
            const uniqueValues = [...new Set(allValues)].filter(Boolean).sort();
            setUniqueCategoryValues(uniqueValues as string[]);
            setCategoryValue('');
        } else {
            setUniqueCategoryValues([]);
        }
    }, [categoryColumn, dashboard?.datasource?.processed_data]);

    const handleOpenCreateDialog = () => {
        setEditingWidget(null);
        setIsConfigOpen(true);
    };

    const handleOpenEditDialog = (widget: any) => {
        setEditingWidget(widget);
        setIsConfigOpen(true);
    };

    // --- NEW SIMPLIFIED SAVE HANDLER ---
    // The Unified Builder gives us the 'config' ready to go.
    const handleWidgetSave = async (config: any) => {
        setIsSavingWidget(true);
        try {
            if (editingWidget) {
                await updateWidgetAction({ 
                    dashboardId: dashboard.id, 
                    widget: { ...editingWidget, ...config } 
                });
                toast.success("Widget updated successfully!");
            } else {
                const newWidget = { 
                    ...config, 
                    i: `widget-${Date.now()}`, 
                    x: (dashboard.layout?.length * 6) % 12, 
                    y: Infinity, 
                    w: 6, 
                    h: 4 
                };
                const newLayout = [...(dashboard.layout || []), newWidget];
                await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newLayout });
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
    
    const onLayoutChange = async (newLayout: ReactGridLayout.Layout[]) => {
        if (dashboard && dashboard.layout && JSON.stringify(newLayout) !== JSON.stringify(dashboard.layout)) {
            const newFullLayout = newLayout.map(p => ({ ...dashboard.layout.find((w:any) => w.i === p.i), ...p }));
            setDashboard((prev: any) => ({ ...prev, layout: newFullLayout }));
            await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newFullLayout });
        }
    };

    // Columns for the global filter bar
    const globalFilterColumnDefinitions: string[] = dashboard?.datasource?.column_definitions || [];

    if (isLoading || !dashboard) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
                    <p className="text-muted-foreground">{dashboard.description || `A collection of your analytics widgets.`}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* --- BUTTON WIRED DIRECTLY TO BUILDER --- */}
                    <Button onClick={handleOpenCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add Widget
                    </Button>
                </div>
            </div>
            
            {/* --- NEW UNIFIED DIALOG --- */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
                    <UnifiedQueryBuilder 
                        datasources={datasources}
                        initialConfig={editingWidget} 
                        onSave={handleWidgetSave}
                        onCancel={() => setIsConfigOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <h3 className="text-md font-semibold mr-4">Filters</h3>
                    <div className="flex items-center gap-2">
                        <Switch id="date-filter-toggle" disabled={!dashboard.datasource} checked={isDateFilterEnabled && !!dashboard.datasource} onCheckedChange={setIsDateFilterEnabled} />
                        <Label htmlFor="date-filter-toggle" className={!dashboard.datasource ? 'text-muted-foreground' : ''}>Date Range</Label>
                    </div>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} disabled={!isDateFilterEnabled || !dashboard.datasource} />
                    <div className="flex items-center gap-2 md:ml-4 border-l md:pl-4">
                        <Switch id="category-filter-toggle" disabled={!dashboard.datasource} checked={isCategoryFilterEnabled && !!dashboard.datasource} onCheckedChange={setIsCategoryFilterEnabled} />
                        <Label htmlFor="category-filter-toggle" className={!dashboard.datasource ? 'text-muted-foreground' : ''}>Category</Label>
                    </div>
                    <Select value={categoryColumn} onValueChange={setCategoryColumn} disabled={!isCategoryFilterEnabled || !dashboard.datasource}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a column..." /></SelectTrigger>
                        <SelectContent>{globalFilterColumnDefinitions.map((col: string) => (<SelectItem key={col} value={col}>{col}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={categoryValue} onValueChange={setCategoryValue} disabled={!isCategoryFilterEnabled || !categoryColumn || uniqueCategoryValues.length === 0 || !dashboard.datasource}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a value..." /></SelectTrigger>
                        <SelectContent>{uniqueCategoryValues.map((val: string) => (<SelectItem key={val} value={val}>{val}</SelectItem>))}</SelectContent>
                    </Select>
                </CardContent>
            </Card>
            
            {dashboard.layout && dashboard.layout.length > 0 ? (
                <ResponsiveGridLayout
                    className="layout" layouts={{ lg: dashboard.layout }}
                    onLayoutChange={onLayoutChange}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={100}
                >
                    {dashboard.layout.map((widgetConfig: any) => (
                        <div key={widgetConfig.i}>
                           <WidgetWrapper widgetConfig={widgetConfig} onEdit={() => handleOpenEditDialog(widgetConfig)} onDelete={() => setWidgetToDelete(widgetConfig)}>
                               {widgetConfig.widgetType === 'summary-card' ? 
                                   <SingleValueWidget widgetConfig={widgetConfig} datasourceId={widgetConfig.datasourceId} filters={activeFilters} /> :
                               widgetConfig.widgetType === 'map' ?
                                   <GeoWidget widgetConfig={widgetConfig} datasourceId={widgetConfig.datasourceId} filters={activeFilters} /> :
                               widgetConfig.widgetType === 'chart' ?
                                   <ChartWidget widgetConfig={widgetConfig} datasourceId={widgetConfig.datasourceId} filters={activeFilters} /> :
                                <div>Unsupported Widget Type</div>
                               }
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