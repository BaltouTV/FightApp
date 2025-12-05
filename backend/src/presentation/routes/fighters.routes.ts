import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { FightersController } from '../controllers/fighters.controller.js';

export const fightersRouter = Router();
const controller = new FightersController();

// GET /api/fighters/search
fightersRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const params = {
      q: req.query.q as string | undefined,
      country: req.query.country as string | undefined,
      organizationId: req.query.organizationId as string | undefined,
      weightClass: req.query.weightClass as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
    };

    const result = await controller.search(params);
    res.json({ success: true, ...result });
  })
);

// GET /api/fighters/:id
fightersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await controller.getById(req.params.id);
    res.json({ success: true, data: result });
  })
);

