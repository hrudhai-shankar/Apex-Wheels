const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase') || supabaseKey.includes('your_supabase')) {
  console.error('\n==================================================================');
  console.error('ERROR: Supabase URL and Key are not properly configured in .env!');
  console.error('Please configure SUPABASE_URL and SUPABASE_KEY to run the application.');
  console.error('==================================================================\n');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = supabase;
