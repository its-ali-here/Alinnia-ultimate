"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, PieChart, Activity, Map as MapIcon, Hash } from "lucide-react";
import { ChartWidget } from "@/components/analytics/widgets/chart-widget";
import { SingleValueWidget } from "@/components/analytics/widgets/single-value-widget";
import { GeoWidget } from "@/components/analytics/widgets/geo-widget";

interface DataSource {
  id: string;
  file_name: string;
  column_definitions: string[];
}

interface UnifiedQueryBuilderProps {
  datasources: DataSource[];
  initialConfig?: any; // Pass this when editing an existing widget
  onSave: (config: any) => void;
  onCancel: () => void;
}

export function UnifiedQueryBuilder({ datasources, initialConfig, onSave, onCancel }: UnifiedQueryBuilderProps) {
  // 1. Initialize State (Default to initialConfig if editing)
  const [title, setTitle] = useState(initialConfig?.title || "New Analysis");
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string>(initialConfig?.datasourceId || "");
  const [widgetType, setWidgetType] = useState<'chart' | 'summary-card' | 'map'>(initialConfig?.widgetType || 'chart');
  
  // Chart State
  const [chartType, setChartType] = useState(initialConfig?.chartType || 'bar');
  const [xAxis, setXAxis] = useState(initialConfig?.query?.categoryKey || initialConfig?.query?.xAxisKey || "");
  const [yAxis, setYAxis] = useState(initialConfig?.query?.valueKey || initialConfig?.query?.yAxisKey || "");
  
  // Summary State
  const [summaryCol, setSummaryCol] = useState(initialConfig?.query?.columnName || "");
  const [aggregation, setAggregation] = useState(initialConfig?.query?.aggregationType || "sum");
  
  // Map State
  const [latCol, setLatCol] = useState(initialConfig?.query?.latKey || "");
  const [lonCol, setLonCol] = useState(initialConfig?.query?.lonKey || "");
  const [mapValCol, setMapValCol] = useState(initialConfig?.query?.valueKey || "");

  // Helper to get columns for selected source
  const columns = datasources.find(ds => ds.id === selectedDataSourceId)?.column_definitions || [];

  // 2. Generate Preview Config on the fly
  const generateConfig = () => {
    const base = { title, datasourceId: selectedDataSourceId, widgetType };
    
    if (widgetType === 'chart') {
      if (chartType === 'scatter') {
        return { ...base, chartType, query: { xAxisKey: xAxis, yAxisKey: yAxis } };
      }
      return { ...base, chartType, query: { categoryKey: xAxis, valueKey: yAxis } };
    }
    
    if (widgetType === 'summary-card') {
      return { ...base, query: { columnName: summaryCol, aggregationType: aggregation, format: 'number' } };
    }
    
    if (widgetType === 'map') {
      return { ...base, query: { latKey: latCol, lonKey: lonCol, valueKey: mapValCol } };
    }
    return null;
  };

  const previewConfig = generateConfig();
  const isReady = selectedDataSourceId && (
    (widgetType === 'chart' && xAxis && yAxis) ||
    (widgetType === 'summary-card' && summaryCol) ||
    (widgetType === 'map' && latCol && lonCol)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
      
      {/* LEFT: Builder Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4 border-r pr-4 overflow-y-auto">
        <div className="space-y-2">
          <Label>Question Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select value={selectedDataSourceId} onValueChange={setSelectedDataSourceId}>
            <SelectTrigger><SelectValue placeholder="Select file..." /></SelectTrigger>
            <SelectContent>
              {datasources.map(ds => <SelectItem key={ds.id} value={ds.id}>{ds.file_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={widgetType} onValueChange={(v: any) => setWidgetType(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart"><BarChart3 className="h-4 w-4 mr-2"/>Chart</TabsTrigger>
            <TabsTrigger value="summary-card"><Hash className="h-4 w-4 mr-2"/>Metric</TabsTrigger>
            <TabsTrigger value="map"><MapIcon className="h-4 w-4 mr-2"/>Map</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Dynamic Controls based on Type */}
        {widgetType === 'chart' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label>Visualization</Label>
              <div className="flex gap-1">
                {['bar', 'line', 'area', 'pie', 'scatter'].map(t => (
                  <Button key={t} size="sm" variant={chartType === t ? 'default' : 'outline'} onClick={() => setChartType(t)} className="capitalize text-xs px-2 h-8">
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{chartType === 'scatter' ? 'X-Axis' : 'Group By (X)'}</Label>
              <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedDataSourceId}>
                <SelectTrigger><SelectValue placeholder="Column..." /></SelectTrigger>
                <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{chartType === 'scatter' ? 'Y-Axis' : 'Metric (Y)'}</Label>
              <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedDataSourceId}>
                <SelectTrigger><SelectValue placeholder="Column..." /></SelectTrigger>
                <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        {widgetType === 'summary-card' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label>Calculate</Label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="min">Min</SelectItem>
                  <SelectItem value="max">Max</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Column</Label>
              <Select value={summaryCol} onValueChange={setSummaryCol} disabled={!selectedDataSourceId}>
                <SelectTrigger><SelectValue placeholder="Column..." /></SelectTrigger>
                <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        {widgetType === 'map' && (
           <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
             <div className="space-y-2"><Label>Latitude Column</Label><Select value={latCol} onValueChange={setLatCol}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{columns.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
             <div className="space-y-2"><Label>Longitude Column</Label><Select value={lonCol} onValueChange={setLonCol}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{columns.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
             <div className="space-y-2"><Label>Value Column (Size/Color)</Label><Select value={mapValCol} onValueChange={setMapValCol}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{columns.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
           </div>
        )}

        <div className="flex gap-2 mt-auto pt-4">
          <Button variant="outline" className="w-full" onClick={onCancel}>Cancel</Button>
          <Button className="w-full" disabled={!isReady} onClick={() => onSave(previewConfig)}>
            Save to Dashboard
          </Button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="lg:col-span-8 bg-muted/10 rounded-lg border flex flex-col">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-semibold text-sm">Live Preview</h3>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          {isReady && previewConfig ? (
             <div className="h-full w-full bg-background rounded border shadow-sm p-4">
                {widgetType === 'chart' && <ChartWidget widgetConfig={previewConfig} datasourceId={selectedDataSourceId} filters={{}} />}
                {widgetType === 'summary-card' && <SingleValueWidget widgetConfig={previewConfig} datasourceId={selectedDataSourceId} filters={{}} />}
                {widgetType === 'map' && <GeoWidget widgetConfig={previewConfig} datasourceId={selectedDataSourceId} filters={{}} />}
             </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Configure your data to see a preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}