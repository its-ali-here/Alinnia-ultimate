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

// Keep the existing createProjectAction function
export async function createProjectAction(args: CreateProjectArgs) {
  const { organizationId, userId, name, description, dueDate } = args;

  if (!organizationId || !userId || !name) {
    return { error: "Organization ID, user ID, and project name are required." };
  }
  
  const supabase = createSupabaseAdminClient();

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

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectData.id,
      user_id: userId,
      role: 'lead',
    });
  
  if (memberError) {
    console.error("Error adding project member:", memberError);
    return { error: "Could not add member to the project." };
  }

  revalidatePath("/dashboard/projects");
  
  return { data: projectData };
}


// Keep the existing getProjectsForOrganizationAction function
export async function getProjectsForOrganizationAction(organizationId: string) {
  if (!organizationId) {
    return { error: "Organization ID is required." };
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      description,
      status,
      due_date,
      project_members (
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return { error: "Could not fetch projects." };
  }
  
  const projectsWithProgress = data.map(p => ({ ...p, progress: Math.floor(Math.random() * 100) }));


  return { data: projectsWithProgress };
}

// Keep the existing getProjectByIdAction function
export async function getProjectByIdAction(projectId: string) {
  if (!projectId) {
    return { error: "Project ID is required." };
  }

  const supabase = createSupabaseAdminClient();

  console.log(`[Action] Fetching project with ID: ${projectId}`); // For debugging in your terminal

  // We are temporarily simplifying the query to fetch only from the 'projects' table
  const { data, error } = await supabase
    .from("projects")
    .select(`*`) // The original query had complex joins here
    .eq("id", projectId)
    .single();

  // This error log is the most important part for debugging.
  // Check your terminal where `pnpm run dev` is running if there's an error.
  if (error) {
    console.error("Error fetching project [SIMPLIFIED]:", error);
    return { error: `Database error: ${error.message}` };
  }

  // So the UI doesn't break, we'll add back empty arrays for members and tasks
  const dataWithEmptyRelations = {
    ...data,
    project_members: [],
    tasks: []
  };

  return { data: dataWithEmptyRelations };
}


// ADD THIS NEW FUNCTION TO CREATE A TASK
interface CreateTaskArgs {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: string;
  dueDate?: string;
}

export async function createTaskAction(args: CreateTaskArgs) {
  const { projectId, userId, title, description, assigneeId, priority, dueDate } = args;

  if (!projectId || !userId || !title) {
    return { error: "Project ID, user ID, and task title are required." };
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      created_by: userId,
      title,
      description,
      assignee_id: assigneeId,
      priority,
      due_date: dueDate,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return { error: "Could not create the task." };
  }

  // Revalidate the project detail page to show the new task immediately
  revalidatePath(`/dashboard/projects/${projectId}`);

  return { data };
}
