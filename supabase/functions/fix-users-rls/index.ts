import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Enable RLS on users table
    await supabaseAdmin.rpc('alter_table_users_enable_rls');
    
    // Drop existing policies if they exist
    await supabaseAdmin.rpc('drop_policy_if_exists', { 
      policy_name: 'Allow all inserts on users',
      table_name: 'users'
    });
    
    // Create insert policy with correct syntax
    const { error: insertError } = await supabaseAdmin.rpc('create_insert_policy_for_users');
    
    if (insertError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: insertError.message 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'RLS policies for users table successfully updated' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 