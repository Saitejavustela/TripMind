import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

/**
 * Supabase client singleton — import this wherever you need database access.
 *
 * Tables used by TripAI:
 *  - expenses              (expense tracking)
 *  - collaboration_sessions (collaborative planning)
 *  - trips                 (trip data)
 *  - preferences           (user preferences)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ─── Type helpers ────────────────────────────────────────────────────────────

export type SupabaseClient = typeof supabase;

// ─── Table helpers ────────────────────────────────────────────────────────────

/** Expenses table */
export const expensesTable = () => supabase.from('expenses');

/** Collaboration sessions table */
export const collaborationSessionsTable = () => supabase.from('collaboration_sessions');

/** Trips table */
export const tripsTable = () => supabase.from('trips');

/** Preferences table */
export const preferencesTable = () => supabase.from('preferences');

// ─── Connection check ─────────────────────────────────────────────────────────

/**
 * Verify that Supabase is reachable. Returns true on success.
 * Useful for health checks or diagnostics.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('expenses').select('id').limit(1);
    // A "relation does not exist" error still means we're connected
    return !error || error.code === '42P01';
  } catch {
    return false;
  }
}

export default supabase;
