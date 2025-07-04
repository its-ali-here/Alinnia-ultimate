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

export async function getDashboardByIdAction(dashboardId: string) {
    if (!dashboardId) return { error: "Dashboard ID is required." };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("dashboards").select(`*, datasource: datasources (id, file_name, column_definitions)`).eq("id", dashboardId).single();
    if (error) { return { error: "Could not find the specified dashboard." }; }
    return { data };
}

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

// --- CORRECTED: Action to add a comment to a dashboard ---
export async function addCommentAction({ dashboardId, content }: { dashboardId: string; content: string }) {
    const cookieStore = await cookies(); // FIX: Await the cookies promise

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value; // FIX: Correctly access cookies
                },
            },
        }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(); // FIX: Handle user fetching errors
    if (userError || !userData?.user) {
        return { error: 'You must be logged in to comment.' };
    }

    if (!content.trim()) {
        return { error: 'Comment cannot be empty.' };
    }

    const { data, error } = await supabase
        .from('dashboard_comments')
        .insert({
            dashboard_id: dashboardId,
            user_id: userData.user.id,
            content: content,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'Failed to add comment. Please try again.' };
    }

    return { data };
}

// --- Action to get all comments for a dashboard ---
export async function getCommentsAction({ dashboardId }: { dashboardId: string }) {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
        .from('dashboard_comments')
        .select(`
            id,
            content,
            created_at,
            author:profiles!dashboard_comments_user_id_fkey (
                full_name,
                avatar_url
            )
        `) // FIX: Use the correct foreign key relationship
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return { error: 'Failed to fetch comments.' };
    }

    return { data };
}