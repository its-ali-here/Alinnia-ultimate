"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"

/**
 * Fetches all datasources that are ready for use.
 */
export async function getReadyDatasourcesAction(organizationId: string) {
    if (!organizationId) return { error: "Organization ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("datasources")
        .select('id, file_name, row_count')
        .eq("organization_id", organizationId)
        .eq("status", "ready");

    if (error) {
        console.error("Error fetching datasources:", error);
        return { error: "Could not fetch data sources." };
    }
    return { data };
}

/**
 * Fetches all dashboards linked to a specific datasource.
 */
export async function getDashboardsForDatasourceAction(datasourceId: string) {
    if (!datasourceId) return { error: "Datasource ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("dashboards")
        .select('id, name, description')
        .eq("datasource_id", datasourceId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching dashboards:", error);
        return { error: "Could not fetch dashboards." };
    }
    return { data };
}