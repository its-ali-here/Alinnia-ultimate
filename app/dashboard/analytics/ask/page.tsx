"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getReadyDatasourcesAction } from "@/app/actions/analytics";
import { UnifiedQueryBuilder } from "@/components/analytics/query-builder/unified-query-builder";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AskPage() {
  const { organizationId } = useAuth();
  const [datasources, setDatasources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!organizationId) return;
      const res = await getReadyDatasourcesAction(organizationId);
      if (res.data) setDatasources(res.data);
      setIsLoading(false);
    }
    load();
  }, [organizationId]);

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Data</h1>
        <p className="text-muted-foreground">Ad-hoc analysis playground. To save widgets, go to your Dashboard.</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-0">
             {/* reusing the same powerful builder component */}
             <UnifiedQueryBuilder 
                datasources={datasources}
                onSave={(config) => {
                    // For now, the Explore page is just a playground. 
                    // Later, we can add a "Pin to Dashboard" modal here.
                    console.log("Widget Config:", config);
                    toast.info("This is a playground. To pin widgets, use the Dashboard view.");
                }}
                onCancel={() => {
                    toast.info("Cleared.");
                }}
             />
        </CardContent>
      </Card>
    </div>
  );
}