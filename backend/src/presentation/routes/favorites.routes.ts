import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { FavoritesController } from '../controllers/favorites.controller.js';
import { authMiddleware, AuthenticatedRequest } from '../../infrastructure/middleware/auth.middleware.js';

export const favoritesRouter = Router();
const controller = new FavoritesController();

// All favorites routes require authentication
favoritesRouter.use(authMiddleware);

// GET /api/me/favorites
favoritesRouter.get(
  '/favorites',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.getAllFavorites(authenticatedReq.user!.userId);
    res.json({ success: true, data: result });
  })
);

// Fighter favorites
favoritesRouter.post(
  '/favorites/fighters/:fighterId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.addFavoriteFighter(
      authenticatedReq.user!.userId,
      req.params.fighterId
    );
    res.json({ success: true, data: result });
  })
);

favoritesRouter.delete(
  '/favorites/fighters/:fighterId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.removeFavoriteFighter(
      authenticatedReq.user!.userId,
      req.params.fighterId
    );
    res.json({ success: true, data: result });
  })
);

// Event favorites
favoritesRouter.post(
  '/favorites/events/:eventId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.addFavoriteEvent(
      authenticatedReq.user!.userId,
      req.params.eventId
    );
    res.json({ success: true, data: result });
  })
);

favoritesRouter.delete(
  '/favorites/events/:eventId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.removeFavoriteEvent(
      authenticatedReq.user!.userId,
      req.params.eventId
    );
    res.json({ success: true, data: result });
  })
);

// Organization favorites
favoritesRouter.post(
  '/favorites/organizations/:organizationId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.addFavoriteOrganization(
      authenticatedReq.user!.userId,
      req.params.organizationId
    );
    res.json({ success: true, data: result });
  })
);

favoritesRouter.delete(
  '/favorites/organizations/:organizationId',
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.removeFavoriteOrganization(
      authenticatedReq.user!.userId,
      req.params.organizationId
    );
    res.json({ success: true, data: result });
  })
);

