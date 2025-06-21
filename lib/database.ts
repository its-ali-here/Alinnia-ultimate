import { supabase, isSupabaseConfigured } from "./supabase"
import { supabaseAdmin } from "./supabase-server"

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
  role: string
  organization_id?: string
  created_at: string
  updated_at: string
  timezone?: string
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

export interface UserPermissionItem {
  permission_type: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
}

// Profile functions
export async function createProfile(userId: string, fullName: string, email: string): Promise<Profile> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, email: email, full_name: fullName, role: "member" })
    .select()
    .single()

  if (error) {
    console.error("DB:createProfile - Supabase error:", JSON.stringify(error, null, 2))
    if (error.code === "23505") {
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
  const { data, error } = await supabase
    .from("profiles")
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
  const { data, error } = await supabase
    .from("profiles")
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
  orgName: string,
): Promise<Organization> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({ name: orgName, owner_id: ownerId })
    .select()
    .single()

  if (orgError) {
    console.error("DB:createOrganization - Supabase error:", JSON.stringify(orgError, null, 2))
    throw new Error(`DB:createOrganization - ${orgError.message}`)
  }
  await addUserToOrganization(ownerId, org.id, "owner")
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
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user's organization and role:", error);
    return null;
  }
  return data;
}

export async function createOrganizationAndLinkUser(userId: string, orgName: string): Promise<Organization> {
  return createOrganization(userId, orgName)
}

export async function joinOrganizationAndLinkUser(userId: string, orgCode: string): Promise<Organization> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured.")

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
    role: "member",
  })

  if (insertErr) throw insertErr

  return org as Organization
}

// Account functions
export async function getUserAccounts(userId: string): Promise<Account[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("DB:getUserAccounts - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
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
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
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
  const { data, error } = await supabase
    .from("transactions")
    .select(`*, accounts(account_name, account_type)`)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("DB:getUserTransactions - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
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
    transaction_date: string
  },
): Promise<Transaction | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
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
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("category_name")

  if (error) {
    console.error("DB:getUserBudgetCategories - Supabase error:", JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

// ... other functions ...

// Account balance update function
export async function updateAccountBalance(accountId: string, newBalance: number): Promise<Account | null> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
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
): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      joined_at,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        designation
      )
    `)
    .eq("organization_id", organizationId)
    .order("joined_at");

  if (error) {
    console.error("DB:getOrganizationMembers - Supabase error:", JSON.stringify(error, null, 2));
    return [];
  }
  
  return (data || []).filter(member => member.profiles);
}

// ... other organization functions ...

// --- CHAT FUNCTIONS ---

export interface Channel {
  id: string;
  name?: string;
  type: 'dm' | 'group' | 'organization';
  organization_id: string;
  created_at: string;
  created_by?: string;
  other_member?: Profile;
}

export interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  author?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export async function getChannelsForUser(userId: string): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('channel_members')
    .select('channel:channels(*)')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching user channels:", error);
    return [];
  }
  const channels = data.map(item => item.channel) as Channel[];
  return channels;
}

export async function getMessagesForChannel(channelId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('messages')
    .select('*, author:profiles!user_id(id, full_name, avatar_url)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return (data as any) || [];
}

export async function sendMessage(channelId: string, userId: string, content: string): Promise<Message | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      user_id: userId,
      content: content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }
  return data;
}

// Helper function
async function addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("DB Error: Supabase is not configured.")
  const { error } = await supabaseAdmin.from("organization_members").insert({
    user_id: userId,
    organization_id: organizationId,
    role: role,
  })

  if (error) {
    throw new Error(`DB:addUserToOrganization - ${error.message} (Code: ${error.code})`)
  }
}