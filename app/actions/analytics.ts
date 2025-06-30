"use server"

import { revalidatePath } from "next/cache"; // <-- The missing import
import { createSupabaseAdminClient } from "@/lib/supabase-server"

// This function remains the same
export async function getReadyDatasourcesAction(organizationId: string) {
    if (!organizationId) return { error: "Organization ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("datasources").select('id, file_name, row_count').eq("organization_id", organizationId).eq("status", "ready");
    if (error) { return { error: "Could not fetch data sources." }; }
    return { data };
}

// This function remains the same
export async function getDashboardsForDatasourceAction(datasourceId: string) {
    if (!datasourceId) return { error: "Datasource ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").select('id, name, description').eq("datasource_id", datasourceId).order('created_at', { ascending: false });
    if (error) { return { error: "Could not fetch dashboards." }; }
    return { data };
}

// This function remains the same
export async function getDashboardByIdAction(dashboardId: string) {
    if (!dashboardId) return { error: "Dashboard ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").select(`*, datasource: datasources (id, file_name, column_definitions)`).eq("id", dashboardId).single();
    if (error) { return { error: "Could not find the specified dashboard." }; }
    return { data };
}

// --- ADD THE FOLLOWING NEW AND CORRECTED FUNCTIONS ---

export async function createDashboardAction(args: { name: string; description?: string; datasourceId: string; organizationId: string; userId: string; }) {
    const { name, description, datasourceId, organizationId, userId } = args;
    if (!name || !datasourceId || !organizationId || !userId) { return { error: "Missing required fields." }; }
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").insert({ name, description, datasource_id: datasourceId, organization_id: organizationId, created_by: userId, layout: [], }).select().single();
    if (error) { return { error: "Could not create the new dashboard." }; }
    return { data };
}

export async function updateDashboardLayoutAction(args: { dashboardId: string; layout: any; }) {
    const { dashboardId, layout } = args;
    if (!dashboardId) { return { error: "Dashboard ID is required." }; }
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").update({ layout: layout }).eq("id", dashboardId).select().single();
    if (error) { return { error: "Could not save dashboard layout." }; }
    revalidatePath(`/dashboard/analytics/${dashboardId}`);
    return { data };
}

export async function updateWidgetAction(args: { dashboardId: string; widget: any; }) {
    const { dashboardId, widget } = args;
    if (!dashboardId || !widget || !widget.i) { return { error: "Dashboard ID and widget configuration are required." }; }
    const supabase = createSupabaseAdminClient();
    const { data: dashboard, error: fetchError } = await supabase.from('dashboards').select('layout').eq('id', dashboardId).single();
    if (fetchError || !dashboard) { return { error: "Could not find the dashboard to update." }; }
    const newLayout = dashboard.layout.map((w: any) => (w.i === widget.i ? widget : w));
    const { data, error } = await supabase.from('dashboards').update({ layout: newLayout }).eq('id', dashboardId).select().single();
    if (error) { return { error: "Could not save the updated widget." }; }
    revalidatePath(`/dashboard/analytics/${dashboardId}`);
    return { data };
}

export async function deleteWidgetAction(args: { dashboardId: string; widgetId: string; }) {
    const { dashboardId, widgetId } = args;
    if (!dashboardId || !widgetId) { return { error: "Dashboard ID and Widget ID are required." }; }
    const supabase = createSupabaseAdminClient();
    const { data: dashboard, error: fetchError } = await supabase.from('dashboards').select('layout').eq('id', dashboardId).single();
    if (fetchError || !dashboard) { return { error: "Could not find the dashboard to update." }; }
    const newLayout = dashboard.layout.filter((w: any) => w.i !== widgetId);
    const { data, error } = await supabase.from('dashboards').update({ layout: newLayout }).eq('id', dashboardId).select().single();
    if (error) { return { error: "Could not delete the widget." }; }
    revalidatePath(`/dashboard/analytics/${dashboardId}`);
    return { data };
}