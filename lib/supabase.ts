import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://levfwegihveainqdnwkv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldmZ3ZWdpaHZlYWlucWRud2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjEyMDMsImV4cCI6MjA3Nzc5NzIwM30.6DoUmnGj8FDw9ZqZnkLsaV8fhNCrAPkyp7R2kG0BJBU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});

console.log('[Supabase] Client initialized with URL:', supabaseUrl);

(async () => {
  try {
    const { count, error } = await supabaseClient.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase] Connection test failed:', error);
    } else {
      console.log('[Supabase] Connection test successful, profiles count:', count);
    }
  } catch (err) {
    console.error('[Supabase] Connection test error:', err);
  }
})();

export { supabaseClient };
