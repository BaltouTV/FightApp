import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { MmaSyncService } from '../../application/sync/mma-sync.service.js';
import { RosterSyncService } from '../../application/sync/roster-sync.service.js';

const router = Router();
const syncService = new MmaSyncService();
const rosterSyncService = new RosterSyncService();

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

/**
 * POST /api/sync/roster
 * Sync the full UFC roster (all fighters)
 */
router.post(
  '/roster',
  asyncHandler(async (_req, res) => {
    console.info('🥊 Manual roster sync triggered via API...');
    
    const result = await rosterSyncService.syncFullRoster();
    
    res.json({
      success: result.success,
      data: {
        fightersAdded: result.fightersAdded,
        fightersUpdated: result.fightersUpdated,
        errors: result.errors.slice(0, 10), // Limit errors in response
        totalErrors: result.errors.length,
      },
      message: result.success 
        ? `Roster sync completed: ${result.fightersAdded} added, ${result.fightersUpdated} updated`
        : 'Roster sync completed with errors',
    });
  })
);

/**
 * POST /api/sync/roster/top
 * Sync top UFC fighters (champions and ranked) with detailed info
 */
router.post(
  '/roster/top',
  asyncHandler(async (_req, res) => {
    console.info('🏆 Syncing top UFC fighters...');
    
    const result = await rosterSyncService.syncTopFighters();
    
    res.json({
      success: result.success,
      data: {
        fightersAdded: result.fightersAdded,
        fightersUpdated: result.fightersUpdated,
        errors: result.errors.slice(0, 10),
        totalErrors: result.errors.length,
      },
      message: result.success 
        ? `Top fighters sync completed: ${result.fightersAdded} added, ${result.fightersUpdated} updated`
        : 'Top fighters sync completed with errors',
    });
  })
);

/**
 * POST /api/sync/roster/records
 * Update records (wins-losses-draws) for all fighters
 */
router.post(
  '/roster/records',
  asyncHandler(async (_req, res) => {
    console.info('📊 Updating fighter records...');
    
    const result = await rosterSyncService.updateAllRecords();
    
    res.json({
      success: result.success,
      data: {
        fightersUpdated: result.fightersUpdated,
        errors: result.errors.slice(0, 10),
        totalErrors: result.errors.length,
      },
      message: result.success 
        ? `Records update completed: ${result.fightersUpdated} fighters updated`
        : 'Records update completed with errors',
    });
  })
);

export const syncRouter = router;

