"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { getAllDashboardsAction, getDashboardByIdAction, updateDashboardLayoutAction } from "@/app/actions/analytics"

interface SaveWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetConfig: any;
  organizationId: string;
}

export function SaveWidgetDialog({ open, onOpenChange, widgetConfig, organizationId }: SaveWidgetDialogProps) {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // When dialog opens, fetch dashboards and update title from latest widget config
  useEffect(() => {
    if (open && organizationId) {
      setCustomTitle(widgetConfig?.title || "");
      setIsLoading(true);
      getAllDashboardsAction(organizationId)
        .then(res => {
          if (res.data) setDashboards(res.data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, organizationId, widgetConfig]);

  const handleSave = async () => {
    if (!selectedDashboardId) {
      toast.error("Please select a dashboard");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Fetch the TARGET dashboard's current layout
      // We need the full object to append to the layout array
      const { data: dashboard, error } = await getDashboardByIdAction(selectedDashboardId);
      
      if (error || !dashboard) throw new Error("Could not fetch target dashboard");

      // 2. Calculate Position (Append to bottom)
      // Standard grid is 12 columns wide. We'll make this widget 6 columns wide (half width).
      const currentLayout = dashboard.layout || [];
      
      // Simple logic: Find the lowest point (y + h) in the current layout
      const maxY = currentLayout.reduce((max: number, item: any) => {
        return Math.max(max, (item.y || 0) + (item.h || 0));
      }, 0);

      // 3. Construct the New Widget Object
      const newWidget = {
        ...widgetConfig,
        title: customTitle,
        widgetType: widgetConfig.widgetType || (widgetConfig.chartType ? 'chart' : 'summary-card'),
        i: `widget-${Date.now()}`, // Unique ID
        x: 0, // Left aligned
        y: maxY, // Placed at the bottom
        w: 6, // Half width
        h: 4, // Standard height
      };

      // 4. Save
      const newLayout = [...currentLayout, newWidget];
      await updateDashboardLayoutAction({
        dashboardId: selectedDashboardId,
        layout: newLayout
      });

      toast.success("Widget pinned to dashboard!");
      onOpenChange(false);

    } catch (e) {
      console.error(e);
      toast.error("Failed to save widget.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pin to Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Widget Title</Label>
            <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Select Dashboard</Label>
            <Select value={selectedDashboardId} onValueChange={setSelectedDashboardId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dashboard..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>
                ) : dashboards.length === 0 ? (
                  <div className="p-2 text-center text-xs text-muted-foreground">No dashboards found</div>
                ) : (
                  dashboards.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedDashboardId}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Pinning..." : "Pin Widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}