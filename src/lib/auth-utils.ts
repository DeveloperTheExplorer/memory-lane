/**
 * Extract Supabase access token from localStorage
 * This function retrieves the access token stored by Supabase Auth
 * 
 * @returns The access token string if found, null otherwise
 */
export function getSupabaseAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Find the Supabase auth token in localStorage (format: sb-${project_id}-auth-token)
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));

    if (!authKey) return null;

    const authData = localStorage.getItem(authKey);
    if (!authData) return null;

    const parsed = JSON.parse(authData);
    return parsed.access_token || null;
  } catch (error) {
    console.error('Failed to extract Supabase token from localStorage:', error);
    return null;
  }
}

