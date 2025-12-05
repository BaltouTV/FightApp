import slugify from 'slugify';
import { prisma } from '../../infrastructure/database/prisma.js';
import { UFCScraperProvider, MmaFightWithFighterInfo } from '../providers/ufc-scraper.provider.js';

export interface SyncResult {
  success: boolean;
  eventsProcessed: number;
  fightersProcessed: number;
  fightsProcessed: number;
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
   * Sync all data: organizations, events, fighters and fights
   */
  async syncAll(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      eventsProcessed: 0,
      fightersProcessed: 0,
      fightsProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info(`🔄 Starting full sync from ${this.provider.name}...`);

      // 1. Sync organizations first
      const orgResult = await this.syncOrganizations();
      result.organizationsProcessed = orgResult.organizationsProcessed;
      result.errors.push(...orgResult.errors);

      // 2. Sync upcoming events with fight cards
      const eventResult = await this.syncUpcomingEvents();
      result.eventsProcessed = eventResult.eventsProcessed;
      result.fightersProcessed = eventResult.fightersProcessed;
      result.fightsProcessed = eventResult.fightsProcessed;
      result.errors.push(...eventResult.errors);

      // 3. Sync past events (for history)
      const pastResult = await this.syncPastEvents();
      result.eventsProcessed += pastResult.eventsProcessed;
      result.errors.push(...pastResult.errors);

      console.info(`✅ Sync completed!`);
      console.info(`   Organizations: ${result.organizationsProcessed}`);
      console.info(`   Events: ${result.eventsProcessed}`);
      console.info(`   Fighters: ${result.fightersProcessed}`);
      console.info(`   Fights: ${result.fightsProcessed}`);
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
      fightsProcessed: 0,
      organizationsProcessed: 0,
      errors: [],
    };

    try {
      console.info('📅 Syncing upcoming events...');
      const events = await this.provider.getUpcomingEvents();
      console.info(`   Found ${events.length} upcoming events`);

      for (const event of events) {
        try {
          const dbEvent = await this.processEvent(event);
          result.eventsProcessed++;
          console.info(`   ✓ ${event.name}`);

          // Sync fight card for this event
          const fightCard = this.provider.getFightCardForEvent(event.externalId);
          if (fightCard.length > 0) {
            console.info(`     📋 Syncing ${fightCard.length} fights...`);
            for (const fight of fightCard) {
              try {
                await this.processFight(fight, dbEvent.id);
                result.fightsProcessed++;
                result.fightersProcessed += 2; // Each fight has 2 fighters
              } catch (fightError) {
                const msg = fightError instanceof Error ? fightError.message : 'Unknown error';
                result.errors.push(`Failed to process fight: ${msg}`);
              }
            }
          }
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
      fightsProcessed: 0,
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
   * Process a fighter and save/update in database
   */
  private async processFighter(fighterData: {
    externalId: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    country: string;
    imageUrl: string | null;
    record: string;
    weightClass: string;
  }): Promise<{ id: string }> {
    // Parse record (e.g., "28-5-0" -> wins: 28, losses: 5, draws: 0)
    const [wins, losses, draws] = fighterData.record.split('-').map(Number);

    // Check if fighter exists by externalId or name
    const existingFighter = await prisma.fighter.findFirst({
      where: {
        OR: [
          { externalIds: { path: [this.provider.name], equals: fighterData.externalId } },
          { 
            AND: [
              { firstName: fighterData.firstName },
              { lastName: fighterData.lastName },
            ]
          },
        ],
      },
    });

    const fighterDbData = {
      firstName: fighterData.firstName,
      lastName: fighterData.lastName,
      nickname: fighterData.nickname,
      country: fighterData.country,
      imageUrl: fighterData.imageUrl,
      weightClass: fighterData.weightClass,
      proWins: wins || 0,
      proLosses: losses || 0,
      proDraws: draws || 0,
      isPro: true,
      externalIds: { [this.provider.name]: fighterData.externalId },
    };

    if (existingFighter) {
      return prisma.fighter.update({
        where: { id: existingFighter.id },
        data: fighterDbData,
        select: { id: true },
      });
    } else {
      return prisma.fighter.create({
        data: fighterDbData,
        select: { id: true },
      });
    }
  }

  /**
   * Process a fight and save/update in database
   */
  private async processFight(fight: MmaFightWithFighterInfo, eventId: string): Promise<void> {
    // First, ensure both fighters exist
    const fighterA = await this.processFighter({
      externalId: fight.fighterAExternalId,
      firstName: fight.fighterAFirstName,
      lastName: fight.fighterALastName,
      nickname: fight.fighterANickname,
      country: fight.fighterACountry,
      imageUrl: fight.fighterAImageUrl,
      record: fight.fighterARecord,
      weightClass: fight.weightClass,
    });

    const fighterB = await this.processFighter({
      externalId: fight.fighterBExternalId,
      firstName: fight.fighterBFirstName,
      lastName: fight.fighterBLastName,
      nickname: fight.fighterBNickname,
      country: fight.fighterBCountry,
      imageUrl: fight.fighterBImageUrl,
      record: fight.fighterBRecord,
      weightClass: fight.weightClass,
    });

    // Check if fight exists
    const existingFight = await prisma.fight.findFirst({
      where: {
        OR: [
          { externalIds: { path: [this.provider.name], equals: fight.externalId } },
          {
            AND: [
              { eventId },
              { fighterAId: fighterA.id },
              { fighterBId: fighterB.id },
            ],
          },
        ],
      },
    });

    const fightDbData = {
      eventId,
      fighterAId: fighterA.id,
      fighterBId: fighterB.id,
      weightClass: fight.weightClass,
      isTitleFight: fight.isTitleFight,
      isMainEvent: fight.isMainEvent,
      isCoMainEvent: fight.isCoMainEvent,
      fightOrder: fight.order,
      resultStatus: 'SCHEDULED' as const,
      externalIds: { [this.provider.name]: fight.externalId },
    };

    if (existingFight) {
      await prisma.fight.update({
        where: { id: existingFight.id },
        data: fightDbData,
      });
    } else {
      await prisma.fight.create({
        data: fightDbData,
      });
    }
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
  }): Promise<{ id: string }> {
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
      return prisma.event.update({
        where: { id: existingEvent.id },
        data: eventData,
        select: { id: true },
      });
    } else {
      return prisma.event.create({
        data: eventData,
        select: { id: true },
      });
    }
  }
}

