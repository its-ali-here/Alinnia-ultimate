"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { use } from 'react'; // Import `use` from React
import dynamic from 'next/dynamic';
import { getDashboardByIdAction, updateDashboardLayoutAction, updateWidgetAction, deleteWidgetAction, addCommentAction, getCommentsAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid, Loader2, BarChart, Hash, Edit, Map as MapIcon } from 'lucide-react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
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
import { DashboardCommentSidebar } from '@/components/analytics/dashboard-comment-sidebar';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardViewPage({ params: paramsPromise }: { params: Promise<{ dashboardId: string }> }) {
    const params = use(paramsPromise); // Unwrap `params` using `use`
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<any>(null);
    const [widgetToDelete, setWidgetToDelete] = useState<any>(null);
    const [widgetTypeToCreate, setWidgetTypeToCreate] = useState<null | 'chart' | 'summary-card' | 'map'>(null);
    
    const [widgetTitle, setWidgetTitle] = useState("");
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

    const [widgetChartType, setWidgetChartType] = useState("bar");
    const [widgetCategoryKey, setWidgetCategoryKey] = useState<string | undefined>();
    const [widgetValueKey, setWidgetValueKey] = useState<string | undefined>();
    const [widgetXAxisKey, setWidgetXAxisKey] = useState<string | undefined>();
    const [widgetYAxisKey, setWidgetYAxisKey] = useState<string | undefined>();
    const [widgetMapValueKey, setWidgetMapValueKey] = useState<string | undefined>();
    const [widgetColumnName, setWidgetColumnName] = useState<string | undefined>();
    const [widgetAggregationType, setWidgetAggregationType] = useState('sum');
    const [widgetNumberFormat, setWidgetNumberFormat] = useState('number');
    const [widgetLatKey, setWidgetLatKey] = useState<string | undefined>();
    const [widgetLonKey, setWidgetLonKey] = useState<string | undefined>();

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const loadDashboard = useCallback(async () => {
        if (!params.dashboardId) {
            setIsLoading(false);
            return;
        }
        // Keep loading true until the very end
        setIsLoading(true);
        try {
            const result = await getDashboardByIdAction(params.dashboardId);
            if (result.error) {
                toast.error(result.error);
                setDashboard(null);
            } else {
                setDashboard(result.data);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data.");
            setDashboard(null);
        } finally {
            setIsLoading(false);
        }
    }, [params.dashboardId]);

    const loadComments = useCallback(async () => {
        const result = await getCommentsAction({ dashboardId: params.dashboardId });
        if (result.error) {
            toast.error(result.error);
        } else {
            setComments(result.data || []); // FIX: Ensure `data` is always an array
        }
    }, [params.dashboardId]);

    useEffect(() => {
        loadDashboard();
        loadComments();
    }, [loadDashboard, loadComments]);

    const activeFilters = useMemo(() => {
        const filters: any = {};
        if (isDateFilterEnabled && dashboard?.datasource?.date_column && dashboard?.datasource?.date_format) {
            filters.dateRange = dateRange;
            filters.dateColumn = dashboard.datasource.date_column;
            filters.dateFormat = dashboard.datasource.date_format;
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

    const resetFormState = () => {
        setEditingWidget(null);
        setWidgetTitle("");
        setWidgetChartType("bar");
        setWidgetCategoryKey(undefined);
        setWidgetValueKey(undefined);
        setWidgetXAxisKey(undefined);
        setWidgetYAxisKey(undefined);
        setWidgetMapValueKey(undefined);
        setWidgetLatKey(undefined);
        setWidgetLonKey(undefined);
        setWidgetColumnName(undefined);
        setWidgetAggregationType("sum");
        setWidgetNumberFormat('number');
    };

    const handleOpenCreateDialog = (type: 'chart' | 'summary-card' | 'map') => {
        resetFormState();
        setWidgetTypeToCreate(type);
        setIsTypeSelectorOpen(false);
        setIsConfigOpen(true);
    };

    const handleOpenEditDialog = (widget: any) => {
        resetFormState();
        setEditingWidget(widget);
        setWidgetTitle(widget.title);
        setWidgetTypeToCreate(widget.widgetType);

        if (widget.widgetType === 'chart') {
            setWidgetChartType(widget.chartType);
            if (widget.chartType === 'scatter') {
                setWidgetXAxisKey(widget.query.xAxisKey);
                setWidgetYAxisKey(widget.query.yAxisKey);
            } else {
                setWidgetCategoryKey(widget.query.categoryKey);
                setWidgetValueKey(widget.query.valueKey);
            }
        } else if (widget.widgetType === 'map') {
            setWidgetLatKey(widget.query.latKey);
            setWidgetLonKey(widget.query.lonKey);
            setWidgetMapValueKey(widget.query.valueKey);
        } else if (widget.widgetType === 'summary-card') {
            setWidgetColumnName(widget.query.columnName);
            setWidgetAggregationType(widget.query.aggregationType);
            setWidgetNumberFormat(widget.query.format || 'number');
        }
        setIsConfigOpen(true);
    };

    const handleSaveWidget = async () => {
        setIsSavingWidget(true);
        let widgetData;

        switch (widgetTypeToCreate) {
            case 'chart':
                let chartQuery: any = {};
                if (widgetChartType === 'scatter') {
                    if (!widgetXAxisKey || !widgetYAxisKey) { toast.error("Please select columns for both X and Y axes."); setIsSavingWidget(false); return; }
                    chartQuery = { xAxisKey: widgetXAxisKey, yAxisKey: widgetYAxisKey };
                } else {
                    if (!widgetCategoryKey || !widgetValueKey) { toast.error("Please select a category and value column."); setIsSavingWidget(false); return; }
                    chartQuery = { categoryKey: widgetCategoryKey, valueKey: widgetValueKey };
                }
                widgetData = { title: widgetTitle, chartType: widgetChartType, widgetType: 'chart', query: chartQuery };
                break;
            case 'map':
                if (!widgetLatKey || !widgetLonKey || !widgetMapValueKey) {
                    toast.error("Please select columns for latitude, longitude, and value."); 
                    setIsSavingWidget(false); 
                    return; 
                }
                const mapQuery = { latKey: widgetLatKey, lonKey: widgetLonKey, valueKey: widgetMapValueKey };
                widgetData = { title: widgetTitle, widgetType: 'map', query: mapQuery };
                break;
            case 'summary-card':
                if (!widgetTitle || !widgetColumnName) { toast.error("Please complete all summary card fields."); setIsSavingWidget(false); return; }
                widgetData = { title: widgetTitle, widgetType: 'summary-card', query: { columnName: widgetColumnName, aggregationType: widgetAggregationType, format: widgetNumberFormat } };
                break;
            default:
                setIsSavingWidget(false);
                return;
        }

        try {
            if (editingWidget) {
                await updateWidgetAction({ dashboardId: dashboard.id, widget: { ...editingWidget, ...widgetData } });
                toast.success("Widget updated successfully!");
            } else {
                const newWidget = { ...widgetData, i: `widget-${Date.now()}`, x: (dashboard.layout?.length * 6) % 12, y: Infinity, w: 6, h: 4 };
                const newLayout = [...(dashboard.layout || []), newWidget];
                await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newLayout });
                toast.success("Widget added successfully!");
            }
            await loadDashboard();
            setIsConfigOpen(false);
            resetFormState();
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
    
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty.');
            return;
        }

        setIsSubmittingComment(true);
        try {
            const result = await addCommentAction({ dashboardId: params.dashboardId, content: newComment });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Comment added successfully!');
                setNewComment('');
                await loadComments();
            }
        } catch (error) {
            toast.error('Failed to add comment. Please try again.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const onLayoutChange = async (newLayout: ReactGridLayout.Layout[]) => {
        if (dashboard && dashboard.layout && JSON.stringify(newLayout) !== JSON.stringify(dashboard.layout)) {
            const newFullLayout = newLayout.map(p => ({ ...dashboard.layout.find((w:any) => w.i === p.i), ...p }));
            setDashboard((prev: any) => ({ ...prev, layout: newFullLayout }));
            await updateDashboardLayoutAction({ dashboardId: dashboard.id, layout: newFullLayout });
        }
    };

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

    const columnDefinitions: string[] = dashboard.datasource.column_definitions || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
                    <p className="text-muted-foreground">{dashboard.description || `Analytics from ${dashboard.datasource.file_name}`}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <DashboardCommentSidebar dashboardId={dashboard.id} />
                    <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
                        <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Widget</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Choose a widget type</DialogTitle>
                                <DialogDescription>
                                    Select a new widget to add to your dashboard.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <Card onClick={() => handleOpenCreateDialog('summary-card')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center gap-2"><Hash className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">Summary Card</p><p className="text-xs text-muted-foreground">Display a single metric.</p></div></Card>
                                <Card onClick={() => handleOpenCreateDialog('chart')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center gap-2"><BarChart className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">Chart</p><p className="text-xs text-muted-foreground">Visualize data with a chart.</p></div></Card>
                                <Card onClick={() => handleOpenCreateDialog('map')} className="hover:border-primary cursor-pointer p-4 text-center justify-center flex flex-col items-center gap-2"><MapIcon className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">Map</p><p className="text-xs text-muted-foreground">Display geographical data.</p></div></Card>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            <Dialog open={isConfigOpen} onOpenChange={(open) => { if (!open) { resetFormState(); setIsConfigOpen(false); } else { setIsConfigOpen(open); } }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingWidget ? 'Edit' : 'Configure'} Widget</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Widget Title</Label><Input value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="e.g., Total Revenue" /></div>
                        
                        {widgetTypeToCreate === 'chart' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Chart Type</Label>
                                    <Select
                                        value={widgetChartType}
                                        onValueChange={(value) => setWidgetChartType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select chart type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bar">Bar</SelectItem>
                                            <SelectItem value="line">Line</SelectItem>
                                            <SelectItem value="pie">Pie</SelectItem>
                                            <SelectItem value="area">Area</SelectItem>
                                            <SelectItem value="scatter">Scatter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {widgetChartType === 'scatter' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label>X-Axis Key</Label>
                                            <Select
                                                value={widgetXAxisKey}
                                                onValueChange={(value) => setWidgetXAxisKey(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select X-axis column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columnDefinitions.map((col: string) => (
                                                        <SelectItem key={col} value={col}>
                                                            {col}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Y-Axis Key</Label>
                                            <Select
                                                value={widgetYAxisKey}
                                                onValueChange={(value) => setWidgetYAxisKey(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Y-axis column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columnDefinitions.map((col: string) => (
                                                        <SelectItem key={col} value={col}>
                                                            {col}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Category Key</Label>
                                            <Select
                                                value={widgetCategoryKey}
                                                onValueChange={(value) => setWidgetCategoryKey(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columnDefinitions.map((col: string) => (
                                                        <SelectItem key={col} value={col}>
                                                            {col}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Value Key</Label>
                                            <Select
                                                value={widgetValueKey}
                                                onValueChange={(value) => setWidgetValueKey(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select value column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columnDefinitions.map((col: string) => (
                                                        <SelectItem key={col} value={col}>
                                                            {col}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {widgetTypeToCreate === 'map' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Latitude Key</Label>
                                    <Select
                                        value={widgetLatKey}
                                        onValueChange={(value) => setWidgetLatKey(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select latitude column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnDefinitions.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude Key</Label>
                                    <Select
                                        value={widgetLonKey}
                                        onValueChange={(value) => setWidgetLonKey(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select longitude column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnDefinitions.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value Key</Label>
                                    <Select
                                        value={widgetMapValueKey}
                                        onValueChange={(value) => setWidgetMapValueKey(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select value column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnDefinitions.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {widgetTypeToCreate === 'summary-card' && (
                           <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Column Name</Label>
                                    <Select
                                        value={widgetColumnName}
                                        onValueChange={(value) => setWidgetColumnName(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnDefinitions.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Aggregation Type</Label>
                                    <Select
                                        value={widgetAggregationType}
                                        onValueChange={(value) => setWidgetAggregationType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select aggregation type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sum">Sum</SelectItem>
                                            <SelectItem value="average">Average</SelectItem>
                                            <SelectItem value="count">Count</SelectItem>
                                            <SelectItem value="count_distinct">Count Distinct</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Number Format</Label>
                                    <Select
                                        value={widgetNumberFormat}
                                        onValueChange={(value) => setWidgetNumberFormat(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="currency">Currency</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveWidget} disabled={isSavingWidget}>{isSavingWidget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <h3 className="text-md font-semibold mr-4">Filters</h3>
                    <div className="flex items-center gap-2">
                        <Switch id="date-filter-toggle" checked={isDateFilterEnabled} onCheckedChange={setIsDateFilterEnabled} />
                        <Label htmlFor="date-filter-toggle">Date Range</Label>
                    </div>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} disabled={!isDateFilterEnabled} />
                    <div className="flex items-center gap-2 md:ml-4 border-l md:pl-4">
                        <Switch id="category-filter-toggle" checked={isCategoryFilterEnabled} onCheckedChange={setIsCategoryFilterEnabled} />
                        <Label htmlFor="category-filter-toggle">Category</Label>
                    </div>
                    <Select value={categoryColumn} onValueChange={setCategoryColumn} disabled={!isCategoryFilterEnabled}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a column..." /></SelectTrigger>
                        <SelectContent>{columnDefinitions.map((col: string) => (<SelectItem key={col} value={col}>{col}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={categoryValue} onValueChange={setCategoryValue} disabled={!isCategoryFilterEnabled || !categoryColumn || uniqueCategoryValues.length === 0}>
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
                                   <SingleValueWidget widgetConfig={widgetConfig} datasourceId={dashboard.datasource.id} filters={activeFilters} /> :
                               widgetConfig.widgetType === 'map' ?
                                   <GeoWidget widgetConfig={widgetConfig} datasourceId={dashboard.datasource.id} filters={activeFilters} /> :
                               widgetConfig.widgetType === 'chart' ?
                                   <ChartWidget widgetConfig={widgetConfig} datasourceId={dashboard.datasource.id} filters={activeFilters} /> :
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

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Comments</h2>
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-4 border rounded">
                            <p className="font-semibold">{comment.author.full_name}</p>
                            <p>{comment.content}</p>
                            <p className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={isSubmittingComment}
                        className="p-2 bg-primary text-white rounded"
                    >
                        {isSubmittingComment ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>

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