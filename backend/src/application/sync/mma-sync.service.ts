import slugify from 'slugify';
import { prisma } from '../../infrastructure/database/prisma.js';
import { UFCScraperProvider } from '../providers/ufc-scraper.provider.js';

export interface SyncResult {
  success: boolean;
  eventsProcessed: number;
  fightersProcessed: number;
  organizationsProcessed: number;
  errors: string[];
}

/**
 * Service for synchronizing MMA data from external providers
 */
export class MmaSyncService {
  private provider: UFCScraperProvider;

  constructor() {
    this.provider = new UFCScraperProvider();
  }

  /**
   * Sync all data: organizations and upcoming events
   */
  async syncAll(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      fightersProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info(`🔄 Starting full sync from ${this.provider.name}...`);

      // 1. Sync organizations first
      const orgResult = await this.syncOrganizations();
      result.organizationsProcessed = orgResult.organizationsProcessed;
      result.errors.push(...orgResult.errors);

      // 2. Sync upcoming events
      const eventResult = await this.syncUpcomingEvents();
      result.eventsProcessed = eventResult.eventsProcessed;
      result.errors.push(...eventResult.errors);

      // 3. Sync past events (for history)
      const pastResult = await this.syncPastEvents();
      result.eventsProcessed += pastResult.eventsProcessed;
      result.errors.push(...pastResult.errors);

      console.info(`✅ Sync completed!`);
      console.info(`   Organizations: ${result.organizationsProcessed}`);
      console.info(`   Events: ${result.eventsProcessed}`);
      console.info(`   Errors: ${result.errors.length}`);

    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Sync failed: ${message}`);
      console.error('❌ Sync failed:', error);
    }

    return result;
  }

  /**
   * Sync organizations from the provider
   */
  async syncOrganizations(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      fightersProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info('📋 Syncing organizations...');
      const organizations = await this.provider.getOrganizations();

      for (const org of organizations) {
        try {
          // Find existing organization by name or shortName
          const existing = await prisma.organization.findFirst({
            where: {
              OR: [
                { name: org.name },
                { shortName: org.shortName },
              ],
            },
          });

          if (existing) {
            await prisma.organization.update({
              where: { id: existing.id },
              data: {
                shortName: org.shortName,
                country: org.country,
                city: org.city,
                websiteUrl: org.websiteUrl,
                logoUrl: org.logoUrl,
                level: org.level,
              },
            });
          } else {
            await prisma.organization.create({
              data: {
                name: org.name,
                shortName: org.shortName,
                country: org.country,
                city: org.city,
                websiteUrl: org.websiteUrl,
                logoUrl: org.logoUrl,
                level: org.level,
              },
            });
          }
          result.organizationsProcessed++;
          console.info(`   ✓ ${org.name}`);
        } catch (innerError) {
          const message = innerError instanceof Error ? innerError.message : 'Unknown error';
          result.errors.push(`Failed to process organization ${org.name}: ${message}`);
          console.error(`   ✗ ${org.name}: ${message}`);
        }
      }
    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to sync organizations: ${message}`);
    }

    return result;
  }

  /**
   * Sync upcoming events from the provider
   */
  async syncUpcomingEvents(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      fightersProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info('📅 Syncing upcoming events...');
      const events = await this.provider.getUpcomingEvents();
      console.info(`   Found ${events.length} upcoming events`);

      for (const event of events) {
        try {
          await this.processEvent(event);
          result.eventsProcessed++;
          console.info(`   ✓ ${event.name}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to process event ${event.name}: ${message}`);
          console.error(`   ✗ ${event.name}: ${message}`);
        }
      }
    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to sync upcoming events: ${message}`);
    }

    return result;
  }

  /**
   * Sync past events from the provider
   */
  async syncPastEvents(limit: number = 5): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      fightersProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info('📜 Syncing past events...');
      const events = await this.provider.getPastEvents(limit);
      console.info(`   Found ${events.length} past events`);

      for (const event of events) {
        try {
          await this.processEvent(event);
          result.eventsProcessed++;
          console.info(`   ✓ ${event.name}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to process past event ${event.name}: ${message}`);
        }
      }
    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to sync past events: ${message}`);
    }

    return result;
  }

  /**
   * Process a single event and save it to the database
   */
  private async processEvent(event: {
    externalId: string;
    organizationExternalId: string;
    name: string;
    dateTimeUtc: string;
    venue: string | null;
    city: string | null;
    country: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    description: string | null;
    posterUrl: string | null;
    isAmateurEvent: boolean;
  }): Promise<void> {
    // Find the organization by shortName (UFC, Bellator, etc.)
    let organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { shortName: event.organizationExternalId },
          { name: { contains: event.organizationExternalId } },
        ],
      },
    });

    if (!organization) {
      // Create the organization if it doesn't exist
      organization = await prisma.organization.create({
        data: {
          name: event.organizationExternalId === 'UFC' ? 'Ultimate Fighting Championship' : event.organizationExternalId,
          shortName: event.organizationExternalId,
          country: event.country,
          level: 'MAJOR',
        },
      });
    }

    // Generate slug
    const slug = slugify(`${event.name}`, {
      lower: true,
      strict: true,
    });

    // Check if event exists by slug or name
    const existingEvent = await prisma.event.findFirst({
      where: {
        OR: [
          { slug: slug },
          { name: event.name },
        ],
      },
    });

    const eventData = {
      organizationId: organization.id,
      name: event.name,
      slug,
      description: event.description,
      venue: event.venue,
      city: event.city,
      country: event.country,
      dateTimeUtc: new Date(event.dateTimeUtc),
      status: event.status,
      isAmateurEvent: event.isAmateurEvent,
      externalIds: { [this.provider.name]: event.externalId },
    };

    if (existingEvent) {
      await prisma.event.update({
        where: { id: existingEvent.id },
        data: eventData,
      });
    } else {
      await prisma.event.create({
        data: eventData,
      });
    }
  }
}

