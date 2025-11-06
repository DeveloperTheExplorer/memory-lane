import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import type { Context } from '../../../server/trpc';
import { extractAccessToken } from '../../../lib/auth-utils';

// Export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: ({ req }: trpcNext.CreateNextContextOptions): Context => {
    // Extract Supabase access token from Authorization header
    // Frontend sends the token from localStorage via the Authorization header
    const accessToken = extractAccessToken(req.headers.authorization);
    return { accessToken };
  },
});