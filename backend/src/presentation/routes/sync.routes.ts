import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { MmaSyncService } from '../../application/sync/mma-sync.service.js';

const router = Router();
const syncService = new MmaSyncService();

/**
 * POST /api/sync
 * Trigger a full synchronization of MMA data
 */
router.post(
  '/',
  asyncHandler(async (_req, res) => {
    console.info('🔄 Manual sync triggered via API...');
    
    const result = await syncService.syncAll();
    
    res.json({
      success: result.success,
      data: {
        eventsProcessed: result.eventsProcessed,
        organizationsProcessed: result.organizationsProcessed,
        fightersProcessed: result.fightersProcessed,
        errors: result.errors,
      },
      message: result.success 
        ? `Sync completed: ${result.eventsProcessed} events, ${result.organizationsProcessed} organizations`
        : 'Sync completed with errors',
    });
  })
);

/**
 * POST /api/sync/events
 * Sync only upcoming events
 */
router.post(
  '/events',
  asyncHandler(async (_req, res) => {
    const result = await syncService.syncUpcomingEvents();
    
    res.json({
      success: result.success,
      data: {
        eventsProcessed: result.eventsProcessed,
        errors: result.errors,
      },
    });
  })
);

/**
 * POST /api/sync/organizations
 * Sync organizations
 */
router.post(
  '/organizations',
  asyncHandler(async (_req, res) => {
    const result = await syncService.syncOrganizations();
    
    res.json({
      success: result.success,
      data: {
        organizationsProcessed: result.organizationsProcessed,
        errors: result.errors,
      },
    });
  })
);

export const syncRouter = router;

