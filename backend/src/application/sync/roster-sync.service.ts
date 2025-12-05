import slugify from 'slugify';
import { prisma } from '../../infrastructure/database/prisma.js';
import { UFCRosterScraper, UFCFighterInfo } from '../providers/ufc-roster-scraper.js';

export interface RosterSyncResult {
  success: boolean;
  fightersAdded: number;
  fightersUpdated: number;
  errors: string[];
}

/**
 * Service for synchronizing UFC roster (all fighters)
 */
export class RosterSyncService {
  private scraper: UFCRosterScraper;

  constructor() {
    this.scraper = new UFCRosterScraper();
  }

  /**
   * Sync the full UFC roster
   */
  async syncFullRoster(): Promise<RosterSyncResult> {
    const result: RosterSyncResult = {
      success: true,
      fightersAdded: 0,
      fightersUpdated: 0,
      errors: [],
    };

    try {
      console.info('🥊 Starting UFC roster sync...');

      // First, ensure UFC organization exists
      await this.ensureUFCOrganization();

      // Scrape fighters from roster page
      const fighters = await this.scraper.scrapeAllFighters();
      
      console.info(`📥 Processing ${fighters.length} fighters...`);

      for (const fighter of fighters) {
        try {
          const { added, updated } = await this.upsertFighter(fighter);
          if (added) result.fightersAdded++;
          if (updated) result.fightersUpdated++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing ${fighter.firstName} ${fighter.lastName}: ${message}`);
        }
      }

      console.info(`✅ Roster sync completed!`);
      console.info(`   Added: ${result.fightersAdded}`);
      console.info(`   Updated: ${result.fightersUpdated}`);
      console.info(`   Errors: ${result.errors.length}`);

    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Roster sync failed: ${message}`);
      console.error('❌ Roster sync failed:', error);
    }

    return result;
  }

  /**
   * Sync top UFC fighters (ranked fighters with more details)
   */
  async syncTopFighters(): Promise<RosterSyncResult> {
    const result: RosterSyncResult = {
      success: true,
      fightersAdded: 0,
      fightersUpdated: 0,
      errors: [],
    };

    try {
      console.info('🏆 Syncing top UFC fighters...');

      await this.ensureUFCOrganization();

      const fighters = await this.scraper.scrapeTopFighters();
      
      console.info(`📥 Processing ${fighters.length} top fighters...`);

      for (const fighter of fighters) {
        try {
          // Get detailed info for each fighter
          const details = await this.scraper.scrapeFighterDetails(fighter.slug);
          if (details) {
            fighter.nickname = details.nickname ?? fighter.nickname;
            fighter.weightClass = details.weightClass ?? fighter.weightClass;
            fighter.country = details.country ?? fighter.country;
            fighter.imageUrl = details.imageUrl ?? fighter.imageUrl;
          }

          const { added, updated } = await this.upsertFighter(fighter);
          if (added) result.fightersAdded++;
          if (updated) result.fightersUpdated++;

          // Small delay to avoid rate limiting
          await this.delay(100);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing ${fighter.firstName} ${fighter.lastName}: ${message}`);
        }
      }

      console.info(`✅ Top fighters sync completed!`);
      console.info(`   Added: ${result.fightersAdded}`);
      console.info(`   Updated: ${result.fightersUpdated}`);
      console.info(`   Errors: ${result.errors.length}`);

    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Top fighters sync failed: ${message}`);
      console.error('❌ Top fighters sync failed:', error);
    }

    return result;
  }

  /**
   * Sync a batch of fighters by their slugs with detailed info
   */
  async syncFightersBySlug(slugs: string[]): Promise<RosterSyncResult> {
    const result: RosterSyncResult = {
      success: true,
      fightersAdded: 0,
      fightersUpdated: 0,
      errors: [],
    };

    try {
      console.info(`🔍 Syncing ${slugs.length} fighters by slug...`);

      await this.ensureUFCOrganization();

      for (const slug of slugs) {
        try {
          const details = await this.scraper.scrapeFighterDetails(slug);
          if (!details) {
            result.errors.push(`Could not fetch details for ${slug}`);
            continue;
          }

          // Parse name from slug
          const nameParts = slug.split('-');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const fighter: UFCFighterInfo = {
            slug,
            firstName: this.capitalize(firstName),
            lastName: this.capitalize(lastName),
            nickname: details.nickname ?? null,
            weightClass: details.weightClass ?? 'Unknown',
            record: { wins: 0, losses: 0, draws: 0 },
            imageUrl: details.imageUrl ?? null,
            country: details.country ?? 'Unknown',
          };

          const { added, updated } = await this.upsertFighter(fighter);
          if (added) result.fightersAdded++;
          if (updated) result.fightersUpdated++;

          await this.delay(200);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing ${slug}: ${message}`);
        }
      }

      console.info(`✅ Batch sync completed!`);

    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Batch sync failed: ${message}`);
    }

    return result;
  }

  private async ensureUFCOrganization(): Promise<void> {
    const existing = await prisma.organization.findFirst({
      where: { shortName: 'UFC' },
    });

    if (!existing) {
      await prisma.organization.create({
        data: {
          name: 'Ultimate Fighting Championship',
          shortName: 'UFC',
          country: 'USA',
          city: 'Las Vegas',
          websiteUrl: 'https://www.ufc.com',
          level: 'MAJOR',
          logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/1200px-UFC_Logo.svg.png',
        },
      });
    }
  }

  private async upsertFighter(fighter: UFCFighterInfo): Promise<{ added: boolean; updated: boolean }> {
    // Check if fighter exists by name
    const existing = await prisma.fighter.findFirst({
      where: {
        AND: [
          { firstName: fighter.firstName },
          { lastName: fighter.lastName },
        ],
      },
    });

    const fighterData = {
      firstName: fighter.firstName,
      lastName: fighter.lastName,
      nickname: fighter.nickname,
      country: fighter.country,
      weightClass: this.normalizeWeightClass(fighter.weightClass),
      proWins: fighter.record.wins,
      proLosses: fighter.record.losses,
      proDraws: fighter.record.draws,
      imageUrl: fighter.imageUrl,
      isPro: true,
      externalIds: { UFC: fighter.slug },
    };

    if (existing) {
      // Update only if we have better data
      const updateData: Record<string, unknown> = {};
      
      if (fighter.nickname && !existing.nickname) updateData.nickname = fighter.nickname;
      if (fighter.country !== 'Unknown' && existing.country === 'Unknown') updateData.country = fighter.country;
      if (fighter.imageUrl && !existing.imageUrl) updateData.imageUrl = fighter.imageUrl;
      if (fighter.record.wins > 0 || fighter.record.losses > 0) {
        updateData.proWins = fighter.record.wins;
        updateData.proLosses = fighter.record.losses;
        updateData.proDraws = fighter.record.draws;
      }
      if (fighter.weightClass !== 'Unknown') updateData.weightClass = this.normalizeWeightClass(fighter.weightClass);
      
      // Merge external IDs
      const existingExternalIds = (existing.externalIds as Record<string, string>) || {};
      updateData.externalIds = { ...existingExternalIds, UFC: fighter.slug };

      if (Object.keys(updateData).length > 0) {
        await prisma.fighter.update({
          where: { id: existing.id },
          data: updateData,
        });
        return { added: false, updated: true };
      }
      
      return { added: false, updated: false };
    } else {
      await prisma.fighter.create({
        data: fighterData,
      });
      return { added: true, updated: false };
    }
  }

  private normalizeWeightClass(weightClass: string): string {
    const mapping: Record<string, string> = {
      'Strawweight': 'Poids paille',
      'Flyweight': 'Poids mouche',
      'Bantamweight': 'Poids coq',
      'Featherweight': 'Poids plume',
      'Lightweight': 'Poids léger',
      'Welterweight': 'Poids mi-moyen',
      'Middleweight': 'Poids moyen',
      'Light Heavyweight': 'Poids mi-lourd',
      'Heavyweight': 'Poids lourd',
      "Women's Strawweight": 'Poids paille féminin',
      "Women's Flyweight": 'Poids mouche féminin',
      "Women's Bantamweight": 'Poids coq féminin',
      "Women's Featherweight": 'Poids plume féminin',
    };
    
    return mapping[weightClass] || weightClass;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update records for ALL fighters in the database
   * Uses parallel requests for speed (processes 20 fighters at a time)
   */
  async updateAllRecords(): Promise<RosterSyncResult> {
    const result: RosterSyncResult = {
      success: true,
      fightersAdded: 0,
      fightersUpdated: 0,
      errors: [],
    };

    try {
      console.info('📊 Starting FAST records update for ALL fighters...');

      // Get ALL fighters from database
      const fighters = await prisma.fighter.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          externalIds: true,
          proWins: true,
          proLosses: true,
          proDraws: true,
          weightClass: true,
          country: true,
          imageUrl: true,
        },
      });

      console.info(`📥 Processing ${fighters.length} fighters in parallel batches...`);

      const BATCH_SIZE = 20; // Process 20 fighters at a time
      let updated = 0;
      let processed = 0;
      
      // Process in batches
      for (let i = 0; i < fighters.length; i += BATCH_SIZE) {
        const batch = fighters.slice(i, i + BATCH_SIZE);
        
        // Process batch in parallel
        const results = await Promise.all(
          batch.map(async (fighter) => {
            const externalIds = (fighter.externalIds as Record<string, string>) || {};
            const slug = externalIds.UFC;
            
            if (!slug) return { updated: false };
            
            try {
              const details = await this.fetchFighterRecord(slug);
              
              if (details && (details.wins !== undefined || details.losses !== undefined)) {
                const updateData: Record<string, unknown> = {};
                
                if (details.wins !== undefined) updateData.proWins = details.wins;
                if (details.losses !== undefined) updateData.proLosses = details.losses;
                if (details.draws !== undefined) updateData.proDraws = details.draws;
                if (details.weightClass && details.weightClass !== 'Unknown') {
                  updateData.weightClass = this.normalizeWeightClass(details.weightClass);
                }
                if (details.country && details.country !== 'Unknown') {
                  updateData.country = details.country;
                }
                if (details.imageUrl) {
                  updateData.imageUrl = details.imageUrl;
                }
                
                if (Object.keys(updateData).length > 0) {
                  await prisma.fighter.update({
                    where: { id: fighter.id },
                    data: updateData,
                  });
                  return { updated: true };
                }
              }
              return { updated: false };
            } catch (error) {
              return { updated: false };
            }
          })
        );
        
        // Count updates
        const batchUpdated = results.filter(r => r.updated).length;
        updated += batchUpdated;
        processed += batch.length;
        
        // Progress log every 200 fighters
        if (processed % 200 === 0 || processed === fighters.length) {
          const percent = Math.round((processed / fighters.length) * 100);
          console.info(`  📊 ${processed}/${fighters.length} (${percent}%) - ${updated} updated`);
        }
        
        // Small delay between batches to avoid rate limiting
        await this.delay(100);
      }

      result.fightersUpdated = updated;
      console.info(`✅ Records update completed! ${updated}/${fighters.length} fighters updated.`);

    } catch (error) {
      result.success = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Records update failed: ${message}`);
      console.error('❌ Records update failed:', error);
    }

    return result;
  }

  /**
   * Fetch fighter record from their UFC page
   */
  private async fetchFighterRecord(slug: string): Promise<{
    wins?: number;
    losses?: number;
    draws?: number;
    weightClass?: string;
    country?: string;
    imageUrl?: string;
  } | null> {
    try {
      const response = await fetch(`https://www.ufc.com/athlete/${slug}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      
      if (!response.ok) return null;
      
      const html = await response.text();
      
      const result: {
        wins?: number;
        losses?: number;
        draws?: number;
        weightClass?: string;
        country?: string;
        imageUrl?: string;
      } = {};
      
      // Extract record (format: "21 - 9 - 0" or similar)
      const recordMatch = html.match(/<p class="hero-profile__division-title">[^<]*<\/p>[\s\S]*?(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/i) ||
                         html.match(/(\d+)\s*<span[^>]*>-<\/span>\s*(\d+)(?:\s*<span[^>]*>-<\/span>\s*(\d+))?/);
      
      if (recordMatch) {
        result.wins = parseInt(recordMatch[1]) || 0;
        result.losses = parseInt(recordMatch[2]) || 0;
        result.draws = parseInt(recordMatch[3]) || 0;
      }
      
      // Extract weight class
      const wcMatch = html.match(/<p class="hero-profile__tag">\s*([^<]+?)\s*Division/i);
      if (wcMatch) {
        result.weightClass = wcMatch[1].trim();
      }
      
      // Extract country from bio
      const countryMatch = html.match(/Place of Birth[\s\S]*?<dd class="c-bio__text">([^,<]+)/i) ||
                          html.match(/Born[\s\S]*?<dd class="c-bio__text">[^,]+,\s*([^<]+)/i);
      if (countryMatch) {
        result.country = countryMatch[1].trim();
      }
      
      // Extract headshot image
      const imageMatch = html.match(/event_results_athlete_headshot\/s3\/([^"?]+)/);
      if (imageMatch) {
        result.imageUrl = `https://ufc.com/images/styles/event_results_athlete_headshot/s3/${imageMatch[1]}`;
      }
      
      return result;
      
    } catch (error) {
      return null;
    }
  }
}

