/* ============================================
   Supabase Configuration
   Shannon Banks 25th Limerick Scouting
   ============================================ */

const SUPABASE_URL = 'https://cflkoysuiojbersruhsj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T7OMNkZsLVUbiXnnV5pJKA_ZahWvFuY';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
