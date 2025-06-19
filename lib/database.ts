import { supabase, isSupabaseConfigured } from "./supabase"

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
  owner_id: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  role: string // Consider using a specific type: 'owner' | 'admin' | 'member' | 'viewer'
  organization_id?: string
  created_at: string
  updated_at: string
  timezone?: string // Added from updateProfile usage
}

export interface Account {
  id: string
  user_id: string // This might be organization_id or a user_id within an organization context
  account_name: string
  account_type: "checking" | "savings" | "credit" | "investment" | "loan"
  balance: number
  bank_name?: string
  account_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string // This might be organization_id or a user_id
  account_id?: string
  transaction_type: "income" | "expense" | "transfer"
  category: string
  amount: number
  description?: string
  merchant?: string
  transaction_date: string // Should be ISO string or Date
  created_at: string
}

export interface BudgetCategory {
  id: string
  user_id: string // This might be organization_id or a user_id
  category_name: string
  monthly_limit: number
  current_spent: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string // This might be organization_id or a user_id
  goal_name: string
  target_amount: number
  current_amount: number
  target_date?: string // Should be ISO string or Date
  description?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  user_id: string // This might be organization_id or a user_id
  bill_name: string
  amount: number
  due_date: string // Should be ISO string or Date
  category: string
  frequency: "weekly" | "monthly" | "quarterly" | "yearly" | "one-time"
  is_paid: boolean
  auto_pay: boolean
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: string
  organization_id: string
  uploaded_by_user_id: string
  file_name: string
  storage_path: string
  file_size_bytes: number
  file_type: string
  status: "uploading" | "processing" | "ready" | "error"
  row_count?: number
  column_headers?: string[]
  processing_error?: string
  uploaded_at: string
  updated_at: string
}

export interface UserPermissionItem {
  permission_type: string // e.g., 'accounts', 'transactions'
  can_read: boolean
  can_write: boolean
  can_delete: boolean
}

// Profile functions
// In lib/database.ts

export async function createProfile(userId: string, fullName: string, email: string): Promise<Profile> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")

  // The table name has been corrected from "users" to "profiles"
  const { data, error } = await supabase
    .from("profiles") // Corrected table name
    .insert({ id: userId, email: email, full_name: fullName, role: "member" }) // Default role
    .select()
    .single()

  if (error) {
    console.error("DB:createProfile - Supabase error:", JSON.stringify(error, null, 2))
    if (error.code === "23505") {
      // Unique constraint violation
      console.warn(
        `DB:createProfile - Profile for user ${userId} or email ${email} likely already exists. Attempting to fetch.`,
      )
      const existing = await getProfile(userId)
      if (existing) return existing
      throw new Error(`DB:createProfile - User already exists but could not be fetched. ${error.message}`)
    }
    throw new Error(`DB:createProfile - ${error.message} (Code: ${error.code})`)
  }
  return data
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    console.warn("DB:getProfile - Supabase not configured, returning demo data.")
    return {
      id: userId,
      email: "demo@example.com",
      full_name: "Demo User",
      role: "member",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  // Interacting with 'users' table
  const { data, error } = await supabase
    .from("profiles") // Verify this table name
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("DB:getProfile - Supabase error:", JSON.stringify(error, null, 2))
    return null
  }
  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "phone" | "timezone">>,
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    console.warn("DB:updateProfile - Supabase not configured.")
    return null
  }
  // Interacting with 'users' table (assuming profiles are in 'users')
  const { data, error } = await supabase
    .from("profiles") // Verify this table name
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("DB:updateProfile - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Organization functions
export async function createOrganization(
  ownerId: string,
  orgName: string, // Simplified orgData to just orgName
): Promise<Organization> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'organizations' table
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, owner_id: ownerId }) // No organization_code inserted
    .select()
    .single()

  if (orgError) {
    console.error("DB:createOrganization - Supabase error:", JSON.stringify(orgError, null, 2))
    throw new Error(`DB:createOrganization - ${orgError.message}`)
  }

  try {
    await addUserToOrganization(ownerId, org.id, "owner")
    // Update the user's profile with the organization_id and role
    await supabase.from("profiles").update({ organization_id: org.id, role: "owner" }).eq("id", ownerId)
  } catch (linkError) {
    const errorMessage = `DB:createOrganization - Organization record created (ID: ${org.id}), but failed to link owner or update profile: ${(linkError as Error).message}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
  return org
}

// Fetch all organizations a user belongs to
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  if (!isSupabaseConfigured()) return []

  // Join organization_members ➜ organizations via the FK relationship
  const { data, error } = await supabase
    .from("organization_members")
    .select("organizations (*)") // returns { organizations: { … } }
    .eq("user_id", userId)

  if (error) {
    console.error("DB:getUserOrganizations – Supabase error:", JSON.stringify(error, null, 2))
    return []
  }

  // Flatten the nested structure and remove any nulls
  return (data ?? []).map((row: any) => row.organizations).filter(Boolean)
}

// Account functions
export async function getUserAccounts(userId: string): Promise<Account[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'accounts' table
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId) // This assumes accounts are directly linked to users. Adjust if linked to organization.
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("DB:getUserAccounts - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createAccount(
  userId: string, // Or organizationId
  accountData: {
    account_name: string
    account_type: Account["account_type"]
    balance?: number
    bank_name?: string
    account_number?: string
  },
): Promise<Account | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'accounts' table
  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: userId, ...accountData })
    .select()
    .single()

  if (error) {
    console.error("DB:createAccount - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Transaction functions
export async function getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'transactions' table
  const { data, error } = await supabase
    .from("transactions")
    .select(`*, accounts(account_name, account_type)`)
    .eq("user_id", userId) // Adjust if linked to organization
    .order("transaction_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("DB:getUserTransactions - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createTransaction(
  userId: string, // Or organizationId
  transactionData: {
    account_id?: string
    transaction_type: Transaction["transaction_type"]
    category: string
    amount: number
    description?: string
    merchant?: string
    transaction_date: string // Ensure this is ISO string
  },
): Promise<Transaction | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'transactions' table
  const { data, error } = await supabase
    .from("transactions")
    .insert({ user_id: userId, ...transactionData })
    .select()
    .single()

  if (error) {
    console.error("DB:createTransaction - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Budget functions
export async function getUserBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'budget_categories' table
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("user_id", userId) // Adjust if linked to organization
    .eq("is_active", true)
    .order("category_name")

  if (error) {
    console.error("DB:getUserBudgetCategories - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createBudgetCategory(
  userId: string, // Or organizationId
  categoryData: {
    category_name: string
    monthly_limit: number
    color?: string
  },
): Promise<BudgetCategory | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'budget_categories' table
  const { data, error } = await supabase
    .from("budget_categories")
    .insert({ user_id: userId, ...categoryData })
    .select()
    .single()

  if (error) {
    console.error("DB:createBudgetCategory - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Savings goals functions
export async function getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'savings_goals' table
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId) // Adjust if linked to organization
    .order("created_at", { ascending: false })

  if (error) {
    console.error("DB:getUserSavingsGoals - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createSavingsGoal(
  userId: string, // Or organizationId
  goalData: {
    goal_name: string
    target_amount: number
    target_date?: string
    description?: string
  },
): Promise<SavingsGoal | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'savings_goals' table
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({ user_id: userId, ...goalData })
    .select()
    .single()

  if (error) {
    console.error("DB:createSavingsGoal - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Bills functions
export async function getUserBills(userId: string): Promise<Bill[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'bills' table
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", userId) // Adjust if linked to organization
    .order("due_date")

  if (error) {
    console.error("DB:getUserBills - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createBill(
  userId: string, // Or organizationId
  billData: {
    bill_name: string
    amount: number
    due_date: string // Ensure ISO string
    category: string
    frequency?: Bill["frequency"]
  },
): Promise<Bill | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'bills' table
  const { data, error } = await supabase
    .from("bills")
    .insert({ user_id: userId, ...billData })
    .select()
    .single()

  if (error) {
    console.error("DB:createBill - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Account balance update function - THIS IS THE EXPORT IN QUESTION
export async function updateAccountBalance(accountId: string, newBalance: number): Promise<Account | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'accounts' table
  const { data, error } = await supabase
    .from("accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", accountId)
    .select()
    .single()

  if (error) {
    console.error("DB:updateAccountBalance - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Mark bill as paid function
export async function markBillAsPaid(billId: string): Promise<Bill | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'bills' table
  const { data, error } = await supabase
    .from("bills")
    .update({ is_paid: true, updated_at: new Date().toISOString() })
    .eq("id", billId)
    .select()
    .single()

  if (error) {
    console.error("DB:markBillAsPaid - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Organization members functions
export async function getOrganizationMembers(
  organizationId: string,
): Promise<{ id: string; role: string; joined_at: string; invited_by: string | null; profiles: Profile | null }[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'organization_members' and 'users' tables
  const { data, error } = await supabase
    .from("organization_members")
    .select(`id, role, joined_at, invited_by, profiles:profiles (*)`) // Ensure 'users' is correct table name
    .eq("organization_id", organizationId)
    .order("joined_at")

  if (error) {
    console.error("DB:getOrganizationMembers - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function inviteMember(
  organizationId: string,
  email: string,
  role: string,
  invitedByUserId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'users' and 'organization_members' tables
  const { data: userData, error: userError } = await supabase
    .from("profiles") // Ensure 'users' is correct table name
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (userError) {
    console.error("DB:inviteMember - Error finding user by email:", JSON.stringify(userError, null, 2))
    throw new Error(`DB:inviteMember - Error finding user: ${userError.message}`)
  }
  if (!userData) {
    throw new Error(`DB:inviteMember - User with email ${email} not found.`)
  }

  const { error: inviteError } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: userData.id,
    role,
    invited_by: invitedByUserId,
  })

  if (inviteError) {
    console.error("DB:inviteMember - Error inviting member:", JSON.stringify(inviteError, null, 2))
    throw new Error(`DB:inviteMember - ${inviteError.message}`)
  }
}

export async function updateMemberRole(
  memberId: string, // This should be organization_member_id
  newRole: string,
): Promise<any | null> {
  // Define a proper return type
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'organization_members' table
  const { data, error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", memberId) // 'id' here refers to the primary key of 'organization_members' table
    .select()
    .single()

  if (error) {
    console.error("DB:updateMemberRole - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

export async function removeMember(memberId: string): Promise<void> {
  // This should be organization_member_id
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'organization_members' table
  const { error } = await supabase.from("organization_members").delete().eq("id", memberId) // 'id' here refers to the primary key of 'organization_members' table

  if (error) {
    console.error("DB:removeMember - Supabase error:", JSON.stringify(error, null, 2))
    throw new Error(`DB:removeMember - ${error.message}`)
  }
}

// Permissions functions
export async function getUserPermissions(organizationId: string, userId: string): Promise<UserPermissionItem[]> {
  if (!isSupabaseConfigured()) {
    const defaultPermissionTypes = ["accounts", "transactions", "budgets", "reports", "settings", "members", "files"]
    return defaultPermissionTypes.map((pt) => ({
      permission_type: pt,
      can_read: false,
      can_write: false,
      can_delete: false,
    }))
  }
  // Interacting with 'user_permissions' table
  const { data, error } = await supabase
    .from("user_permissions")
    .select("permission_type, can_read, can_write, can_delete")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)

  if (error) {
    console.error("DB:getUserPermissions - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data || []
}

export async function updatePermission(
  organizationId: string,
  targetUserId: string,
  permissionType: string,
  newPermissions: { can_read: boolean; can_write: boolean; can_delete: boolean },
  actingUserId: string,
): Promise<UserPermissionItem | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'user_permissions' table
  const { data, error } = await supabase
    .from("user_permissions")
    .upsert(
      {
        organization_id: organizationId,
        user_id: targetUserId,
        permission_type: permissionType,
        ...newPermissions,
        granted_by_user_id: actingUserId,
      },
      { onConflict: "organization_id,user_id,permission_type" },
    )
    .select("permission_type, can_read, can_write, can_delete")
    .single()

  if (error) {
    console.error("DB:updatePermission - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

// Helper functions
async function addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'organization_members' table
  const { error } = await supabase.from("organization_members").insert({
    user_id: userId,
    organization_id: organizationId,
    role: role,
  })

  if (error) {
    console.error(
      `DB:addUserToOrganization - Supabase error for user ${userId}, org ${organizationId}:`,
      JSON.stringify(error, null, 2),
    )
    throw new Error(`DB:addUserToOrganization - ${error.message} (Code: ${error.code})`)
  }
}

// Uploaded Files functions
export async function createUploadedFileRecord(
  organizationId: string,
  uploaderUserId: string,
  fileDetails: {
    fileName: string
    storagePath: string
    fileSizeBytes: number
    fileType: string
  },
): Promise<UploadedFile | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'uploaded_files' table
  const { data, error } = await supabase
    .from("uploaded_files")
    .insert({
      organization_id: organizationId,
      uploaded_by_user_id: uploaderUserId,
      file_name: fileDetails.fileName,
      storage_path: fileDetails.storagePath,
      file_size_bytes: fileDetails.fileSizeBytes,
      file_type: fileDetails.fileType,
      status: "uploading",
    })
    .select()
    .single()

  if (error) {
    console.error("DB:createUploadedFileRecord - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

export async function updateUploadedFileStatus(
  fileId: string,
  status: UploadedFile["status"],
  updates?: Partial<Pick<UploadedFile, "rowCount" | "columnHeaders" | "processingError">>,
): Promise<UploadedFile | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'uploaded_files' table
  const { data, error } = await supabase
    .from("uploaded_files")
    .update({ status, ...updates, updated_at: new Date().toISOString() })
    .eq("id", fileId)
    .select()
    .single()

  if (error) {
    console.error("DB:updateUploadedFileStatus - Supabase error:", JSON.stringify(error, null, 2))
    throw error
  }
  return data
}

export async function getUploadedFilesForOrganization(organizationId: string): Promise<UploadedFile[]> {
  if (!isSupabaseConfigured()) return []
  // Interacting with 'uploaded_files' table
  const { data, error } = await supabase
    .from("uploaded_files")
    .select("*")
    .eq("organization_id", organizationId)
    .order("uploaded_at", { ascending: false })

  if (error) {
    console.error("DB:getUploadedFilesForOrganization - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function deleteUploadedFileRecord(fileId: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  // Interacting with 'uploaded_files' table
  const { error } = await supabase.from("uploaded_files").delete().eq("id", fileId)
  if (error) {
    console.error("DB:deleteUploadedFileRecord - Supabase error:", JSON.stringify(error, null, 2))
    throw new Error(`DB:deleteUploadedFileRecord - ${error.message}`)
  }
}
