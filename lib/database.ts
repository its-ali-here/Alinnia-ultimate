import { supabase, isSupabaseConfigured } from "./supabase"

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
  role: string
  organization_id?: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
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
  user_id: string
  account_id?: string
  transaction_type: "income" | "expense" | "transfer"
  category: string
  amount: number
  description?: string
  merchant?: string
  transaction_date: string
  created_at: string
}

export interface BudgetCategory {
  id: string
  user_id: string
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
  user_id: string
  goal_name: string
  target_amount: number
  current_amount: number
  target_date?: string
  description?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  user_id: string
  bill_name: string
  amount: number
  due_date: string
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
  permission_type: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
}

// Profile functions
export async function createProfile(userId: string, fullName: string, email: string): Promise<Profile> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      email: email,
      full_name: fullName,
    })
    .select()
    .single()

  if (error) {
    // Check for unique constraint violation
    if (error.code === "23505") {
      console.warn(`Profile for user ${userId} already exists.`)
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.error("Error fetching existing profile:", fetchError)
        throw new Error(`Failed to fetch existing profile: ${fetchError.message}`)
      }
      return existingProfile
    }
    console.error("Error creating profile:", error)
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return data
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: userId,
      email: "demo@example.com",
      full_name: "Demo User",
      role: "member",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error getting profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Database error in getProfile:", error)
    return null
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "phone" | "timezone">>,
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Cannot update profile: Supabase is not configured")
    return null
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updateProfile:", error)
    throw error
  }
}

// Organization functions
export async function createOrganization(
  ownerId: string,
  orgData: {
    name: string
    email: string
    phone?: string
    industry: string
    city: string
    country: string
  },
): Promise<Organization> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  const organizationCode = generateOrganizationCode()

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: orgData.name,
      email: orgData.email,
      phone: orgData.phone,
      industry: orgData.industry,
      city: orgData.city,
      country: orgData.country,
      organization_code: organizationCode,
      owner_id: ownerId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating organization:", error)
    throw new Error(`Failed to create organization: ${error.message}`)
  }

  // Add the owner as a member of the organization
  await addUserToOrganization(ownerId, data.id, "owner")

  return data
}

export async function getOrganizationByCode(code: string): Promise<Organization> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("organization_code", code.toUpperCase())
    .single()

  if (error) {
    console.error("Error getting organization by code:", error)
    throw new Error(`Organization not found: ${error.message}`)
  }

  return data
}

export async function joinOrganizationByCode(userId: string, code: string): Promise<void> {
  const organization = await getOrganizationByCode(code)
  await addUserToOrganization(userId, organization.id, "member")
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      organizations (
        id,
        name,
        email,
        phone,
        industry,
        city,
        country,
        organization_code,
        created_at,
        owner_id
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error getting user organizations:", error)
    return []
  }

  return data.map((item: any) => item.organizations).filter(Boolean)
}

// Account functions
export async function getUserAccounts(userId: string): Promise<Account[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting user accounts:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserAccounts:", error)
    return []
  }
}

export async function createAccount(
  userId: string,
  accountData: {
    account_name: string
    account_type: Account["account_type"]
    balance?: number
    bank_name?: string
    account_number?: string
  },
): Promise<Account | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        ...accountData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating account:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createAccount:", error)
    throw error
  }
}

// Transaction functions
export async function getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        accounts(account_name, account_type)
      `)
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error getting user transactions:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserTransactions:", error)
    return []
  }
}

export async function createTransaction(
  userId: string,
  transactionData: {
    account_id?: string
    transaction_type: Transaction["transaction_type"]
    category: string
    amount: number
    description?: string
    merchant?: string
  },
): Promise<Transaction | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        ...transactionData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createTransaction:", error)
    throw error
  }
}

// Budget functions
export async function getUserBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("category_name")

    if (error) {
      console.error("Error getting budget categories:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserBudgetCategories:", error)
    return []
  }
}

export async function createBudgetCategory(
  userId: string,
  categoryData: {
    category_name: string
    monthly_limit: number
    color?: string
  },
): Promise<BudgetCategory | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        user_id: userId,
        ...categoryData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating budget category:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createBudgetCategory:", error)
    throw error
  }
}

// Savings goals functions
export async function getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting savings goals:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserSavingsGoals:", error)
    return []
  }
}

export async function createSavingsGoal(
  userId: string,
  goalData: {
    goal_name: string
    target_amount: number
    target_date?: string
    description?: string
  },
): Promise<SavingsGoal | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: userId,
        ...goalData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating savings goal:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createSavingsGoal:", error)
    throw error
  }
}

// Bills functions
export async function getUserBills(userId: string): Promise<Bill[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase.from("bills").select("*").eq("user_id", userId).order("due_date")

    if (error) {
      console.error("Error getting user bills:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserBills:", error)
    return []
  }
}

export async function createBill(
  userId: string,
  billData: {
    bill_name: string
    amount: number
    due_date: string
    category: string
    frequency?: Bill["frequency"]
  },
): Promise<Bill | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("bills")
      .insert({
        user_id: userId,
        ...billData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating bill:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createBill:", error)
    throw error
  }
}

// Account balance update function
export async function updateAccountBalance(accountId: string, newBalance: number): Promise<Account | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId)
      .select()
      .single()

    if (error) {
      console.error("Error updating account balance:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updateAccountBalance:", error)
    throw error
  }
}

// Mark bill as paid function
export async function markBillAsPaid(billId: string): Promise<Bill | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("bills")
      .update({
        is_paid: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", billId)
      .select()
      .single()

    if (error) {
      console.error("Error marking bill as paid:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in markBillAsPaid:", error)
    throw error
  }
}

// Organization members functions
export async function getOrganizationMembers(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        id, role, joined_at, invited_by,
        profiles:users (id, full_name, email, avatar_url)
      `)
      .eq("organization_id", organizationId)
      .order("joined_at")

    if (error) {
      console.error("Error getting organization members:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getOrganizationMembers:", error)
    return []
  }
}

export async function inviteMember(organizationId: string, email: string, role: string, invitedBy: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    // First check if user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (userError || !userData) {
      console.error("Error finding user:", userError)
      throw new Error("User not found")
    }

    const { error } = await supabase.from("organization_members").insert({
      organization_id: organizationId,
      user_id: userData.id,
      role,
      invited_by: invitedBy,
    })

    if (error) {
      console.error("Error inviting member:", error)
      throw error
    }
  } catch (error) {
    console.error("Database error in inviteMember:", error)
    throw error
  }
}

export async function updateMemberRole(memberId: string, newRole: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId)
      .select()
      .single()

    if (error) {
      console.error("Error updating member role:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updateMemberRole:", error)
    throw error
  }
}

export async function removeMember(memberId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase.from("organization_members").delete().eq("id", memberId)

    if (error) {
      console.error("Error removing member:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in removeMember:", error)
    throw error
  }
}

// Permissions functions (Refactored to align with PermissionsPage.tsx)
export async function getUserPermissions(organizationId: string, userId: string): Promise<UserPermissionItem[]> {
  if (!isSupabaseConfigured()) {
    // For UI consistency, provide all permission types with default false values
    const defaultPermissionTypes = ["accounts", "transactions", "budgets", "reports", "settings"]
    return defaultPermissionTypes.map((pt) => ({
      permission_type: pt,
      can_read: false,
      can_write: false,
      can_delete: false,
    }))
  }

  try {
    const { data, error } = await supabase
      .from("user_permissions")
      .select("permission_type, can_read, can_write, can_delete")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error getting user permissions:", error)
      throw error // Re-throw to be caught by calling component
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserPermissions:", error)
    throw error
  }
}

export async function updatePermission(
  organizationId: string,
  targetUserId: string,
  permissionType: string,
  newPermissions: { can_read: boolean; can_write: boolean; can_delete: boolean },
  actingUserId: string, // User performing the action
): Promise<UserPermissionItem | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { data, error } = await supabase
      .from("user_permissions")
      .upsert(
        {
          organization_id: organizationId,
          user_id: targetUserId,
          permission_type: permissionType,
          can_read: newPermissions.can_read,
          can_write: newPermissions.can_write,
          can_delete: newPermissions.can_delete,
          granted_by_user_id: actingUserId,
          // updated_at is handled by trigger or default
        },
        {
          onConflict: "organization_id,user_id,permission_type",
        },
      )
      .select("permission_type, can_read, can_write, can_delete")
      .single()

    if (error) {
      console.error("Error updating permission:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updatePermission:", error)
    throw error
  }
}

// Helper functions
async function addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }

  try {
    const { error } = await supabase.from("organization_members").insert({
      user_id: userId,
      organization_id: organizationId,
      role: role,
    })

    if (error) {
      console.error("Organization member creation error:", error)
      throw new Error(`Failed to add user to organization: ${error.message}`)
    }
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

function generateOrganizationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .insert({
        organization_id: organizationId,
        uploaded_by_user_id: uploaderUserId,
        file_name: fileDetails.fileName,
        storage_path: fileDetails.storagePath,
        file_size_bytes: fileDetails.fileSizeBytes,
        file_type: fileDetails.fileType,
        status: "uploading", // Initial status
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating uploaded file record:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in createUploadedFileRecord:", error)
    throw error
  }
}

export async function updateUploadedFileStatus(
  fileId: string,
  status: UploadedFile["status"],
  updates?: Partial<Pick<UploadedFile, "rowCount" | "columnHeaders" | "processingError">>,
): Promise<UploadedFile | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .update({ status, ...updates, updated_at: new Date().toISOString() }) // Ensure updated_at is set
      .eq("id", fileId)
      .select()
      .single()

    if (error) {
      console.error("Error updating file status:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updateUploadedFileStatus:", error)
    throw error
  }
}

export async function getUploadedFilesForOrganization(organizationId: string): Promise<UploadedFile[]> {
  if (!isSupabaseConfigured()) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("organization_id", organizationId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error getting uploaded files for organization:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUploadedFilesForOrganization:", error)
    return []
  }
}

export async function deleteUploadedFileRecord(fileId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not available: Supabase is not configured")
  }
  // Note: This only deletes the metadata record. Actual file in storage needs separate handling.
  const { error } = await supabase.from("uploaded_files").delete().eq("id", fileId)
  if (error) {
    console.error("Error deleting uploaded file record:", error)
    throw error
  }
}
