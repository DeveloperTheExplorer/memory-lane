import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import type { Context } from '../../../server/trpc';

/**
 * Extract Supabase access token from Authorization header
 * Frontend sends the token from localStorage via the Authorization header
 */
function extractAccessToken(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;

  // Authorization header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return undefined;
  }

  return parts[1];
}

// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: ({ req }: trpcNext.CreateNextContextOptions): Context => {
    const accessToken = extractAccessToken(req.headers.authorization);
    return { accessToken };
  },
});