"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache";

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

// Add these to app/actions/analytics.ts

/**
 * Creates a new, empty dashboard record linked to a datasource.
 */
export async function createDashboardAction(args: {
    name: string;
    description?: string;
    datasourceId: string;
    organizationId: string;
    userId: string;
}) {
    const { name, description, datasourceId, organizationId, userId } = args;
    if (!name || !datasourceId || !organizationId || !userId) {
        return { error: "Missing required fields to create a dashboard." };
    }
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("dashboards")
        .insert({
            name,
            description,
            datasource_id: datasourceId,
            organization_id: organizationId,
            created_by: userId,
            layout: [], // Start with an empty layout
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating dashboard:", error);
        return { error: "Could not create the new dashboard." };
    }
    return { data };
}

/**
 * Fetches a single dashboard and its related datasource by its ID.
 */
export async function getDashboardByIdAction(dashboardId: string) {
    if (!dashboardId) return { error: "Dashboard ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("dashboards")
        .select(`
            *,
            datasource: datasources (
                id,
                file_name,
                column_definitions
            )
        `)
        .eq("id", dashboardId)
        .single();

    if (error) {
        console.error("Error fetching dashboard:", error);
        return { error: "Could not find the specified dashboard." };
    }
    return { data };
}

// Add this to app/actions/analytics.ts

/**
 * Updates the layout JSON for a specific dashboard.
 */
export async function updateDashboardLayoutAction(args: {
    dashboardId: string;
    layout: any;
}) {
    const { dashboardId, layout } = args;
    if (!dashboardId) {
        return { error: "Dashboard ID is required." };
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("dashboards")
        .update({ layout: layout })
        .eq("id", dashboardId)
        .select()
        .single();

    if (error) {
        console.error("Error updating dashboard layout:", error);
        return { error: "Could not save dashboard layout." };
    }

    // No need to revalidate path here, as the page will refresh its own data
    return { data };
}

// Add these new functions to app/actions/analytics.ts

/**
 * Updates a single widget's configuration within a dashboard's layout array.
 */
export async function updateWidgetAction(args: {
    dashboardId: string;
    widget: any; // The full updated widget object
}) {
    const { dashboardId, widget } = args;
    if (!dashboardId || !widget || !widget.i) {
        return { error: "Dashboard ID and widget configuration are required." };
    }

    const supabase = createSupabaseAdminClient();

    // Fetch the current dashboard layout
    const { data: dashboard, error: fetchError } = await supabase
        .from('dashboards')
        .select('layout')
        .eq('id', dashboardId)
        .single();

    if (fetchError || !dashboard) {
        return { error: "Could not find the dashboard to update." };
    }

    // Find and replace the widget in the layout array
    const newLayout = dashboard.layout.map((w: any) => (w.i === widget.i ? widget : w));

    // Save the updated layout back to the database
    const { data: updatedData, error: updateError } = await supabase
        .from('dashboards')
        .update({ layout: newLayout })
        .eq('id', dashboardId)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating widget:", updateError);
        return { error: "Could not save the updated widget." };
    }

    revalidatePath(`/dashboard/analytics/${dashboardId}`);
    return { data: updatedData };
}


/**
 * Deletes a single widget from a dashboard's layout array.
 */
export async function deleteWidgetAction(args: {
    dashboardId: string;
    widgetId: string;
}) {
    const { dashboardId, widgetId } = args;
    if (!dashboardId || !widgetId) {
        return { error: "Dashboard ID and Widget ID are required." };
    }

    const supabase = createSupabaseAdminClient();

    const { data: dashboard, error: fetchError } = await supabase
        .from('dashboards')
        .select('layout')
        .eq('id', dashboardId)
        .single();

    if (fetchError || !dashboard) {
        return { error: "Could not find the dashboard to update." };
    }

    // Filter out the widget to be deleted
    const newLayout = dashboard.layout.filter((w: any) => w.i !== widgetId);

    const { data: updatedData, error: updateError } = await supabase
        .from('dashboards')
        .update({ layout: newLayout })
        .eq('id', dashboardId)
        .select()
        .single();

    if (updateError) {
        console.error("Error deleting widget:", updateError);
        return { error: "Could not delete the widget." };
    }

    revalidatePath(`/dashboard/analytics/${dashboardId}`);
    return { data: updatedData };
}