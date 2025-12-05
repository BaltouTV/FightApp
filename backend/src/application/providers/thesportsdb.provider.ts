/**
 * TheSportsDB API Provider
 * Free API with MMA data including UFC events
 * https://www.thesportsdb.com/api.php
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Types for TheSportsDB provider
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
  birthDate: string | null;
  country: string;
  city: string | null;
  team: string | null;
  heightCm: number | null;
  reachCm: number | null;
  weightClass: string;
  stance: 'ORTHODOX' | 'SOUTHPAW' | 'SWITCH' | string;
  isPro: boolean;
  imageUrl: string | null;
  proWins: number;
  proLosses: number;
  proDraws: number;
  proNoContests: number;
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
}

export interface MmaOrganization {
  externalId: string;
  name: string;
  shortName: string;
  country: string;
  city?: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  level: 'MAJOR' | 'REGIONAL' | 'LOCAL' | 'AMATEUR';
}

// League IDs for MMA organizations
const LEAGUE_IDS = {
  UFC: '4443',
  BELLATOR: '4444',
  ONE_CHAMPIONSHIP: '4445',
  PFL: '4489',
};

interface TheSportsDBEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate: string;
  strFilename: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strSeason: string;
  strDescriptionEN: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTimestamp: string;
  dateEvent: string;
  strTime: string;
  strTimeLocal: string;
  strVenue: string;
  strCountry: string;
  strCity: string;
  strPoster: string;
  strThumb: string;
  strBanner: string;
  strStatus: string;
}

interface TheSportsDBPlayer {
  idPlayer: string;
  strPlayer: string;
  strNationality: string;
  strBirthLocation: string;
  dateBorn: string;
  strNumber: string;
  strTeam: string;
  strSport: string;
  strPosition: string;
  strHeight: string;
  strWeight: string;
  strThumb: string;
  strCutout: string;
  strRender: string;
  strBanner: string;
  strFanart1: string;
  strDescription: string;
  strGender: string;
  strSide: string;
  strCollege: string;
  strFacebook: string;
  strTwitter: string;
  strInstagram: string;
  strYoutube: string;
  strWebsite: string;
}

interface TheSportsDBLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate: string;
  intFormedYear: string;
  strCountry: string;
  strWebsite: string;
  strDescriptionEN: string;
  strBadge: string;
  strLogo: string;
  strBanner: string;
  strPoster: string;
}

export class TheSportsDBProvider implements MmaDataProvider {
  readonly name = 'TheSportsDB';

  private async fetchJson<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`TheSportsDB API error: ${response.status}`);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('TheSportsDB fetch error:', error);
      return null;
    }
  }

  async getUpcomingEvents(): Promise<MmaEvent[]> {
    const events: MmaEvent[] = [];

    // Fetch upcoming events from all major organizations
    for (const [orgName, leagueId] of Object.entries(LEAGUE_IDS)) {
      try {
        const url = `${BASE_URL}/eventsnextleague.php?id=${leagueId}`;
        const data = await this.fetchJson<{ events: TheSportsDBEvent[] | null }>(url);

        if (data?.events) {
          for (const event of data.events) {
            events.push(this.mapEvent(event, orgName));
          }
        }
      } catch (error) {
        console.error(`Error fetching ${orgName} events:`, error);
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.dateTimeUtc).getTime() - new Date(b.dateTimeUtc).getTime());

    return events;
  }

  async getPastEvents(limit: number = 20): Promise<MmaEvent[]> {
    const events: MmaEvent[] = [];

    for (const [orgName, leagueId] of Object.entries(LEAGUE_IDS)) {
      try {
        const url = `${BASE_URL}/eventspastleague.php?id=${leagueId}`;
        const data = await this.fetchJson<{ events: TheSportsDBEvent[] | null }>(url);

        if (data?.events) {
          for (const event of data.events.slice(0, limit)) {
            events.push(this.mapEvent(event, orgName));
          }
        }
      } catch (error) {
        console.error(`Error fetching past ${orgName} events:`, error);
      }
    }

    // Sort by date descending
    events.sort((a, b) => new Date(b.dateTimeUtc).getTime() - new Date(a.dateTimeUtc).getTime());

    return events.slice(0, limit);
  }

  async getEventById(externalId: string): Promise<MmaEvent | null> {
    const url = `${BASE_URL}/lookupevent.php?id=${externalId}`;
    const data = await this.fetchJson<{ events: TheSportsDBEvent[] | null }>(url);

    if (!data?.events?.[0]) return null;

    const event = data.events[0];
    return this.mapEvent(event, event.strLeague);
  }

  async searchFighters(query: string): Promise<MmaFighter[]> {
    // TheSportsDB requires a team name for player search
    // We'll search across major MMA organizations
    const fighters: MmaFighter[] = [];

    for (const orgName of Object.keys(LEAGUE_IDS)) {
      try {
        const url = `${BASE_URL}/searchplayers.php?t=${encodeURIComponent(orgName)}&p=${encodeURIComponent(query)}`;
        const data = await this.fetchJson<{ player: TheSportsDBPlayer[] | null }>(url);

        if (data?.player) {
          for (const player of data.player) {
            if (player.strSport?.toLowerCase().includes('mma') || 
                player.strSport?.toLowerCase().includes('fighting') ||
                player.strPosition?.toLowerCase().includes('fighter')) {
              fighters.push(this.mapFighter(player));
            }
          }
        }
      } catch (error) {
        console.error(`Error searching fighters in ${orgName}:`, error);
      }
    }

    return fighters;
  }

  async getFighterById(externalId: string): Promise<MmaFighter | null> {
    const url = `${BASE_URL}/lookupplayer.php?id=${externalId}`;
    const data = await this.fetchJson<{ players: TheSportsDBPlayer[] | null }>(url);

    if (!data?.players?.[0]) return null;
    return this.mapFighter(data.players[0]);
  }

  async getOrganizations(): Promise<MmaOrganization[]> {
    const orgs: MmaOrganization[] = [];

    for (const [orgName, leagueId] of Object.entries(LEAGUE_IDS)) {
      try {
        const url = `${BASE_URL}/lookupleague.php?id=${leagueId}`;
        const data = await this.fetchJson<{ leagues: TheSportsDBLeague[] | null }>(url);

        if (data?.leagues?.[0]) {
          const league = data.leagues[0];
          orgs.push({
            externalId: league.idLeague,
            name: league.strLeague,
            shortName: orgName,
            country: league.strCountry || 'USA',
            websiteUrl: league.strWebsite ? `https://${league.strWebsite}` : null,
            logoUrl: league.strBadge || league.strLogo,
            level: orgName === 'UFC' ? 'MAJOR' : 'REGIONAL',
          });
        }
      } catch (error) {
        console.error(`Error fetching ${orgName} info:`, error);
      }
    }

    return orgs;
  }

  async getFightsByEvent(eventExternalId: string): Promise<MmaFight[]> {
    // TheSportsDB doesn't provide individual fight cards
    // We would need to scrape from another source for this
    return [];
  }

  private mapEvent(event: TheSportsDBEvent, orgName: string): MmaEvent {
    // Parse date and time
    let dateTimeUtc: string;
    if (event.strTimestamp) {
      dateTimeUtc = event.strTimestamp;
    } else if (event.dateEvent && event.strTime) {
      dateTimeUtc = `${event.dateEvent}T${event.strTime}:00Z`;
    } else {
      dateTimeUtc = `${event.dateEvent}T00:00:00Z`;
    }

    // Determine status
    let status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'SCHEDULED';
    if (event.strStatus === 'Match Finished' || event.intHomeScore !== null) {
      status = 'COMPLETED';
    } else if (event.strStatus === 'Cancelled' || event.strStatus === 'Postponed') {
      status = 'CANCELLED';
    }

    return {
      externalId: event.idEvent,
      organizationExternalId: event.idLeague,
      name: event.strEvent || event.strEventAlternate || `${orgName} Event`,
      dateTimeUtc,
      venue: event.strVenue || null,
      city: event.strCity || null,
      country: event.strCountry || 'USA',
      status,
      description: event.strDescriptionEN || null,
      posterUrl: event.strPoster || event.strThumb || null,
      isAmateurEvent: false,
    };
  }

  private mapFighter(player: TheSportsDBPlayer): MmaFighter {
    // Parse name
    const nameParts = player.strPlayer.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Parse height (format: "6 ft 0 in" or "183 cm")
    let heightCm: number | null = null;
    if (player.strHeight) {
      const cmMatch = player.strHeight.match(/(\d+)\s*cm/i);
      const ftMatch = player.strHeight.match(/(\d+)\s*ft\s*(\d+)?\s*in/i);
      if (cmMatch) {
        heightCm = parseInt(cmMatch[1], 10);
      } else if (ftMatch) {
        const feet = parseInt(ftMatch[1], 10);
        const inches = parseInt(ftMatch[2] || '0', 10);
        heightCm = Math.round((feet * 30.48) + (inches * 2.54));
      }
    }

    // Parse weight
    let weightClass = 'Unknown';
    if (player.strWeight) {
      const weightMatch = player.strWeight.match(/(\d+)/);
      if (weightMatch) {
        const weightLbs = parseInt(weightMatch[1], 10);
        weightClass = this.getWeightClass(weightLbs);
      }
    }

    // Calculate age
    let birthDate: string | null = null;
    if (player.dateBorn && player.dateBorn !== '0000-00-00') {
      birthDate = player.dateBorn;
    }

    return {
      externalId: player.idPlayer,
      firstName,
      lastName,
      nickname: null,
      birthDate,
      country: player.strNationality || 'Unknown',
      city: player.strBirthLocation || null,
      team: player.strTeam || null,
      heightCm,
      reachCm: null, // Not available in TheSportsDB
      weightClass,
      stance: (player.strSide as 'ORTHODOX' | 'SOUTHPAW' | 'SWITCH') || 'ORTHODOX',
      isPro: true,
      imageUrl: player.strThumb || player.strCutout || null,
      // Stats not available in TheSportsDB - would need another source
      proWins: 0,
      proLosses: 0,
      proDraws: 0,
      proNoContests: 0,
    };
  }

  private getWeightClass(weightLbs: number): string {
    if (weightLbs <= 115) return 'Strawweight';
    if (weightLbs <= 125) return 'Flyweight';
    if (weightLbs <= 135) return 'Bantamweight';
    if (weightLbs <= 145) return 'Featherweight';
    if (weightLbs <= 155) return 'Lightweight';
    if (weightLbs <= 170) return 'Welterweight';
    if (weightLbs <= 185) return 'Middleweight';
    if (weightLbs <= 205) return 'Light Heavyweight';
    return 'Heavyweight';
  }
}

