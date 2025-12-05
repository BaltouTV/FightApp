import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { OrganizationsController } from '../controllers/organizations.controller.js';
import { OrganizationLevel } from '@fightapp/shared';

export const organizationsRouter = Router();
const controller = new OrganizationsController();

// GET /api/organizations
organizationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const params = {
      level: req.query.level as OrganizationLevel | undefined,
      country: req.query.country as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 50,
    };

    const result = await controller.getAll(params);
    res.json({ success: true, ...result });
  })
);

// GET /api/organizations/:id
organizationsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await controller.getById(req.params.id);
    res.json({ success: true, data: result });
  })
);

