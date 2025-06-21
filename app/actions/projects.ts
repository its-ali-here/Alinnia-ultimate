// app/actions/projects.ts
"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

interface CreateProjectArgs {
  organizationId: string;
  userId: string;
  name: string;
  description?: string;
  dueDate?: string;
}

export async function createProjectAction(args: CreateProjectArgs) {
  const { organizationId, userId, name, description, dueDate } = args;

  if (!organizationId || !userId || !name) {
    return { error: "Organization ID, user ID, and project name are required." };
  }
  
  const supabase = createSupabaseAdminClient();

  // Step 1: Insert the new project
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: organizationId,
      created_by: userId,
      name,
      description,
      due_date: dueDate,
    })
    .select()
    .single();

  if (projectError) {
    console.error("Error creating project:", projectError);
    return { error: "Could not create the project." };
  }

  // Step 2: Add the creator as a member of the project with the 'lead' role
  const { error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectData.id,
      user_id: userId,
      role: 'lead',
    });
  
  if (memberError) {
    console.error("Error adding project member:", memberError);
    // In a real app, you might want to "roll back" the project creation here
    return { error: "Could not add member to the project." };
  }

  // Step 3: Revalidate the path to show the new project immediately
  revalidatePath("/dashboard/projects");
  
  return { data: projectData };
}