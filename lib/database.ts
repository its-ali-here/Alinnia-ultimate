import { supabase } from "./supabase"

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
  user_id: string
  full_name: string
  created_at: string
  updated_at: string
}

// Profile functions
// in lib/database.ts

export async function createProfile(userId: string, fullName: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      full_name: fullName,
    })
    .select()
    .single()

  if (error) {
    // Check for unique constraint violation, which can happen in a race condition
    // if the user somehow triggers this twice.
    if (error.code === '23505') { 
        console.warn(`Profile for user ${userId} already exists.`);
        // If profile already exists, we can fetch it and return it to proceed gracefully.
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (fetchError) {
             console.error("Error fetching existing profile:", fetchError);
             throw new Error(`Failed to fetch existing profile: ${fetchError.message}`);
        }
        return existingProfile;
    }
    console.error("Error creating profile:", error)
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return data
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle() // Use maybeSingle instead of single to handle no rows

    if (error) {
      console.error("Error getting profile:", error)
      throw error
    }

    // If no profile exists, return a default profile structure
    if (!data) {
      return {
        id: userId,
        full_name: "",
        avatar_url: "",
        phone: "",
        timezone: "utc+0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return data
  } catch (error) {
    console.error("Database error in getProfile:", error)
    // Return a default profile on error to prevent crashes
    return {
      id: userId,
      full_name: "",
      avatar_url: "",
      phone: "",
      timezone: "utc+0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string
    avatar_url?: string
    phone?: string
    timezone?: string
  },
) {
  try {
    // First check if profile exists
    const existingProfile = await getProfile(userId)

    if (!existingProfile || existingProfile.full_name === "Demo User") {
      // Create profile if it doesn't exist
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          ...updates,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        throw error
      }
      return data
    } else {
      // Update existing profile
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
    }
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
  // First, get the organization
  const organization = await getOrganizationByCode(code)

  // Add user to the organization
  await addUserToOrganization(userId, organization.id, "member")
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
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
    throw new Error(`Failed to get organizations: ${error.message}`)
  }

  return data.map((item: any) => item.organizations)
}

// Organization members functions
export async function getOrganizationMembers(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        *,
        profiles(id, full_name, avatar_url)
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
  try {
    // First check if user exists
    const { data: userData, error: userError } = await supabase
      .from("profiles")
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
  try {
    const { data, error } = await supabase.from("organization_members").update({ role: newRole }).eq("id", memberId)

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

// Permissions functions
export async function getUserPermissions(organizationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error getting user permissions:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Database error in getUserPermissions:", error)
    return []
  }
}

export async function updatePermission(
  organizationId: string,
  userId: string,
  permissionType: string,
  permissions: {
    can_read?: boolean
    can_write?: boolean
    can_delete?: boolean
  },
  grantedBy: string,
) {
  try {
    const { data, error } = await supabase.from("permissions").upsert({
      organization_id: organizationId,
      user_id: userId,
      permission_type: permissionType,
      ...permissions,
      granted_by: grantedBy,
      updated_at: new Date().toISOString(),
    })

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

// Account functions
export async function getUserAccounts(userId: string) {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
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
    account_type: string
    balance?: number
    bank_name?: string
    account_number?: string
  },
) {
  try {
    const { data, error } = await supabase.from("accounts").insert({
      user_id: userId,
      ...accountData,
    })

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

export async function updateAccountBalance(accountId: string, newBalance: number) {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", accountId)

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

// Transaction functions
export async function getUserTransactions(userId: string, limit = 10) {
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
    transaction_type: string
    category: string
    amount: number
    description?: string
    merchant?: string
  },
) {
  try {
    const { data, error } = await supabase.from("transactions").insert({
      user_id: userId,
      ...transactionData,
    })

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
export async function getUserBudgetCategories(userId: string) {
  try {
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", userId)
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
) {
  try {
    const { data, error } = await supabase.from("budget_categories").insert({
      user_id: userId,
      ...categoryData,
    })

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
export async function getUserSavingsGoals(userId: string) {
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
) {
  try {
    const { data, error } = await supabase.from("savings_goals").insert({
      user_id: userId,
      ...goalData,
    })

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

export async function updateSavingsGoal(goalId: string, currentAmount: number) {
  try {
    const { data, error } = await supabase
      .from("savings_goals")
      .update({ current_amount: currentAmount, updated_at: new Date().toISOString() })
      .eq("id", goalId)

    if (error) {
      console.error("Error updating savings goal:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Database error in updateSavingsGoal:", error)
    throw error
  }
}

// Bills functions
export async function getUserBills(userId: string) {
  try {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", userId)
      .eq("is_paid", false)
      .order("due_date")

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
    frequency?: string
  },
) {
  try {
    const { data, error } = await supabase.from("bills").insert({
      user_id: userId,
      ...billData,
    })

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

export async function markBillAsPaid(billId: string) {
  try {
    const { data, error } = await supabase
      .from("bills")
      .update({ is_paid: true, updated_at: new Date().toISOString() })
      .eq("id", billId)

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

async function addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
  try {
    const { error } = await supabase.from("organization_members").insert({
      user_id: userId,
      organization_id: organizationId,
      role: role,
      joined_at: new Date().toISOString(),
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

// Helper function to generate a random organization code
function generateOrganizationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
