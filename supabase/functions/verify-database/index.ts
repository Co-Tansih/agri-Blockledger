
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user_role enum exists
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'user_role' })
      .single();

    // Check if profiles table exists and has correct structure
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, district, state')
      .limit(1);

    // Check if trigger function exists
    const { data: functionData, error: functionError } = await supabase
      .rpc('check_function_exists', { function_name: 'handle_new_user' })
      .single();

    const verification = {
      enum_exists: !enumError,
      table_accessible: !tableError,
      function_exists: !functionError,
      timestamp: new Date().toISOString()
    };

    console.log('Database verification:', verification);

    return new Response(
      JSON.stringify({
        success: true,
        verification,
        details: {
          enum_error: enumError?.message,
          table_error: tableError?.message,
          function_error: functionError?.message
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Database verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
