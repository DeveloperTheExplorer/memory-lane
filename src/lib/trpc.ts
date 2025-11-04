import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/_app';
function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
/**
 * Extract Supabase access token from localStorage
 */
function getSupabaseAccessToken(): string | null {
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

export const trpc = createTRPCNext<AppRouter>({
  config(config) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @see https://trpc.io/docs/v11/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            const token = getSupabaseAccessToken();
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    };
  },
  /**
   * @see https://trpc.io/docs/v11/ssr
   **/
  ssr: false,
});