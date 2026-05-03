import { supabase, isSupabaseConfigured } from "./supabase"
import { createSupabaseAdminClient } from "./supabase-server"

// NOTE: This file interacts with tables in your Supabase 'public' schema.
// Ensure the table names here (e.g., "users", "organizations") match your database exactly.

export interface Organization {
  id: string
  name: string
  email: string
  phone?: string
  industry: string
  city: string
  country: string
  organization_code: string
  created_at: string
}

export interface OrganizationUser {
  id: string
  organization_id: string
  user_id: string
  full_name: string
  email: string
  avatar_url?: string
  phone?: string
  timezone?: string
  role: string
  designation?: string
  joined_at: string
  created_at: string
  updated_at: string
}

export interface UserPermissionItem {
  permission_type: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
}

export interface Project {
  id: string
  organization_id: string
  name: string
  description?: string
  address?: string
  start_date: string
  end_date?: string
  budget: number
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
}

export interface Phase {
  id: string
  project_id: string
  parent_phase_id?: string
  name: string
  description?: string
  start_date: string
  end_date: string
  budget: number
  status: 'not_started' | 'in_progress' | 'completed'
  completion_percentage: number
}

export interface Task {
  id: string
  phase_id: string
  name: string
  description?: string
  due_date: string
  status: 'todo' | 'in_progress' | 'done'
  assignee_id?: string
}

export interface Expense {
  id: string
  project_id: string
  phase_id?: string
  task_id?: string
  description: string
  amount: number
  date: string
  category: string
  vendor?: string
  invoice_id?: string
}

export interface Document {
  id: string
  project_id: string
  file_name: string
  file_path: string
  file_type: 'invoice' | 'drawing' | 'receipt' | 'other'
  uploaded_at: string
  uploaded_by: string
}

export interface PriceIntelligence {
  id: string
  item_name: string
  item_type: 'material' | 'labor'
  unit: string
  price: number
  location: string
  updated_at: string
}

// Profile functions
export async function getOrganizationUser(userId: string, organizationId: string): Promise<OrganizationUser | null> {
  if (!isSupabaseConfigured()) {
    console.warn("DB:getOrganizationUser - Supabase not configured, returning demo data.")
    return {
      id: "demo-user",
      organization_id: organizationId,
      user_id: userId,
      full_name: "Demo User",
      email: "demo@example.com",
      role: "member",
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error) {
    console.error("DB:getOrganizationUser - Supabase error:", JSON.stringify(error, null, 2))
    return null
  }
  return data
}

export async function updateOrganizationUser(
  userId: string,
  organizationId: string,
  updates: Partial<Pick<OrganizationUser, "full_name" | "avatar_url" | "phone" | "timezone" | "designation">>,
): Promise<OrganizationUser | null> {
  if (!isSupabaseConfigured()) {
    console.warn("DB:updateOrganizationUser - Supabase not configured.")
    return null
  }
  const { data, error } = await supabase
    .from("organization_members")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error) {
    console.error("DB:updateOrganizationUser - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Organization functions
export async function createOrganization(
  ownerId: string,
  ownerEmail: string,
  ownerFullName: string,
  orgName: string,
): Promise<Organization> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({ name: orgName })
    .select()
    .single()

  if (orgError) {
    console.error("DB:createOrganization - Supabase error:", JSON.stringify(orgError, null, 2))
    throw new Error(`DB:createOrganization - ${orgError.message}`)
  }
  await addUserToOrganization(ownerId, ownerEmail, ownerFullName, org.id, "owner")
  return org
}

export async function getUserOrganizations(userId: string) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (
        id,
        name,
        organization_code,
        email,
        phone,
        industry,
        city,
        country,
        logo_url
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user's organization and role:", error);
    return null;
  }
  return data;
}

export async function createOrganizationAndLinkUser(userId: string, userEmail: string, userFullName: string, orgName: string): Promise<Organization> {
  return createOrganization(userId, userEmail, userFullName, orgName)
}

export async function joinOrganizationAndLinkUser(userId: string, userEmail: string, userFullName: string, orgCode: string): Promise<Organization> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured.")

  const supabaseAdmin = createSupabaseAdminClient()
  const { data: org, error: orgErr } = await supabaseAdmin.from("organizations").select("*").eq("id", orgCode).single()

  if (orgErr || !org) throw new Error("Organization not found.")

  const { data: exists, error: memErr } = await supabaseAdmin
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgCode)
    .eq("user_id", userId)
    .maybeSingle()

  if (memErr) throw memErr
  if (exists) throw new Error("User is already a member of this organisation.")

  const { error: insertErr } = await supabaseAdmin.from("organization_members").insert({
    organization_id: orgCode,
    user_id: userId,
    email: userEmail,
    full_name: userFullName,
    role: "member",
  })

  if (insertErr) throw insertErr

  return org as Organization
}

// Organization members functions
export async function getOrganizationMembers(
  organizationId: string,
): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      designation,
      joined_at,
      full_name,
      avatar_url,
      user_id
    `)
    .eq("organization_id", organizationId)
    .order("joined_at");

  if (error) {
    console.error("DB:getOrganizationMembers - Supabase error:", JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function updateOrganizationMemberDesignation(
  userId: string,
  organizationId: string,
  designation: string
): Promise<OrganizationUser | null> {
  if (!isSupabaseConfigured()) {
    console.warn("DB:updateOrganizationMemberDesignation - Supabase not configured.");
    return null;
  }

  const { data, error } = await supabase
    .from("organization_members")
    .update({ designation: designation })
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) {
    console.error("DB:updateOrganizationMemberDesignation - Supabase error:", JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
}

// Helper function
async function addUserToOrganization(userId: string, userEmail: string, userFullName: string, organizationId: string, role: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("organization_members").insert({
    user_id: userId,
    organization_id: organizationId,
    email: userEmail,
    full_name: userFullName,
    role: role,
  })

  if (error) {
    throw new Error(`DB:addUserToOrganization - ${error.message} (Code: ${error.code})`)
  }
}

// Add these new functions to the end of lib/database.ts

export async function inviteMember(organizationId: string, email: string, role: string, inviterId: string) {
  // In a real application, you would generate a unique invite token,
  // save it to an 'invites' table, and send an email with a special link.
  // For now, we will simulate this by logging to the console.
  console.log(`Simulating invite for ${email} to org ${organizationId} with role ${role} by user ${inviterId}`);
  return { success: true };
}

export async function updateMemberRole(memberId: string, newRole: string) {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.");
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId);

  if (error) {
      console.error("DB:updateMemberRole - Supabase error:", JSON.stringify(error, null, 2));
      throw new Error(`DB:updateMemberRole - ${error.message}`);
  }
}

export async function removeMember(memberId: string) {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.");
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
      .from("organization_members")
      .delete()
      .eq("id", memberId);

  if (error) {
      console.error("DB:removeMember - Supabase error:", JSON.stringify(error, null, 2));
      throw new Error(`DB:removeMember - ${error.message}`);
  }
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string; phone?: string; timezone?: string },
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("organization_members")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("DB:updateProfile - Supabase error:", JSON.stringify(error, null, 2));
    throw error;
  }
}