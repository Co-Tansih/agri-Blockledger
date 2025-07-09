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
        
        // First check if user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(user.email);
        
        if (existingUser.user) {
          console.log(`User ${user.email} already exists, checking login capability`);
          
          // Test if the existing user can actually log in
          const testClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
          const { error: loginTest } = await testClient.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });
          
          if (loginTest) {
            console.log(`Existing user ${user.email} cannot login, recreating...`);
            
            // Delete the existing user and recreate
            const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.user.id);
            if (deleteError) {
              console.error(`Error deleting user ${user.email}:`, deleteError);
              results.push({ 
                email: user.email, 
                status: 'delete_error', 
                error: deleteError.message 
              });
              continue;
            }
            
            // Wait a moment for deletion to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log(`User ${user.email} can login successfully`);
            
            // Ensure profile exists for existing user
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', existingUser.user.id)
              .single();
              
            if (!existingProfile) {
              console.log(`Creating missing profile for ${user.email}`);
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: existingUser.user.id,
                  email: user.email,
                  full_name: user.full_name,
                  role: user.role,
                  district: user.district,
                  state: user.state
                });
                
              if (profileError) {
                console.error(`Error creating profile for existing user ${user.email}:`, profileError);
                results.push({ 
                  email: user.email, 
                  status: 'profile_creation_error', 
                  error: profileError.message 
                });
              } else {
                results.push({ email: user.email, status: 'profile_created' });
              }
            } else {
              results.push({ email: user.email, status: 'already_exists_and_working' });
            }
            continue;
          }
        }
        
        // Create new user with explicit password
        console.log(`Creating new test user: ${user.email}`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email for test users
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            district: user.district,
            state: user.state
          }
        });

        if (authError) {
          console.error(`Error creating user ${user.email}:`, authError);
          results.push({ email: user.email, status: 'auth_error', error: authError.message });
          continue;
        }

        if (authData.user) {
          console.log(`Successfully created auth user: ${user.email}`);
          
          // Wait for the user creation to fully complete
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Test login immediately after creation
          const testClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
          const { error: loginTest } = await testClient.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });
          
          if (loginTest) {
            console.error(`Newly created user ${user.email} cannot login:`, loginTest);
            
            // Try to update the password explicitly
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              authData.user.id,
              { password: user.password }
            );
            
            if (updateError) {
              console.error(`Error updating password for ${user.email}:`, updateError);
              results.push({ 
                email: user.email, 
                status: 'password_update_error', 
                error: updateError.message 
              });
              continue;
            }
            
            // Wait and test login again
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { error: retryLoginTest } = await testClient.auth.signInWithPassword({
              email: user.email,
              password: user.password
            });
            
            if (retryLoginTest) {
              console.error(`User ${user.email} still cannot login after password update:`, retryLoginTest);
              results.push({ 
                email: user.email, 
                status: 'login_still_failed', 
                error: retryLoginTest.message 
              });
              continue;
            }
          }
          
          console.log(`User ${user.email} can login successfully`);
          
          // Check if profile was created by trigger
          const { data: triggerProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (!triggerProfile) {
            console.log(`Trigger didn't create profile, creating manually for ${user.email}`);
            // Create profile manually if trigger didn't work
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
              results.push({ 
                email: user.email, 
                status: 'auth_created_profile_error', 
                error: profileError.message 
              });
            } else {
              console.log(`Successfully created profile manually for: ${user.email}`);
              results.push({ email: user.email, status: 'created_with_manual_profile' });
            }
          } else {
            console.log(`Profile created by trigger for: ${user.email}`);
            results.push({ email: user.email, status: 'created_with_trigger' });
          }
        }
      } catch (error) {
        console.error(`Unexpected error processing user ${user.email}:`, error);
        results.push({ 
          email: user.email, 
          status: 'unexpected_error', 
          error: error.message 
        });
      }
    }

    console.log('Test user creation results:', results);

    // Final verification - test all users can login
    const verificationResults = [];
    const testClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
    
    for (const user of testUsers) {
      try {
        const { error: loginError } = await testClient.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        verificationResults.push({
          email: user.email,
          canLogin: !loginError,
          error: loginError?.message || null
        });
        
        // Sign out after test
        if (!loginError) {
          await testClient.auth.signOut();
        }
      } catch (error) {
        verificationResults.push({
          email: user.email,
          canLogin: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user creation process completed',
        results,
        verification: verificationResults,
        summary: {
          total: results.length,
          created: results.filter(r => r.status.includes('created')).length,
          existing: results.filter(r => r.status.includes('already_exists')).length,
          errors: results.filter(r => r.status.includes('error')).length,
          loginVerification: {
            total: verificationResults.length,
            canLogin: verificationResults.filter(v => v.canLogin).length,
            cannotLogin: verificationResults.filter(v => !v.canLogin).length
          }
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