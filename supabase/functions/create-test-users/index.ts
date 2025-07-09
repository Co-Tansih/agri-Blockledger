
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create a Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const testUsers = [
      { email: 'farmer@test.com', password: 'password', role: 'farmer', full_name: 'Test Farmer' },
      { email: 'broker@test.com', password: 'password', role: 'broker', full_name: 'Test Broker' },
      { email: 'mnc@test.com', password: 'password', role: 'mnc', full_name: 'Test MNC' },
      { email: 'retailer@test.com', password: 'password', role: 'retailer', full_name: 'Test Retailer' },
      { email: 'customer@test.com', password: 'password', role: 'customer', full_name: 'Test Customer' }
    ];

    const results = [];

    for (const user of testUsers) {
      try {
        console.log(`Creating test user: ${user.email}`);
        
        // Try to create the user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email for test users
          user_metadata: {
            full_name: user.full_name,
            role: user.role
          }
        });

        if (authError) {
          // If user already exists, that's okay
          if (authError.message.includes('already registered')) {
            console.log(`User ${user.email} already exists, skipping...`);
            results.push({ email: user.email, status: 'already_exists' });
            continue;
          } else {
            console.error(`Error creating user ${user.email}:`, authError);
            results.push({ email: user.email, status: 'error', error: authError.message });
            continue;
          }
        }

        if (authData.user) {
          console.log(`Successfully created user: ${user.email}`);
          
          // Create or update the profile manually to ensure it exists
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              district: 'Test District',
              state: 'Test State'
            });

          if (profileError) {
            console.error(`Error creating profile for ${user.email}:`, profileError);
            results.push({ 
              email: user.email, 
              status: 'auth_created_profile_error', 
              error: profileError.message 
            });
          } else {
            console.log(`Successfully created profile for: ${user.email}`);
            results.push({ email: user.email, status: 'created' });
          }
        }
      } catch (error) {
        console.error(`Unexpected error creating user ${user.email}:`, error);
        results.push({ 
          email: user.email, 
          status: 'unexpected_error', 
          error: error.message 
        });
      }
    }

    console.log('Test user creation results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user creation process completed',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in create-test-users function:', error);
    
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
