import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { eventsRouter } from './events.routes.js';
import { fightersRouter } from './fighters.routes.js';
import { organizationsRouter } from './organizations.routes.js';
import { favoritesRouter } from './favorites.routes.js';
import { syncRouter } from './sync.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/fighters', fightersRouter);
apiRouter.use('/organizations', organizationsRouter);
apiRouter.use('/me', favoritesRouter);
apiRouter.use('/sync', syncRouter);

