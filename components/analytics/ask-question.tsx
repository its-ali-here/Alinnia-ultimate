"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getReadyDatasourcesAction } from "@/app/actions/analytics";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Plus, X } from "lucide-react";

// Define structures for our state
interface DataSource {
  id: string;
  file_name: string;
  column_definitions: string[];
}

interface Filter {
  id: number;
  column: string;
  condition: string;
  value: string;
}

interface Summary {
  id: number;
  metric: 'count' | 'sum' | 'average' | 'count_distinct';
  column: string | null; // Null for 'count'
}

export function AskQuestion() {
  const { organization } = useAuth();
  const organizationId = organization?.id;

  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for the query builder
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // State for the results
  const [results, setResults] = useState<any[]>([]);
  const [isQueryRunning, setIsQueryRunning] = useState(false);

  const loadDataSources = useCallback(async () => {
    if (!organizationId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    const result = await getReadyDatasourcesAction(organizationId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setDataSources(result.data || []);
    }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    loadDataSources();
  }, [loadDataSources]);

  const selectedDataSource = dataSources.find(ds => ds.id === selectedDataSourceId);

  // Filter Management Functions
  const addFilter = () => { setFilters([...filters, { id: Date.now(), column: "", condition: "is", value: "" }]); };
  const removeFilter = (id: number) => { setFilters(filters.filter(f => f.id !== id)); };
  const updateFilter = (id: number, field: keyof Filter, value: string) => { setFilters(filters.map(f => (f.id === id ? { ...f, [field]: value } : f))); };

  // Summary Management Functions
  const addSummary = () => {
    setSummaries([...summaries, { id: Date.now(), metric: 'count', column: null }]);
  };
  const removeSummary = (id: number) => {
    setSummaries(summaries.filter(s => s.id !== id));
  };
  const updateSummary = (id: number, field: keyof Summary, value: string | null) => {
    setSummaries(summaries.map(s => {
      if (s.id === id) {
        const updatedSummary = { ...s, [field]: value };
        if (field === 'metric' && value === 'count') {
          updatedSummary.column = null;
        }
        return updatedSummary;
      }
      return s;
    }));
  };

  const handleRunQuery = async () => {
    if (!selectedDataSourceId || summaries.length === 0) {
        toast.error("Please select a data source and at least one metric to summarize.");
        return;
    }
    setIsQueryRunning(true);
    setResults([]);
    try {
        const query = { filters, summaries, groupBy };
        const response = await fetch('/api/analytics/custom-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ datasourceId: selectedDataSourceId, query }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to run query.');
        setResults(data);
        toast.success("Query successful!");
    } catch (error) {
        toast.error((error as Error).message);
    } finally {
        setIsQueryRunning(false);
    }
  };

  if (isLoading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
  }
  
  const resultKeys = results.length > 0 ? Object.keys(results[0]) : [];
  const groupKey = resultKeys[0];
  const valueKey = resultKeys[1];

  return (
    <div className="space-y-6">
      {/* Step 1: Pick Data */}
      <Card>
        <CardHeader><CardTitle>1. Pick your data</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={(value) => { setSelectedDataSourceId(value); setFilters([]); setSummaries([]); setGroupBy(null); }} value={selectedDataSourceId || ""}>
            <SelectTrigger className="w-full md:w-[300px]"><SelectValue placeholder="Select a data source..." /></SelectTrigger>
            <SelectContent>
              {dataSources.map(ds => <SelectItem key={ds.id} value={ds.id}>{ds.file_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {/* Step 2: Filter */}
      <Card>
        <CardHeader><CardTitle>2. Filter</CardTitle><CardDescription>Narrow down your data to just the rows you want.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.id} className="flex flex-col md:flex-row items-center gap-2">
              <Select value={filter.column} onValueChange={(value) => updateFilter(filter.id, 'column', value)}><SelectTrigger><SelectValue placeholder="Column..." /></SelectTrigger><SelectContent>{selectedDataSource?.column_definitions?.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}</SelectContent></Select>
              <Select value={filter.condition} onValueChange={(value) => updateFilter(filter.id, 'condition', value)}><SelectTrigger className="w-full md:w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="is">Is</SelectItem><SelectItem value="is_not">Is not</SelectItem><SelectItem value="contains">Contains</SelectItem><SelectItem value="does_not_contain">Does not contain</SelectItem><SelectItem value="is_empty">Is empty</SelectItem><SelectItem value="not_empty">Is not empty</SelectItem></SelectContent></Select>
              <Input placeholder="Value..." value={filter.value} onChange={(e) => updateFilter(filter.id, 'value', e.target.value)} className="flex-1"/>
              <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" onClick={addFilter} disabled={!selectedDataSourceId}><Plus className="mr-2 h-4 w-4" /> Add filter</Button>
        </CardContent>
      </Card>
      
      {/* Step 3: Summarize */}
      <Card>
        <CardHeader><CardTitle>3. Summarize</CardTitle><CardDescription>Group your data to see metrics and trends.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label className="font-medium">Metric</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose a metric to calculate.</p>
                {summaries.map(summary => (
                    <div key={summary.id} className="flex items-center gap-2 mb-2">
                        <Select value={summary.metric} onValueChange={(value) => updateSummary(summary.id, 'metric', value)}>
                            <SelectTrigger className="w-full md:w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="count">Count of rows</SelectItem>
                                <SelectItem value="sum">Sum of...</SelectItem>
                                <SelectItem value="average">Average of...</SelectItem>
                                <SelectItem value="count_distinct">Count of distinct values of...</SelectItem>
                            </SelectContent>
                        </Select>
                        {summary.metric !== 'count' && (
                            <Select value={summary.column || ''} onValueChange={(value) => updateSummary(summary.id, 'column', value)}>
                                <SelectTrigger><SelectValue placeholder="column..."/></SelectTrigger>
                                <SelectContent>
                                    {selectedDataSource?.column_definitions.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => removeSummary(summary.id)}><X className="h-4 w-4"/></Button>
                    </div>
                ))}
                {summaries.length === 0 && (
                     <Button variant="outline" onClick={addSummary} disabled={!selectedDataSourceId}><Plus className="mr-2 h-4 w-4" /> Add a metric</Button>
                )}
            </div>
            <div>
                <Label className="font-medium">Group by</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose a column to group your results.</p>
                <Select value={groupBy || ''} onValueChange={(value) => setGroupBy(value || null)} disabled={!selectedDataSourceId}>
                    <SelectTrigger className="w-full md:w-[300px]"><SelectValue placeholder="Select a column to group by..."/></SelectTrigger>
                    <SelectContent>
                        {selectedDataSource?.column_definitions.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Button onClick={handleRunQuery} disabled={!selectedDataSourceId || isQueryRunning || summaries.length === 0}>
        {isQueryRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Visualize
      </Button>

      {/* Results Section */}
      <Card>
        <CardHeader><CardTitle>Result</CardTitle></CardHeader>
        <CardContent>
            {isQueryRunning ? (
                <div className="min-h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
            ) : results.length > 0 ? (
                <div className="space-y-4">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={results}>
                                <XAxis dataKey={groupKey} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey={valueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader><TableRow>{resultKeys.map(key => <TableHead key={key}>{key}</TableHead>)}</TableRow></TableHeader>
                            <TableBody>
                                {results.map((row, index) => (
                                    <TableRow key={index}>
                                        {resultKeys.map(key => <TableCell key={key}>{typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="min-h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Your results will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}