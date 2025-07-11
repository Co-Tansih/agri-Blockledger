
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
      { email: 'farmer@test.com', password: 'password', role: 'farmer', full_name: 'Test Farmer', district: 'Punjab', state: 'Punjab' },
      { email: 'broker@test.com', password: 'password', role: 'broker', full_name: 'Test Broker', district: 'Delhi', state: 'Delhi' },
      { email: 'mnc@test.com', password: 'password', role: 'mnc', full_name: 'Test MNC Corp', district: 'Mumbai', state: 'Maharashtra' },
      { email: 'retailer@test.com', password: 'password', role: 'retailer', full_name: 'Test Retailer', district: 'Bangalore', state: 'Karnataka' },
      { email: 'customer@test.com', password: 'password', role: 'customer', full_name: 'Test Customer', district: 'Chennai', state: 'Tamil Nadu' }
    ];

    const results = [];

    for (const user of testUsers) {
      try {
        console.log(`Processing test user: ${user.email}`);
        
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === user.email);
        
        if (existingUser) {
          // User exists, update password
          console.log(`User ${user.email} already exists, updating password...`);
          
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { 
              password: user.password,
              user_metadata: {
                full_name: user.full_name,
                role: user.role,
                district: user.district,
                state: user.state
              }
            }
          );
          
          if (updateError) {
            console.error(`Error updating user ${user.email}:`, updateError);
            results.push({ email: user.email, status: 'update_error', error: updateError.message });
            continue;
          }
          
          // Ensure profile exists and is updated
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              district: user.district,
              state: user.state,
              updated_at: new Date().toISOString()
            });
            
          if (upsertError) {
            console.error(`Error upserting profile for ${user.email}:`, upsertError);
            results.push({ email: user.email, status: 'profile_upsert_error', error: upsertError.message });
          } else {
            results.push({ email: user.email, status: 'updated_successfully' });
          }
        } else {
          // Create new user
          console.log(`Creating new test user: ${user.email}`);
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.full_name,
              role: user.role,
              district: user.district,
              state: user.state
            }
          });

          if (authError) {
            console.error(`Error creating user ${user.email}:`, authError);
            results.push({ email: user.email, status: 'creation_error', error: authError.message });
            continue;
          }

          if (authData.user) {
            console.log(`Successfully created auth user: ${user.email}`);
            
            // Wait for trigger to process, then verify/create profile
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();
              
            if (!existingProfile) {
              console.log(`Creating profile manually for ${user.email}`);
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: authData.user.id,
                  email: user.email,
                  full_name: user.full_name,
                  role: user.role,
                  district: user.district,
                  state: user.state
                });

              if (profileError) {
                console.error(`Error creating profile for ${user.email}:`, profileError);
                results.push({ email: user.email, status: 'created_auth_profile_error', error: profileError.message });
              } else {
                results.push({ email: user.email, status: 'created_successfully' });
              }
            } else {
              results.push({ email: user.email, status: 'created_with_trigger' });
            }
          }
        }
      } catch (error) {
        console.error(`Unexpected error processing user ${user.email}:`, error);
        results.push({ email: user.email, status: 'unexpected_error', error: error.message });
      }
    }

    console.log('Test user creation results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user creation process completed',
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => 
            r.status.includes('created') || 
            r.status.includes('updated')
          ).length,
          errors: results.filter(r => r.status.includes('error')).length
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
