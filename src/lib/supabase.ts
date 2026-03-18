import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// For server-side operations only
export const getSupabaseAdmin = () => {
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(adminUrl, adminKey);
};
