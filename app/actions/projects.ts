"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

// --- (The first 3 functions: createProjectAction, getProjectsForOrganizationAction, and getProjectByIdAction remain the same as the last correct version) ---

export async function createProjectAction(args: any) {
  // ... existing code
  const { organizationId, userId, name, description, dueDate } = args;
  if (!organizationId || !userId || !name) {
    return { error: "Organization ID, user ID, and project name are required." };
  }
  const supabase = createSupabaseAdminClient();
  const { data: projectData, error: projectError } = await supabase.from("projects").insert({ organization_id: organizationId, created_by: userId, name, description, due_date: dueDate }).select().single();
  if (projectError) {
    console.error("Error creating project:", projectError);
    return { error: "Could not create the project." };
  }
  const { error: memberError } = await supabase.from("project_members").insert({ project_id: projectData.id, user_id: userId, role: 'lead' });
  if (memberError) {
    console.error("Error adding project member:", memberError);
    return { error: "Could not add member to the project." };
  }
  revalidatePath("/dashboard/projects");
  return { data: projectData };
}

export async function getProjectsForOrganizationAction(organizationId: string) {
  // ... existing code
   if (!organizationId) {
    return { error: "Organization ID is required." };
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("projects").select(`id, name, description, status, due_date, project_members ( profiles ( id, full_name, avatar_url ) )`).eq("organization_id", organizationId).order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching projects:", error);
    return { error: "Could not fetch projects." };
  }
  const projectsWithProgress = data.map(p => ({ ...p, progress: Math.floor(Math.random() * 100) }));
  return { data: projectsWithProgress };
}

export async function getProjectByIdAction(projectId: string) {
  if (!projectId) {
    return { error: "Project ID is required." };
  }

  const supabase = createSupabaseAdminClient();

  // Step 1: Fetch the main project details
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(`id, name, description, status, due_date, created_at`)
    .eq("id", projectId)
    .single();

  if (projectError || !projectData) {
    console.error("Error fetching project in server action:", JSON.stringify(projectError, null, 2));
    return { error: "Could not find the specified project." };
  }

  // Step 2: Fetch the project members and their profiles
  const { data: membersData, error: membersError } = await supabase
    .from("project_members")
    .select(`
      role,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("project_id", projectId);

  if (membersError) {
    console.error("Error fetching project members:", membersError);
    return { error: "Could not fetch project members." };
  }

  // Step 3: Fetch the tasks for the project and their assignees
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles (
          id,
          full_name,
          avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return { error: "Could not fetch project tasks." };
  }

  // Step 4: Combine all the data into a single object
  const fullProjectData = {
    ...projectData,
    project_members: membersData || [],
    tasks: tasksData || [],
  };

  return { data: fullProjectData };
}


// --- (The createTaskAction and updateTaskStatusAction functions also remain the same) ---
export async function createTaskAction(args: any) {
    // ... existing code
    const { projectId, userId, title, description, assigneeId, priority, dueDate } = args;
    if (!projectId || !userId || !title) { return { error: "Project ID, user ID, and task title are required." }; }
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("tasks").insert({ project_id: projectId, created_by: userId, title, description, assignee_id: assigneeId, priority, due_date: dueDate }).select().single();
    if (error) { console.error("Error creating task:", error); return { error: "Could not create the task." }; }
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { data };
}

export async function updateTaskStatusAction(args: any) {
    // ... existing code
    const { projectId, taskId, status } = args;
    if (!projectId || !taskId || !status) { return { error: "Project ID, Task ID, and status are required." }; }
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("tasks").update({ status: status, updated_at: new Date().toISOString() }).eq("id", taskId);
    if (error) { console.error("Error updating task status:", error); return { error: "Could not update the task status." }; }
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { data: { success: true } };
}

// --- ADD THE TWO NEW FUNCTIONS BELOW ---

/**
 * Fetches members of an organization who are not already in a specific project.
 */
export async function getOrganizationMembersForProjectInviteAction(organizationId: string, projectId: string) {
  if (!organizationId || !projectId) {
    return { error: "Organization and Project IDs are required." };
  }
  const supabase = createSupabaseAdminClient();

  // First, get IDs of users already in the project
  const { data: projectMemberIdsData, error: projectMemberIdsError } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId);

  if (projectMemberIdsError) {
    console.error("Error fetching project member IDs:", projectMemberIdsError);
    return { error: "Could not fetch project members." };
  }
  const existingMemberIds = projectMemberIdsData.map(m => m.user_id);

  // Then, get all members of the organization, excluding those already in the project
  const { data, error } = await supabase
    .from("organization_members")
    .select(`profiles (id, full_name, avatar_url)`)
    .eq("organization_id", organizationId)
    .not("user_id", "in", `(${existingMemberIds.join(',')})`);
  
  if (error) {
    console.error("Error fetching organization members:", error);
    return { error: "Could not fetch organization members." };
  }

  // Flatten the result to return just the profiles
  return { data: data.map(m => m.profiles).filter(Boolean) };
}

/**
 * Adds a new member to a specific project.
 */
export async function addMemberToProjectAction(projectId: string, userId: string) {
  if (!projectId || !userId) {
    return { error: "Project ID and User ID are required." };
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
      role: 'member', // Default role for new members
    })
    .select()
    .single();

  if (error) {
    // Handle the case where the user is already a member
    if (error.code === '23505') { 
      return { error: "This user is already a member of the project." };
    }
    console.error("Error adding member to project:", error);
    return { error: "Could not add member to project." };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { data };
}