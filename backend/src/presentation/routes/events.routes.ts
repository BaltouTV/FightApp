import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { EventsController } from '../controllers/events.controller.js';

export const eventsRouter = Router();
const controller = new EventsController();

// GET /api/events/upcoming
eventsRouter.get(
  '/upcoming',
  asyncHandler(async (req, res) => {
    const params = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
      organizationId: req.query.organizationId as string | undefined,
      country: req.query.country as string | undefined,
      level: req.query.level as string | undefined,
      fromDate: req.query.fromDate as string | undefined,
      toDate: req.query.toDate as string | undefined,
    };

    const result = await controller.getUpcoming(params);
    res.json({ success: true, ...result });
  })
);

// GET /api/events/:id
eventsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await controller.getById(req.params.id);
    res.json({ success: true, data: result });
  })
);

