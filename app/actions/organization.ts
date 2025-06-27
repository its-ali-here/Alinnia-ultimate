"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import type { Organization } from "@/lib/database"
import { revalidatePath } from "next/cache"

// This is the main function to get the user's org data.
export async function getUserOrganizationData(userId: string): Promise<{ organization: Organization; role: string; } | null> {
    if (!userId) return null;
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("organization_members")
      .select("role, organization:organizations(*)")
      .eq("user_id", userId)
      .limit(1)
      .single(); 

    if (error || !data || !data.organization) {
      if (error && error.code !== 'PGRST116') { console.error("Org Action Error:", error); }
      return null;
    }
    return { organization: data.organization as Organization, role: data.role };
}

// Function to update text-based details.
export async function updateOrganizationDetailsAction(args: {
    organizationId: string;
    updates: { name?: string; description?: string; email?: string; phone?: string; industry?: string; city?: string; country?: string; };
}) {
    const { organizationId, updates } = args;
    if (!organizationId || !updates) return { error: "Missing required fields." };
    
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("organizations").update(updates).eq("id", organizationId).select().single();

    if (error) {
        console.error("Error updating org details:", error);
        return { error: "Could not update organization details." };
    }
    revalidatePath("/dashboard/organization");
    return { data };
}

// Function to update the logo URL.
export async function updateOrganizationLogoAction(args: { organizationId: string; logoUrl: string; }) {
    const { organizationId, logoUrl } = args;
    if (!organizationId) return { error: "Organization ID is required." };

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("organizations").update({ logo_url: logoUrl }).eq("id", organizationId).select().single();
    
    if (error) {
        console.error("Error updating org logo:", error);
        return { error: "Could not update organization logo." };
    }
    revalidatePath("/dashboard/organization");
    return { data };
}