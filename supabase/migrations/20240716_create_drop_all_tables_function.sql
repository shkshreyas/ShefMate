-- Create a function to drop all tables in the public schema
CREATE OR REPLACE FUNCTION drop_all_tables()
RETURNS void AS $$
DECLARE
    stmt TEXT;
BEGIN
    -- Disable triggers temporarily
    SET session_replication_role = 'replica';
    
    -- Drop all tables in public schema
    FOR stmt IN 
        SELECT 'DROP TABLE IF EXISTS "' || tablename || '" CASCADE;' 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE stmt;
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 