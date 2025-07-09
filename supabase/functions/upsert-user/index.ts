import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req) => {
  try {
    const { id, name, email } = await req.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Upsert the user with admin privileges (bypassing RLS)
    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        id,
        full_name: name,
        email,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User upserted successfully' 
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