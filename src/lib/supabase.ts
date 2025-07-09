
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrvjethlrrupiuyfhohi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydmpldGhscnJ1cGl1eWZob2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTA1NzEsImV4cCI6MjA2NzYyNjU3MX0.kS6sgHxZxeAA8qiT7KXnL00cRBLQoExlnuqlJ0JJWdY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
