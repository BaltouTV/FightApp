/**
 * UFC Data Scraper Provider
 * Fetches real UFC event data from the UFC website API
 */

interface UFCEventResponse {
  liveEventId: number | null;
  items: UFCEvent[];
  count: number;
}

interface UFCEvent {
  eventId: number;
  fmId: number;
  name: string;
  eventDt: string;
  eventDttm: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  location: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  fightCard: UFCFight[];
  mainCard: UFCFight[];
  prelims: UFCFight[];
  earlyPrelims: UFCFight[];
}

interface UFCFight {
  fightId: number;
  order: number;
  weightClass: string;
  redCorner: UFCFighter;
  blueCorner: UFCFighter;
  isTitleFight: boolean;
  isMainEvent: boolean;
  result?: {
    winnerId: number;
    method: string;
    endingRound: number;
    endingTime: string;
    decision: string;
  };
}

interface UFCFighter {
  fighterId: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  record: string;
  country: string;
  image?: string;
}

export interface MmaEvent {
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
}

export interface MmaFighter {
  externalId: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  country: string;
  imageUrl: string | null;
  record: string;
}

export interface MmaFight {
  externalId: string;
  eventExternalId: string;
  fighterAExternalId: string;
  fighterBExternalId: string;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
  order: number;
  result?: {
    winnerExternalId: string;
    method: string;
    round: number;
    time: string;
  };
}

export interface MmaFightWithFighterInfo extends MmaFight {
  fighterAFirstName: string;
  fighterALastName: string;
  fighterANickname: string | null;
  fighterACountry: string;
  fighterARecord: string;
  fighterAImageUrl: string | null;
  fighterBFirstName: string;
  fighterBLastName: string;
  fighterBNickname: string | null;
  fighterBCountry: string;
  fighterBRecord: string;
  fighterBImageUrl: string | null;
  cardType?: 'MAIN' | 'PRELIM' | 'EARLY_PRELIM';
}

export class UFCScraperProvider {
  readonly name = 'UFC';

  // UFC's public API endpoints
  private readonly EVENTS_URL = 'https://d29dxerjsp82wz.cloudfront.net/api/v3/event/live/ufc-fight-night';
  private readonly UPCOMING_EVENTS_URL = 'https://d29dxerjsp82wz.cloudfront.net/api/v3/event/ufc/upcoming.json';

  /**
   * Convert full body image URL to headshot URL
   * Headshots are cropped face images that work better for avatars
   */
  private convertToHeadshotUrl(url: string): string {
    if (!url) return url;
    
    // Ensure https
    let newUrl = url.replace(/^\/\//, 'https://');
    
    // Change style to headshot
    newUrl = newUrl.replace(
      'event_fight_card_upper_body_of_standing_athlete',
      'event_results_athlete_headshot'
    );
    
    // Remove _L_ or _R_ direction suffix from filename
    // DVALISHVILI_MERAB_L_BELT_12-06.png -> DVALISHVILI_MERAB_BELT_12-06.png
    // YAN_PETR_R_12-06.png -> YAN_PETR_12-06.png
    newUrl = newUrl.replace(/(_[LR])_(?=BELT|CHAMP|\d{2}-\d{2})/, '_');
    newUrl = newUrl.replace(/(_[LR])_(\d{2}-\d{2})/, '_$2');
    
    return newUrl;
  }

  /**
   * Get fighters for a specific event
   */
  async getFightersForEvent(eventExternalId: string): Promise<MmaFighter[]> {
    const fightCard = await this.getFightCardForEvent(eventExternalId);
    const fighters: MmaFighter[] = [];
    
    for (const fight of fightCard) {
      // Add both fighters from each fight
      fighters.push(
        {
          externalId: fight.fighterAExternalId,
          firstName: fight.fighterAFirstName || '',
          lastName: fight.fighterALastName || '',
          nickname: fight.fighterANickname || null,
          country: fight.fighterACountry || 'USA',
          imageUrl: fight.fighterAImageUrl || null,
          record: fight.fighterARecord || '0-0-0',
        },
        {
          externalId: fight.fighterBExternalId,
          firstName: fight.fighterBFirstName || '',
          lastName: fight.fighterBLastName || '',
          nickname: fight.fighterBNickname || null,
          country: fight.fighterBCountry || 'USA',
          imageUrl: fight.fighterBImageUrl || null,
          record: fight.fighterBRecord || '0-0-0',
        }
      );
    }
    
    return fighters;
  }

  /**
   * Get fight card for a specific event by scraping UFC website
   */
  async getFightCardForEvent(eventExternalId: string): Promise<MmaFightWithFighterInfo[]> {
    const fights: MmaFightWithFighterInfo[] = [];
    
    try {
      console.info(`🔍 Scraping fight card for ${eventExternalId}...`);
      
      const response = await fetch(`https://www.ufc.com/event/${eventExternalId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch event page: ${response.status}`);
        return [];
      }
      
      const html = await response.text();
      
      // Extract fights from each card section (Main Card, Prelims, Early Prelims)
      const cardSections = [
        { id: 'main-card', cardType: 'MAIN' as const, baseOrder: 100 },
        { id: 'prelims-card', cardType: 'PRELIM' as const, baseOrder: 200 },
        { id: 'early-prelims', cardType: 'EARLY_PRELIM' as const, baseOrder: 300 },
      ];
      
      for (const section of cardSections) {
        // Find the section in HTML
        const sectionRegex = new RegExp(`id="${section.id}"[^>]*>[\\s\\S]*?(?=id="(?:main-card|prelims-card|early-prelims)"|<footer)`, 'i');
        const sectionMatch = html.match(sectionRegex);
        
        if (sectionMatch) {
          const sectionHtml = sectionMatch[0];
          
          // Parse each fight block (c-listing-fight)
          const fightBlockRegex = /<div class="c-listing-fight"[^>]*data-fmid="(\d+)"[^>]*>([\s\S]*?)(?=<div class="c-listing-fight"[^>]*data-fmid="|$)/g;
          
          let fightMatch;
          let sectionOrder = 1;
          
          while ((fightMatch = fightBlockRegex.exec(sectionHtml)) !== null) {
            const [, fightId, fightHtml] = fightMatch;
            
            // Extract weight class
            const weightClassMatch = fightHtml.match(/<div class="c-listing-fight__class-text">([^<]+)<\/div>/);
            const weightClassRaw = weightClassMatch ? weightClassMatch[1] : 'Unknown';
            const weightClass = weightClassRaw.replace(/Combat.*$/i, '').trim();
            const isTitleFight = weightClassRaw.toLowerCase().includes('championnat') || weightClassRaw.toLowerCase().includes('championship');
            
            // Extract red corner (Fighter A) - name
            const redNameMatch = fightHtml.match(/<div class="c-listing-fight__corner-name c-listing-fight__corner-name--red">[\s\S]*?<span class="c-listing-fight__corner-given-name">([^<]*)<\/span>[\s\S]*?<span class="c-listing-fight__corner-family-name">([^<]*)<\/span>/);
            const fighterAFirstName = redNameMatch ? redNameMatch[1].trim() : '';
            const fighterALastName = redNameMatch ? redNameMatch[2].trim() : '';
            
            // Extract blue corner (Fighter B) - name
            const blueNameMatch = fightHtml.match(/<div class="c-listing-fight__corner-name c-listing-fight__corner-name--blue">[\s\S]*?<span class="c-listing-fight__corner-given-name">([^<]*)<\/span>[\s\S]*?<span class="c-listing-fight__corner-family-name">([^<]*)<\/span>/);
            const fighterBFirstName = blueNameMatch ? blueNameMatch[1].trim() : '';
            const fighterBLastName = blueNameMatch ? blueNameMatch[2].trim() : '';
            
            // Extract red corner image (Fighter A)
            const redImageMatch = fightHtml.match(/<div class="c-listing-fight__corner-image--red">[\s\S]*?<img[^>]*src="([^"]+)"/);
            const fighterAImageUrl = redImageMatch ? this.convertToHeadshotUrl(redImageMatch[1]) : null;
            
            // Extract blue corner image (Fighter B)
            const blueImageMatch = fightHtml.match(/<div class="c-listing-fight__corner-image--blue">[\s\S]*?<img[^>]*src="([^"]+)"/);
            const fighterBImageUrl = blueImageMatch ? this.convertToHeadshotUrl(blueImageMatch[1]) : null;
            
            // Skip if we couldn't find fighter names
            if (!fighterAFirstName && !fighterALastName) continue;
            
            // Generate external IDs from names
            const fighterAId = `${fighterAFirstName.toLowerCase()}-${fighterALastName.toLowerCase()}`.replace(/\s+/g, '-');
            const fighterBId = `${fighterBFirstName.toLowerCase()}-${fighterBLastName.toLowerCase()}`.replace(/\s+/g, '-');
            
            // Calculate order: Main Card fights first (100+), then Prelims (200+), then Early Prelims (300+)
            const order = section.baseOrder + sectionOrder;
            
            fights.push({
              externalId: `${eventExternalId}-fight-${fightId}`,
              eventExternalId,
              fighterAExternalId: fighterAId,
              fighterAFirstName,
              fighterALastName,
              fighterANickname: null,
              fighterACountry: 'Unknown',
              fighterARecord: '0-0-0',
              fighterAImageUrl,
              fighterBExternalId: fighterBId,
              fighterBFirstName,
              fighterBLastName,
              fighterBNickname: null,
              fighterBCountry: 'Unknown',
              fighterBRecord: '0-0-0',
              fighterBImageUrl,
              weightClass,
              isTitleFight,
              isMainEvent: section.cardType === 'MAIN' && sectionOrder === 1,
              isCoMainEvent: section.cardType === 'MAIN' && sectionOrder === 2,
              order,
              cardType: section.cardType,
            });
            
            sectionOrder++;
          }
        }
      }
      
      // Sort by order (Main Card first, then Prelims, then Early Prelims)
      fights.sort((a, b) => a.order - b.order);
      
      console.info(`✅ Found ${fights.length} fights for ${eventExternalId}`);
      if (fights.length > 0 && fights[0].fighterAImageUrl) {
        console.info(`📸 Fighter images extracted successfully!`);
      }
      
    } catch (error) {
      console.error(`Error scraping fight card for ${eventExternalId}:`, error);
    }
    
    return fights;
  }

  async getUpcomingEvents(): Promise<MmaEvent[]> {
    const events: MmaEvent[] = [];

    try {
      console.info('🔍 Scraping UFC website for events...');
      
      // Fetch the UFC events page
      const response = await fetch('https://www.ufc.com/events', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (!response.ok) {
        console.error('UFC website error:', response.status);
        return this.getFallbackEvents();
      }

      const html = await response.text();
      
      // Parse upcoming events from HTML
      // Match pattern: href="/event/[slug]"...headline>[name]</a>...data-main-card-timestamp="[timestamp]"
      const eventRegex = /<a href="\/event\/([^"]+)"[^>]*>([^<]+)<\/a><\/h3>[\s\S]*?data-main-card-timestamp="(\d+)"/g;
      const venueRegex = /<div class="field field--name-venue[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      
      let match;
      const now = Date.now() / 1000; // Current timestamp in seconds
      
      while ((match = eventRegex.exec(html)) !== null) {
        const [, slug, name, timestamp] = match;
        const eventTimestamp = parseInt(timestamp, 10);
        
        // Only include future events
        if (eventTimestamp > now) {
          // Determine if it's a numbered UFC event or Fight Night
          const isNumberedEvent = slug.match(/^ufc-(\d+)$/);
          const eventName = isNumberedEvent 
            ? `UFC ${isNumberedEvent[1]}: ${name.trim()}`
            : `UFC Fight Night: ${name.trim()}`;
          
          events.push({
            externalId: slug,
            organizationExternalId: 'UFC',
            name: eventName,
            dateTimeUtc: new Date(eventTimestamp * 1000).toISOString(),
            venue: null,
            city: 'Las Vegas', // Default, would need more parsing for exact location
            country: 'USA',
            status: 'SCHEDULED',
            description: name.trim(),
            posterUrl: null,
            isAmateurEvent: false,
          });
        }
      }
      
      console.info(`✅ Found ${events.length} upcoming UFC events from website`);
      
      // Sort by date
      events.sort((a, b) => new Date(a.dateTimeUtc).getTime() - new Date(b.dateTimeUtc).getTime());
      
    } catch (error) {
      console.error('Error scraping UFC website:', error);
      return this.getFallbackEvents();
    }

    return events.length > 0 ? events : this.getFallbackEvents();
  }

  /**
   * Fallback events with upcoming UFC events
   * Returns only events that are in the future
   */
  private getFallbackEvents(): MmaEvent[] {
    const now = new Date();
    
    // Fallback events scraped from UFC website (updated December 2025)
    const allEvents: MmaEvent[] = [
      {
        externalId: 'ufc-323',
        organizationExternalId: 'UFC',
        name: 'UFC 323: Dvalishvili vs Yan 2',
        dateTimeUtc: '2025-12-07T03:00:00Z', // timestamp 1765076400
        venue: 'T-Mobile Arena',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'Merab Dvalishvili vs Petr Yan 2',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-fight-night-december-13-2025',
        organizationExternalId: 'UFC',
        name: 'UFC Fight Night: Royval vs Kape',
        dateTimeUtc: '2025-12-14T03:00:00Z', // timestamp 1765681200
        venue: 'UFC APEX',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'Brandon Royval vs Manel Kape',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-324',
        organizationExternalId: 'UFC',
        name: 'UFC 324: Gaethje vs Pimblett',
        dateTimeUtc: '2026-01-25T02:00:00Z', // timestamp 1769306400
        venue: 'T-Mobile Arena',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'Justin Gaethje vs Paddy Pimblett',
        posterUrl: null,
        isAmateurEvent: false,
      },
    ];

    // Filter to only return future events
    return allEvents.filter(event => new Date(event.dateTimeUtc) > now);
  }

  async getPastEvents(limit: number = 5): Promise<MmaEvent[]> {
    // Return some recent completed events
    return [
      {
        externalId: 'ufc-309',
        organizationExternalId: 'UFC',
        name: 'UFC 309: Jones vs. Miocic',
        dateTimeUtc: '2025-11-16T22:00:00Z',
        venue: 'Madison Square Garden',
        city: 'New York',
        country: 'USA',
        status: 'COMPLETED',
        description: 'UFC Heavyweight Championship: Jon Jones vs Stipe Miocic',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-308',
        organizationExternalId: 'UFC',
        name: 'UFC 308: Topuria vs. Holloway',
        dateTimeUtc: '2025-10-26T18:00:00Z',
        venue: 'Etihad Arena',
        city: 'Abu Dhabi',
        country: 'UAE',
        status: 'COMPLETED',
        description: 'UFC Featherweight Championship: Ilia Topuria vs Max Holloway',
        posterUrl: null,
        isAmateurEvent: false,
      },
    ].slice(0, limit);
  }

  async getOrganizations() {
    return [
      {
        externalId: 'UFC',
        name: 'Ultimate Fighting Championship',
        shortName: 'UFC',
        country: 'USA',
        city: 'Las Vegas',
        websiteUrl: 'https://www.ufc.com',
        level: 'MAJOR' as const,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/1200px-UFC_Logo.svg.png',
      },
      {
        externalId: 'BELLATOR',
        name: 'Bellator MMA',
        shortName: 'Bellator',
        country: 'USA',
        city: 'Hollywood',
        websiteUrl: 'https://www.bellator.com',
        level: 'MAJOR' as const,
        logoUrl: null,
      },
      {
        externalId: 'ONE',
        name: 'ONE Championship',
        shortName: 'ONE',
        country: 'Singapore',
        city: 'Singapore',
        websiteUrl: 'https://www.onefc.com',
        level: 'MAJOR' as const,
        logoUrl: null,
      },
      {
        externalId: 'PFL',
        name: 'Professional Fighters League',
        shortName: 'PFL',
        country: 'USA',
        city: 'New York',
        websiteUrl: 'https://www.pflmma.com',
        level: 'MAJOR' as const,
        logoUrl: null,
      },
    ];
  }
}

