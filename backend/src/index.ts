import 'dotenv/config';
import { createServer } from './infrastructure/server.js';
import { prisma } from './infrastructure/database/prisma.js';
import { MmaSyncService } from './application/sync/mma-sync.service.js';

const PORT = process.env.PORT || 3000;
const SYNC_ON_STARTUP = process.env.SYNC_ON_STARTUP !== 'false';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.info('✅ Database connected successfully');

    const app = createServer();

    const HOST = '0.0.0.0';
    app.listen(Number(PORT), HOST, async () => {
      console.info(`🚀 Server running on http://${HOST}:${PORT}`);
      console.info(`📚 API available at http://localhost:${PORT}/api`);

      // Sync MMA data on startup (in background)
      if (SYNC_ON_STARTUP) {
        console.info('');
        console.info('🔄 Starting initial MMA data sync...');
        const syncService = new MmaSyncService();
        syncService.syncAll().catch((error) => {
          console.error('❌ Initial sync failed:', error);
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();

