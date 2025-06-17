-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on auth.users (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  industry TEXT,
  city TEXT,
  country TEXT,
  organization_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, user_id)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id, permission_type)
);

-- Create accounts table for financial accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'loan')),
  balance DECIMAL(15,2) DEFAULT 0.00,
  bank_name TEXT,
  account_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  merchant TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  monthly_limit DECIMAL(15,2) NOT NULL,
  current_spent DECIMAL(15,2) DEFAULT 0.00,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_name)
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  target_date DATE,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly', 'one-time')),
  is_paid BOOLEAN DEFAULT false,
  auto_pay BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organization owners can update" ON organizations;
CREATE POLICY "Organization owners can update" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- RLS Policies for organization_members
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join organizations" ON organization_members;
CREATE POLICY "Users can join organizations" ON organization_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for permissions
DROP POLICY IF EXISTS "Users can view permissions in their organizations" ON permissions;
CREATE POLICY "Users can view permissions in their organizations" ON permissions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organization admins can manage permissions" ON permissions;
CREATE POLICY "Organization admins can manage permissions" ON permissions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for accounts
DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transactions
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for budget_categories
DROP POLICY IF EXISTS "Users can manage own budget categories" ON budget_categories;
CREATE POLICY "Users can manage own budget categories" ON budget_categories
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for savings_goals
DROP POLICY IF EXISTS "Users can manage own savings goals" ON savings_goals;
CREATE POLICY "Users can manage own savings goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for bills
DROP POLICY IF EXISTS "Users can manage own bills" ON bills;
CREATE POLICY "Users can manage own bills" ON bills
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(organization_code);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_permissions_org_user ON permissions(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update budget spending
CREATE OR REPLACE FUNCTION update_budget_spending()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget category spending when a transaction is added/updated/deleted
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE budget_categories 
    SET current_spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions 
      WHERE user_id = NEW.user_id 
        AND category = budget_categories.category_name
        AND transaction_type = 'expense'
        AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    )
    WHERE user_id = NEW.user_id AND category_name = NEW.category;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE budget_categories 
    SET current_spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions 
      WHERE user_id = OLD.user_id 
        AND category = budget_categories.category_name
        AND transaction_type = 'expense'
        AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    )
    WHERE user_id = OLD.user_id AND category_name = OLD.category;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget spending updates
DROP TRIGGER IF EXISTS update_budget_spending_trigger ON transactions;
CREATE TRIGGER update_budget_spending_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spending();
