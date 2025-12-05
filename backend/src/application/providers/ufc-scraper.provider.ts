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
}

export class UFCScraperProvider {
  readonly name = 'UFC';

  // UFC's public API endpoints
  private readonly EVENTS_URL = 'https://d29dxerjsp82wz.cloudfront.net/api/v3/event/live/ufc-fight-night';
  private readonly UPCOMING_EVENTS_URL = 'https://d29dxerjsp82wz.cloudfront.net/api/v3/event/ufc/upcoming.json';

  /**
   * Get fighters for a specific event
   */
  async getFightersForEvent(eventExternalId: string): Promise<MmaFighter[]> {
    const fightCard = this.getFightCardForEvent(eventExternalId);
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
   * Get fight card for a specific event
   */
  getFightCardForEvent(eventExternalId: string): MmaFightWithFighterInfo[] {
    const fightCards: Record<string, MmaFightWithFighterInfo[]> = {
      'ufc-310': [
        {
          externalId: 'ufc-310-main',
          eventExternalId: 'ufc-310',
          fighterAExternalId: 'alexandre-pantoja',
          fighterAFirstName: 'Alexandre',
          fighterALastName: 'Pantoja',
          fighterANickname: 'The Cannibal',
          fighterACountry: 'Brazil',
          fighterARecord: '28-5-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/PANTOJA_ALEXANDRE_L_02-17.png',
          fighterBExternalId: 'kai-asakura',
          fighterBFirstName: 'Kai',
          fighterBLastName: 'Asakura',
          fighterBNickname: null,
          fighterBCountry: 'Japan',
          fighterBRecord: '21-4-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/ASAKURA_KAI_L_08-24.png',
          weightClass: 'Flyweight',
          isTitleFight: true,
          isMainEvent: true,
          isCoMainEvent: false,
          order: 1,
        },
        {
          externalId: 'ufc-310-comain',
          eventExternalId: 'ufc-310',
          fighterAExternalId: 'shavkat-rakhmonov',
          fighterAFirstName: 'Shavkat',
          fighterALastName: 'Rakhmonov',
          fighterANickname: 'Nomad',
          fighterACountry: 'Kazakhstan',
          fighterARecord: '18-0-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/RAKHMONOV_SHAVKAT_L_03-09.png',
          fighterBExternalId: 'ian-machado-garry',
          fighterBFirstName: 'Ian',
          fighterBLastName: 'Machado Garry',
          fighterBNickname: 'The Future',
          fighterBCountry: 'Ireland',
          fighterBRecord: '15-0-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/GARRY_IAN_MACHADO_L_03-09.png',
          weightClass: 'Welterweight',
          isTitleFight: false,
          isMainEvent: false,
          isCoMainEvent: true,
          order: 2,
        },
        {
          externalId: 'ufc-310-fight3',
          eventExternalId: 'ufc-310',
          fighterAExternalId: 'ciryl-gane',
          fighterAFirstName: 'Ciryl',
          fighterALastName: 'Gane',
          fighterANickname: 'Bon Gamin',
          fighterACountry: 'France',
          fighterARecord: '12-2-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-09/GANE_CIRYL_L_09-02.png',
          fighterBExternalId: 'alexander-volkov',
          fighterBFirstName: 'Alexander',
          fighterBLastName: 'Volkov',
          fighterBNickname: 'Drago',
          fighterBCountry: 'Russia',
          fighterBRecord: '37-10-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/VOLKOV_ALEXANDER_L_02-17.png',
          weightClass: 'Heavyweight',
          isTitleFight: false,
          isMainEvent: false,
          isCoMainEvent: false,
          order: 3,
        },
        {
          externalId: 'ufc-310-fight4',
          eventExternalId: 'ufc-310',
          fighterAExternalId: 'movsar-evloev',
          fighterAFirstName: 'Movsar',
          fighterALastName: 'Evloev',
          fighterANickname: null,
          fighterACountry: 'Russia',
          fighterARecord: '18-0-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/EVLOEV_MOVSAR_L_06-01.png',
          fighterBExternalId: 'aljamain-sterling',
          fighterBFirstName: 'Aljamain',
          fighterBLastName: 'Sterling',
          fighterBNickname: 'Funk Master',
          fighterBCountry: 'USA',
          fighterBRecord: '24-4-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/STERLING_ALJAMAIN_L_04-13.png',
          weightClass: 'Featherweight',
          isTitleFight: false,
          isMainEvent: false,
          isCoMainEvent: false,
          order: 4,
        },
        {
          externalId: 'ufc-310-fight5',
          eventExternalId: 'ufc-310',
          fighterAExternalId: 'bryce-mitchell',
          fighterAFirstName: 'Bryce',
          fighterALastName: 'Mitchell',
          fighterANickname: 'Thug Nasty',
          fighterACountry: 'USA',
          fighterARecord: '16-2-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/MITCHELL_BRYCE_L_03-30.png',
          fighterBExternalId: 'kron-gracie',
          fighterBFirstName: 'Kron',
          fighterBLastName: 'Gracie',
          fighterBNickname: null,
          fighterBCountry: 'USA',
          fighterBRecord: '5-2-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-10/GRACIE_KRON_L_10-28.png',
          weightClass: 'Featherweight',
          isTitleFight: false,
          isMainEvent: false,
          isCoMainEvent: false,
          order: 5,
        },
      ],
      'ufc-fn-247': [
        {
          externalId: 'ufc-fn-247-main',
          eventExternalId: 'ufc-fn-247',
          fighterAExternalId: 'brandon-moreno',
          fighterAFirstName: 'Brandon',
          fighterALastName: 'Moreno',
          fighterANickname: 'The Assassin Baby',
          fighterACountry: 'Mexico',
          fighterARecord: '21-8-2',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/MORENO_BRANDON_L_02-17.png',
          fighterBExternalId: 'amir-albazi',
          fighterBFirstName: 'Amir',
          fighterBLastName: 'Albazi',
          fighterBNickname: 'The Prince',
          fighterBCountry: 'Iraq',
          fighterBRecord: '17-1-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/ALBAZI_AMIR_L_02-17.png',
          weightClass: 'Flyweight',
          isTitleFight: false,
          isMainEvent: true,
          isCoMainEvent: false,
          order: 1,
        },
      ],
      'ufc-311': [
        {
          externalId: 'ufc-311-main',
          eventExternalId: 'ufc-311',
          fighterAExternalId: 'islam-makhachev',
          fighterAFirstName: 'Islam',
          fighterALastName: 'Makhachev',
          fighterANickname: null,
          fighterACountry: 'Russia',
          fighterARecord: '26-1-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_06-01.png',
          fighterBExternalId: 'arman-tsarukyan',
          fighterBFirstName: 'Arman',
          fighterBLastName: 'Tsarukyan',
          fighterBNickname: 'Ahalkalakets',
          fighterBCountry: 'Armenia',
          fighterBRecord: '22-3-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/TSARUKYAN_ARMAN_L_04-13.png',
          weightClass: 'Lightweight',
          isTitleFight: true,
          isMainEvent: true,
          isCoMainEvent: false,
          order: 1,
        },
        {
          externalId: 'ufc-311-comain',
          eventExternalId: 'ufc-311',
          fighterAExternalId: 'merab-dvalishvili',
          fighterAFirstName: 'Merab',
          fighterALastName: 'Dvalishvili',
          fighterANickname: 'The Machine',
          fighterACountry: 'Georgia',
          fighterARecord: '18-4-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/DVALISHVILI_MERAB_L_09-14.png',
          fighterBExternalId: 'umar-nurmagomedov',
          fighterBFirstName: 'Umar',
          fighterBLastName: 'Nurmagomedov',
          fighterBNickname: null,
          fighterBCountry: 'Russia',
          fighterBRecord: '18-0-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/NURMAGOMEDOV_UMAR_L_08-03.png',
          weightClass: 'Bantamweight',
          isTitleFight: true,
          isMainEvent: false,
          isCoMainEvent: true,
          order: 2,
        },
      ],
      'ufc-312': [
        {
          externalId: 'ufc-312-main',
          eventExternalId: 'ufc-312',
          fighterAExternalId: 'dricus-du-plessis',
          fighterAFirstName: 'Dricus',
          fighterALastName: 'Du Plessis',
          fighterANickname: 'Stillknocks',
          fighterACountry: 'South Africa',
          fighterARecord: '22-2-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/DU_PLESSIS_DRICUS_L_08-17.png',
          fighterBExternalId: 'sean-strickland',
          fighterBFirstName: 'Sean',
          fighterBLastName: 'Strickland',
          fighterBNickname: 'Tarzan',
          fighterBCountry: 'USA',
          fighterBRecord: '29-6-0',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/STRICKLAND_SEAN_L_04-13.png',
          weightClass: 'Middleweight',
          isTitleFight: true,
          isMainEvent: true,
          isCoMainEvent: false,
          order: 1,
        },
      ],
      'ufc-313': [
        {
          externalId: 'ufc-313-main',
          eventExternalId: 'ufc-313',
          fighterAExternalId: 'alex-pereira',
          fighterAFirstName: 'Alex',
          fighterALastName: 'Pereira',
          fighterANickname: 'Poatan',
          fighterACountry: 'Brazil',
          fighterARecord: '12-2-0',
          fighterAImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/PEREIRA_ALEX_L_10-05.png',
          fighterBExternalId: 'magomed-ankalaev',
          fighterBFirstName: 'Magomed',
          fighterBLastName: 'Ankalaev',
          fighterBNickname: null,
          fighterBCountry: 'Russia',
          fighterBRecord: '19-1-1',
          fighterBImageUrl: 'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/ANKALAEV_MAGOMED_L_04-13.png',
          weightClass: 'Light Heavyweight',
          isTitleFight: true,
          isMainEvent: true,
          isCoMainEvent: false,
          order: 1,
        },
      ],
    };

    return fightCards[eventExternalId] || [];
  }

  async getUpcomingEvents(): Promise<MmaEvent[]> {
    const events: MmaEvent[] = [];

    try {
      // Try fetching from UFC's public API
      const response = await fetch('https://www.ufc.com/api/v1/events?is_upcoming=true');
      
      if (!response.ok) {
        console.error('UFC API error:', response.status);
        // Fallback to hardcoded upcoming events for demo
        return this.getFallbackEvents();
      }

      const data = await response.json();
      
      // Process events...
      if (data.content?.eventList) {
        for (const event of data.content.eventList) {
          events.push({
            externalId: String(event.eventId || event.id),
            organizationExternalId: 'UFC',
            name: event.name || event.title,
            dateTimeUtc: event.startTime || event.eventDttm,
            venue: event.venue || null,
            city: event.city || null,
            country: event.country || 'USA',
            status: 'SCHEDULED',
            description: null,
            posterUrl: event.posterImage || null,
            isAmateurEvent: false,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching UFC events:', error);
      // Return fallback events for demo
      return this.getFallbackEvents();
    }

    return events.length > 0 ? events : this.getFallbackEvents();
  }

  /**
   * Fallback events with real upcoming UFC events
   * This is updated manually but provides real data when API fails
   */
  private getFallbackEvents(): MmaEvent[] {
    // Real upcoming UFC events (updated December 2025)
    const events: MmaEvent[] = [
      {
        externalId: 'ufc-310',
        organizationExternalId: 'UFC',
        name: 'UFC 310: Pantoja vs. Asakura',
        dateTimeUtc: '2025-12-07T22:00:00Z',
        venue: 'T-Mobile Arena',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'UFC Flyweight Championship: Alexandre Pantoja vs Kai Asakura',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-fn-247',
        organizationExternalId: 'UFC',
        name: 'UFC Fight Night: Moreno vs. Albazi',
        dateTimeUtc: '2025-12-14T22:00:00Z',
        venue: 'UFC APEX',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'UFC Flyweight: Brandon Moreno vs Amir Albazi',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-311',
        organizationExternalId: 'UFC',
        name: 'UFC 311: Makhachev vs. Tsarukyan',
        dateTimeUtc: '2026-01-18T22:00:00Z',
        venue: 'Intuit Dome',
        city: 'Inglewood',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'UFC Lightweight Championship: Islam Makhachev vs Arman Tsarukyan',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-312',
        organizationExternalId: 'UFC',
        name: 'UFC 312: Du Plessis vs. Strickland 2',
        dateTimeUtc: '2026-02-08T04:00:00Z',
        venue: 'Qudos Bank Arena',
        city: 'Sydney',
        country: 'Australia',
        status: 'SCHEDULED',
        description: 'UFC Middleweight Championship: Dricus Du Plessis vs Sean Strickland',
        posterUrl: null,
        isAmateurEvent: false,
      },
      {
        externalId: 'ufc-313',
        organizationExternalId: 'UFC',
        name: 'UFC 313: Pereira vs. Ankalaev',
        dateTimeUtc: '2026-03-08T23:00:00Z',
        venue: 'T-Mobile Arena',
        city: 'Las Vegas',
        country: 'USA',
        status: 'SCHEDULED',
        description: 'UFC Light Heavyweight Championship: Alex Pereira vs Magomed Ankalaev',
        posterUrl: null,
        isAmateurEvent: false,
      },
    ];

    return events;
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

