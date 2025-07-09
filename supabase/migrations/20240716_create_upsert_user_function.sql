-- Create a function to upsert users that bypasses RLS
CREATE OR REPLACE FUNCTION upsert_user(
  p_id TEXT,
  p_name TEXT,
  p_email TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO users (id, full_name, email)
  VALUES (p_id, p_name, p_email)
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 