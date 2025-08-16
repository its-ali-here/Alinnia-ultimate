"use server"

import { revalidatePath } from "next/cache"; 
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { createServerClient } from "@supabase/ssr";
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
        // Get all dashboards for the organization
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

        if (!dashboards || dashboards.length === 0) {
            return { data: [] };
        }

        // Get all data sources for these dashboards
        const dashboardIds = dashboards.map(d => d.id);
        const { data: dataSources } = await supabase
            .from('dashboard_data_sources')
            .select(`
                dashboard_id,
                source_type,
                source_id,
                csv_source:datasources!dashboard_data_sources_source_id_fkey(id, file_name, status),
                google_sheet_source:google_sheets!dashboard_data_sources_source_id_fkey(id, google_sheet_id, name)
            `)
            .in('dashboard_id', dashboardIds);

        // Transform the data to include all data sources
        const transformedData = dashboards.map(dashboard => {
            const dashboardSources = dataSources?.filter(ds => ds.dashboard_id === dashboard.id) || [];

            const csvSources = dashboardSources
                .filter(ds => ds.source_type === 'csv' && ds.csv_source)
                .map(ds => ds.csv_source);

            const googleSheetSources = dashboardSources
                .filter(ds => ds.source_type === 'google_sheet' && ds.google_sheet_source)
                .map(ds => ({
                    id: ds.google_sheet_source.google_sheet_id,
                    name: ds.google_sheet_source.name
                }));

            return {
                ...dashboard,
                dataSources: {
                    csv: csvSources,
                    googleSheets: googleSheetSources
                }
            };
        });

        return { data: transformedData };
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
    datasourceIds: string[];
    googleSheetsIds: string[];
    organizationId: string;
    userId: string;
}) {
    const { name, description, datasourceIds, googleSheetsIds, organizationId, userId } = args;
    if (!name || !organizationId || !userId) {
        return { error: "Missing required fields." };
    }

    // We need at least one data source (CSV or Google Sheets)
    if (datasourceIds.length === 0 && googleSheetsIds.length === 0) {
        return { error: "At least one data source must be selected." };
    }

    // For backward compatibility, we still need a primary CSV datasource for the required datasource_id field
    if (datasourceIds.length === 0) {
        return { error: "At least one CSV data source must be selected as the primary source." };
    }

    const supabase = createSupabaseAdminClient();

    try {
        console.log('Creating dashboard with data:', {
            name,
            description,
            organizationId,
            userId,
            datasourceIds,
            googleSheetsIds
        });

        // Create the dashboard using your existing schema
        const { data: dashboard, error: dashboardError } = await supabase
            .from("dashboards")
            .insert({
                name,
                description,
                organization_id: organizationId,
                created_by: userId,
                layout: [],
                datasource_id: datasourceIds[0] // Required field - primary CSV datasource
            })
            .select()
            .single();

        console.log('Dashboard creation result:', { dashboard, dashboardError });

        if (dashboardError) {
            console.error('Dashboard creation error details:', dashboardError);
            return { error: `Could not create the new dashboard: ${dashboardError.message}` };
        }

        // Create relationships for all data sources (CSV and Google Sheets)
        const relationships = [];

        // Add CSV datasources
        for (const datasourceId of datasourceIds) {
            relationships.push({
                dashboard_id: dashboard.id,
                source_type: 'csv',
                source_id: datasourceId
            });
        }

        // Add Google Sheets
        for (const googleSheetId of googleSheetsIds) {
            // First, get the internal ID for this Google Sheet
            const { data: googleSheet } = await supabase
                .from('google_sheets')
                .select('id')
                .eq('google_sheet_id', googleSheetId)
                .eq('organization_id', organizationId)
                .single();

            if (googleSheet) {
                relationships.push({
                    dashboard_id: dashboard.id,
                    source_type: 'google_sheet',
                    source_id: googleSheet.id
                });
            }
        }

        // Insert all relationships
        if (relationships.length > 0) {
            const { error: relationshipError } = await supabase
                .from('dashboard_data_sources')
                .insert(relationships);

            if (relationshipError) {
                console.error('Error creating dashboard relationships:', relationshipError);
                // Clean up the dashboard if relationship creation fails
                await supabase.from("dashboards").delete().eq("id", dashboard.id);
                return { error: `Could not link data sources to dashboard: ${relationshipError.message}` };
            }
        }

        console.log('Dashboard created successfully with', relationships.length, 'data sources');

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
    datasourceIds: string[];
    googleSheetsIds: string[];
}) {
    const { dashboardId, name, description, datasourceIds, googleSheetsIds } = args;
    if (!dashboardId || !name) {
        return { error: "Dashboard ID and name are required." };
    }
    if (datasourceIds.length === 0 && googleSheetsIds.length === 0) {
        return { error: "At least one data source must be selected." };
    }

    const supabase = createSupabaseAdminClient();

    try {
        // Update the dashboard
        const { data: dashboard, error: dashboardError } = await supabase
            .from("dashboards")
            .update({
                name,
                description,
                google_sheets_ids: googleSheetsIds,
                datasource_id: datasourceIds.length > 0 ? datasourceIds[0] : null
            })
            .eq("id", dashboardId)
            .select()
            .single();

        if (dashboardError) {
            console.error('Dashboard update error:', dashboardError);
            return { error: "Could not update the dashboard." };
        }

        // Delete existing relationships
        await supabase
            .from("dashboard_datasources")
            .delete()
            .eq("dashboard_id", dashboardId);

        // Create new dashboard-datasource relationships
        if (datasourceIds.length > 0) {
            const relationships = datasourceIds.map(datasourceId => ({
                dashboard_id: dashboardId,
                datasource_id: datasourceId
            }));

            const { error: relationshipError } = await supabase
                .from("dashboard_datasources")
                .insert(relationships);

            if (relationshipError) {
                console.error('Relationship creation error:', relationshipError);
                return { error: "Could not update data source links." };
            }
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

// --- CORRECTED: Action to add a comment to a dashboard ---
export async function addCommentAction({ dashboardId, content, userId }: { dashboardId: string; content: string; userId: string }) {
    console.log("Adding comment:", { dashboardId, content, userId });

    if (!userId) {
        return { error: 'User ID is required.' };
    }

    if (!content.trim()) {
        return { error: 'Comment cannot be empty.' };
    }

    if (!dashboardId) {
        return { error: 'Dashboard ID is required.' };
    }

    try {
        const supabase = createSupabaseAdminClient();

        console.log("Inserting comment with data:", {
            dashboard_id: dashboardId,
            user_id: userId,
            content: content,
        });

        const { data, error } = await supabase
            .from('dashboard_comments')
            .insert({
                dashboard_id: dashboardId,
                user_id: userId,
                content: content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return { error: 'Failed to add comment. Please try again.' };
        }

        console.log("Comment added successfully:", data);
        revalidatePath(`/dashboard/analytics/${dashboardId}`);
        return { data };
    } catch (error) {
        console.error('Unexpected error in addCommentAction:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// --- Action to get all comments for a dashboard ---
export async function getCommentsAction({ dashboardId }: { dashboardId: string }) {
    const supabase = createSupabaseAdminClient();

    console.log("Fetching comments for dashboard:", dashboardId);

    // First, let's try a simpler query to debug
    const { data, error } = await supabase
        .from('dashboard_comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles!dashboard_comments_user_id_fkey (
                full_name,
                avatar_url
            )
        `)
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);

        // Try a fallback query without the join
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('dashboard_comments')
            .select('*')
            .eq('dashboard_id', dashboardId)
            .order('created_at', { ascending: true });

        if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return { error: 'Failed to fetch comments.' };
        }

        console.log("Fallback query succeeded:", fallbackData);

        // Manually fetch user profiles for each comment
        const commentsWithProfiles = await Promise.all(
            fallbackData.map(async (comment) => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', comment.user_id)
                    .single();

                return {
                    ...comment,
                    author: profile || { full_name: 'Unknown User', avatar_url: null }
                };
            })
        );

        return { data: commentsWithProfiles };
    }

    console.log("Comments fetched successfully:", data);

    // Transform the data to match expected format
    const transformedData = data.map(comment => ({
        ...comment,
        author: comment.profiles || { full_name: 'Unknown User', avatar_url: null }
    }));

    return { data: transformedData };
}