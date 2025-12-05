import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware, AuthenticatedRequest } from '../../infrastructure/middleware/auth.middleware.js';

export const authRouter = Router();
const controller = new AuthController();

// POST /api/auth/register
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const result = await controller.register(req.body);
    res.status(201).json({ success: true, data: result });
  })
);

// POST /api/auth/login
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await controller.login(req.body);
    res.json({ success: true, data: result });
  })
);

// GET /api/auth/me
authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const result = await controller.me(authenticatedReq.user!.userId);
    res.json({ success: true, data: result });
  })
);

