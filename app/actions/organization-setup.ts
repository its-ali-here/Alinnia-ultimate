// app/actions/organization-setup.ts
"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { Organization } from "@/lib/database";

// We are moving the logic from lib/database.ts here
// and marking it as a Server Action.

async function addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("organization_members").insert({
    user_id: userId,
    organization_id: organizationId,
    role: role,
  });

  if (error) {
    console.error(`DB:addUserToOrganization - Supabase error for user ${userId}, org ${organizationId}:`, JSON.stringify(error, null, 2));
    throw new Error(`DB:addUserToOrganization - ${error.message} (Code: ${error.code})`);
  }
}

export async function createOrganizationAndLinkUserAction(userId: string, orgName: string): Promise<Organization> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({ name: orgName, owner_id: userId })
    .select()
    .single();

  if (orgError) {
    console.error("DB:createOrganization - Supabase error:", JSON.stringify(orgError, null, 2));
    throw new Error(`DB:createOrganization - ${orgError.message}`);
  }

  await addUserToOrganization(userId, org.id, "owner");
  return org;
}

export async function joinOrganizationAndLinkUserAction(userId: string, orgCode: string): Promise<Organization> {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: org, error: orgErr } = await supabaseAdmin.from("organizations").select("*").eq("id", orgCode).single();

  if (orgErr || !org) throw new Error("Organization not found.");

  const { data: exists, error: memErr } = await supabaseAdmin
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgCode)
    .eq("user_id", userId)
    .maybeSingle();

  if (memErr) throw memErr;
  if (exists) throw new Error("User is already a member of this organisation.");

  const { error: insertErr } = await supabaseAdmin.from("organization_members").insert({
    organization_id: orgCode,
    user_id: userId,
    role: "member",
  });

  if (insertErr) throw insertErr;

  return org as Organization;
}