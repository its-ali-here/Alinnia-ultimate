"use server"

import { revalidatePath } from "next/cache"; 
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { cookies } from "next/headers";
import { Database } from "@/lib/database-types";

export async function getReadyDatasourcesAction(organizationId: string) {
    if (!organizationId) return { error: "Organization ID is required." };
    const supabase = createSupabaseAdminClient();
    // We now select 'column_definitions' directly in this query
    const { data, error } = await supabase
        .from("datasources")
        .select('id, file_name, row_count, column_definitions')
        .eq("organization_id", organizationId)
        .eq("status", "ready");
        
    if (error) { return { error: "Could not fetch data sources." }; }
    return { data };
}

export async function getDashboardsForDatasourceAction(datasourceId: string) {
    if (!datasourceId) return { error: "Datasource ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").select('id, name, description').eq("datasource_id", datasourceId).order('created_at', { ascending: false });
    if (error) { return { error: "Could not fetch dashboards." }; }
    return { data };
}

export async function getAllDashboardsAction(organizationId: string) {
    if (!organizationId) return { error: "Organization ID is required." };
    const supabase = createSupabaseAdminClient();

    try {
        // Get all dashboards for the organization, with their optional primary datasource
        const { data: dashboards, error: dashboardError } = await supabase
            .from("dashboards")
            .select(`
                id,
                name,
                description,
                created_at,
                datasource:datasources(id, file_name, status)
            `)
            .eq("organization_id", organizationId)
            .order('created_at', { ascending: false });

        if (dashboardError) {
            console.error('Error fetching dashboards:', dashboardError);
            return { error: "Could not fetch dashboards." };
        }

        return { data: dashboards || [] };

    } catch (error) {
        console.error('Unexpected error in getAllDashboardsAction:', error);
        return { error: "An unexpected error occurred while fetching dashboards." };
    }
}

export async function getDashboardByIdAction(dashboardId: string) {
    if (!dashboardId) return { error: "Dashboard ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").select(`*, datasource: datasources (id, file_name, column_definitions)`).eq("id", dashboardId).single();
    if (error) { return { error: "Could not find the specified dashboard." }; }
    return { data };
}

export async function createDashboardAction(args: {
    name: string;
    description?: string;
    organizationId: string;
    userId: string;
}) {
    const { name, description, organizationId, userId } = args;
    if (!name || !organizationId || !userId) {
        return { error: "Missing required fields." };
    }

    const supabase = createSupabaseAdminClient();

    try {
        console.log('Creating dashboard with data:', { name, description, organizationId, userId });

        // Create the dashboard without any datasource links
        const { data: dashboard, error: dashboardError } = await supabase
            .from("dashboards")
            .insert({
                name,
                description,
                organization_id: organizationId,
                created_by: userId,
                layout: [], // Start with an empty layout
                datasource_id: null // No primary datasource on creation
            })
            .select()
            .single();

        if (dashboardError) {
            console.error('Dashboard creation error details:', dashboardError);
            return { error: `Could not create the new dashboard: ${dashboardError.message}` };
        }
        
        console.log('Dashboard created successfully:', dashboard.id);
        return { data: dashboard };

    } catch (error) {
        console.error('Dashboard creation error:', error);
        console.error('Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as Error).name
        });
        return { error: `An unexpected error occurred while creating the dashboard: ${(error as Error).message}` };
    }
}

export async function updateDashboardAction(args: {
    dashboardId: string;
    name: string;
    description?: string;
}) {
    const { dashboardId, name, description } = args;
    if (!dashboardId || !name) {
        return { error: "Dashboard ID and name are required." };
    }

    const supabase = createSupabaseAdminClient();

    try {
        const { data: dashboard, error: dashboardError } = await supabase
            .from("dashboards")
            .update({
                name,
                description,
            })
            .eq("id", dashboardId)
            .select()
            .single();

        if (dashboardError) {
            console.error('Dashboard update error:', dashboardError);
            return { error: "Could not update the dashboard." };
        }

        return { data: dashboard };
    } catch (error) {
        console.error('Dashboard update error:', error);
        return { error: "An unexpected error occurred while updating the dashboard." };
    }
}

export async function deleteDashboardAction(dashboardId: string) {
    if (!dashboardId) {
        return { error: "Dashboard ID is required." };
    }

    const supabase = createSupabaseAdminClient();

    try {
        // Delete dashboard (relationships will be deleted automatically due to CASCADE)
        const { error: deleteError } = await supabase
            .from("dashboards")
            .delete()
            .eq("id", dashboardId);

        if (deleteError) {
            console.error('Dashboard deletion error:', deleteError);
            return { error: "Could not delete the dashboard." };
        }

        return { success: true };
    } catch (error) {
        console.error('Dashboard deletion error:', error);
        return { error: "An unexpected error occurred while deleting the dashboard." };
    }
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