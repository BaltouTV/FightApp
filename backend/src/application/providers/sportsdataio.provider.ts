import {
  BaseMmaDataProvider,
  ExternalEventDTO,
  ExternalEventDetailsDTO,
  ExternalFighterDTO,
} from './mma-data-provider.js';

/**
 * SportsData.io MMA API Provider
 * 
 * Note: This is a stub implementation. The actual API responses
 * would need to be mapped according to the SportsData.io API documentation.
 */
export class SportsDataIoProvider extends BaseMmaDataProvider {
  readonly providerName = 'sportsdataio';

  constructor() {
    const apiKey = process.env.MMA_API_KEY || '';
    const baseUrl = process.env.MMA_API_BASE_URL || 'https://api.sportsdata.io/v3/mma';
    super(apiKey, baseUrl);
  }

  async fetchUpcomingEvents(): Promise<ExternalEventDTO[]> {
    if (!this.apiKey) {
      console.warn('SportsData.io API key not configured');
      return [];
    }

    try {
      // Example API call structure - adjust based on actual API
      const url = `${this.baseUrl}/scores/json/Schedule/2024?key=${this.apiKey}`;
      
      const data = await this.fetchWithRetry<SportsDataScheduleResponse[]>(url);
      
      return data.map((event) => this.mapToExternalEvent(event));
    } catch (error) {
      console.error('Failed to fetch upcoming events from SportsData.io:', error);
      return [];
    }
  }

  async fetchEventDetails(externalEventId: string): Promise<ExternalEventDetailsDTO> {
    if (!this.apiKey) {
      throw new Error('SportsData.io API key not configured');
    }

    try {
      const url = `${this.baseUrl}/scores/json/Event/${externalEventId}?key=${this.apiKey}`;
      
      const data = await this.fetchWithRetry<SportsDataEventDetails>(url);
      
      return this.mapToExternalEventDetails(data);
    } catch (error) {
      console.error(`Failed to fetch event ${externalEventId} from SportsData.io:`, error);
      throw error;
    }
  }

  async fetchFighterByExternalId(externalFighterId: string): Promise<ExternalFighterDTO | null> {
    if (!this.apiKey) {
      console.warn('SportsData.io API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/scores/json/Fighter/${externalFighterId}?key=${this.apiKey}`;
      
      const data = await this.fetchWithRetry<SportsDataFighter>(url);
      
      return this.mapToExternalFighter(data);
    } catch (error) {
      console.error(`Failed to fetch fighter ${externalFighterId} from SportsData.io:`, error);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const url = `${this.baseUrl}/scores/json/Leagues?key=${this.apiKey}`;
      await this.fetchWithRetry(url);
      return true;
    } catch {
      return false;
    }
  }

  // Mapping functions - these would be implemented based on actual API response structure
  private mapToExternalEvent(data: SportsDataScheduleResponse): ExternalEventDTO {
    return {
      externalId: data.EventId?.toString() || '',
      name: data.Name || 'Unknown Event',
      organizationName: data.League || 'UFC',
      venue: data.Venue || undefined,
      city: data.City || undefined,
      country: data.Country || 'USA',
      dateTimeUtc: data.DateTime || new Date().toISOString(),
      status: this.mapEventStatus(data.Status),
      isAmateurEvent: false,
    };
  }

  private mapToExternalEventDetails(data: SportsDataEventDetails): ExternalEventDetailsDTO {
    return {
      event: this.mapToExternalEvent(data),
      fights: (data.Fights || []).map((fight) => ({
        externalId: fight.FightId?.toString() || '',
        externalEventId: data.EventId?.toString() || '',
        fighterAExternalId: fight.FighterIdA?.toString() || '',
        fighterBExternalId: fight.FighterIdB?.toString() || '',
        winnerExternalId: fight.WinnerId?.toString(),
        resultStatus: this.mapFightStatus(fight.ResultStatus),
        method: fight.Method,
        methodDetail: fight.MethodDetail,
        round: fight.Round,
        time: fight.Time,
        weightClass: fight.WeightClass || 'Unknown',
        isTitleFight: fight.IsTitleFight || false,
        isMainEvent: fight.IsMainEvent || false,
        isCoMainEvent: fight.IsCoMainEvent || false,
      })),
      fighters: (data.Fighters || []).map((f) => this.mapToExternalFighter(f)),
    };
  }

  private mapToExternalFighter(data: SportsDataFighter): ExternalFighterDTO {
    return {
      externalId: data.FighterId?.toString() || '',
      firstName: data.FirstName || '',
      lastName: data.LastName || '',
      nickname: data.Nickname || undefined,
      birthDate: data.BirthDate || undefined,
      country: data.Country || 'Unknown',
      city: data.City || undefined,
      team: data.Team || undefined,
      heightCm: data.HeightCm || undefined,
      reachCm: data.ReachCm || undefined,
      stance: this.mapStance(data.Stance),
      weightClass: data.WeightClass || 'Unknown',
      isPro: true,
      imageUrl: data.ImageUrl || undefined,
      wins: data.Wins || 0,
      losses: data.Losses || 0,
      draws: data.Draws || 0,
      noContests: data.NoContests || 0,
    };
  }

  private mapEventStatus(status?: string): 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINAL':
        return 'COMPLETED';
      case 'CANCELLED':
      case 'POSTPONED':
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  private mapFightStatus(
    status?: string
  ): 'SCHEDULED' | 'COMPLETED' | 'DRAW' | 'NO_CONTEST' | 'CANCELLED' {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'FINAL':
        return 'COMPLETED';
      case 'DRAW':
        return 'DRAW';
      case 'NC':
      case 'NO_CONTEST':
        return 'NO_CONTEST';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  private mapStance(stance?: string): 'ORTHODOX' | 'SOUTHPAW' | 'SWITCH' | 'OTHER' | 'UNKNOWN' {
    switch (stance?.toUpperCase()) {
      case 'ORTHODOX':
        return 'ORTHODOX';
      case 'SOUTHPAW':
        return 'SOUTHPAW';
      case 'SWITCH':
        return 'SWITCH';
      case 'OTHER':
        return 'OTHER';
      default:
        return 'UNKNOWN';
    }
  }
}

// Type definitions for SportsData.io API responses (simplified)
interface SportsDataScheduleResponse {
  EventId?: number;
  Name?: string;
  League?: string;
  Venue?: string;
  City?: string;
  Country?: string;
  DateTime?: string;
  Status?: string;
}

interface SportsDataEventDetails extends SportsDataScheduleResponse {
  Fights?: SportsDataFight[];
  Fighters?: SportsDataFighter[];
}

interface SportsDataFight {
  FightId?: number;
  FighterIdA?: number;
  FighterIdB?: number;
  WinnerId?: number;
  ResultStatus?: string;
  Method?: string;
  MethodDetail?: string;
  Round?: number;
  Time?: string;
  WeightClass?: string;
  IsTitleFight?: boolean;
  IsMainEvent?: boolean;
  IsCoMainEvent?: boolean;
}

interface SportsDataFighter {
  FighterId?: number;
  FirstName?: string;
  LastName?: string;
  Nickname?: string;
  BirthDate?: string;
  Country?: string;
  City?: string;
  Team?: string;
  HeightCm?: number;
  ReachCm?: number;
  Stance?: string;
  WeightClass?: string;
  ImageUrl?: string;
  Wins?: number;
  Losses?: number;
  Draws?: number;
  NoContests?: number;
}

