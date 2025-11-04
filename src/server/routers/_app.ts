import { router } from '../trpc';
import { memoryRouter } from './memory';
import { timelineRouter } from './timeline';

export const appRouter = router({
  memory: memoryRouter,
  timeline: timelineRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;