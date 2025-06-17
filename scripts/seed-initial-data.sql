-- Insert some default budget categories for new users
-- This will be useful for demo purposes

-- Function to create default budget categories for a user
CREATE OR REPLACE FUNCTION create_default_budget_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO budget_categories (user_id, category_name, monthly_limit, color) VALUES
    (user_uuid, 'Food & Dining', 500.00, '#EF4444'),
    (user_uuid, 'Transportation', 300.00, '#F59E0B'),
    (user_uuid, 'Shopping', 200.00, '#8B5CF6'),
    (user_uuid, 'Entertainment', 150.00, '#06B6D4'),
    (user_uuid, 'Bills & Utilities', 800.00, '#10B981'),
    (user_uuid, 'Healthcare', 200.00, '#F97316'),
    (user_uuid, 'Education', 100.00, '#3B82F6'),
    (user_uuid, 'Travel', 300.00, '#EC4899')
  ON CONFLICT (user_id, category_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to include default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Create default budget categories
  PERFORM create_default_budget_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
