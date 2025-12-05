// External DTOs for data provider mapping
export interface ExternalFighterDTO {
  externalId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  birthDate?: string;
  country: string;
  city?: string;
  team?: string;
  heightCm?: number;
  reachCm?: number;
  stance?: 'ORTHODOX' | 'SOUTHPAW' | 'SWITCH' | 'OTHER' | 'UNKNOWN';
  weightClass: string;
  isPro: boolean;
  imageUrl?: string;
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
}

export interface ExternalEventDTO {
  externalId: string;
  name: string;
  organizationName: string;
  venue?: string;
  city?: string;
  country: string;
  dateTimeUtc: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  isAmateurEvent: boolean;
}

export interface ExternalFightDTO {
  externalId: string;
  externalEventId: string;
  fighterAExternalId: string;
  fighterBExternalId: string;
  winnerExternalId?: string;
  resultStatus: 'SCHEDULED' | 'COMPLETED' | 'DRAW' | 'NO_CONTEST' | 'CANCELLED';
  method?: string;
  methodDetail?: string;
  round?: number;
  time?: string;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
}

export interface ExternalEventDetailsDTO {
  event: ExternalEventDTO;
  fights: ExternalFightDTO[];
  fighters: ExternalFighterDTO[];
}

/**
 * Abstract interface for MMA data providers.
 * Implementations should handle API-specific authentication, rate limiting, and data mapping.
 */
export interface MmaDataProvider {
  /**
   * Provider identifier (e.g., 'sportsdataio', 'tapology')
   */
  readonly providerName: string;

  /**
   * Fetch a list of upcoming events
   */
  fetchUpcomingEvents(): Promise<ExternalEventDTO[]>;

  /**
   * Fetch detailed information about a specific event including fights and fighters
   */
  fetchEventDetails(externalEventId: string): Promise<ExternalEventDetailsDTO>;

  /**
   * Fetch fighter details by external ID
   */
  fetchFighterByExternalId(externalFighterId: string): Promise<ExternalFighterDTO | null>;

  /**
   * Search for fighters by name
   */
  searchFighters?(query: string): Promise<ExternalFighterDTO[]>;

  /**
   * Check if the provider is properly configured and accessible
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Base class with common functionality for MMA data providers
 */
export abstract class BaseMmaDataProvider implements MmaDataProvider {
  abstract readonly providerName: string;

  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract fetchUpcomingEvents(): Promise<ExternalEventDTO[]>;
  abstract fetchEventDetails(externalEventId: string): Promise<ExternalEventDetailsDTO>;
  abstract fetchFighterByExternalId(externalFighterId: string): Promise<ExternalFighterDTO | null>;
  abstract healthCheck(): Promise<boolean>;

  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * (i + 1);
          await this.sleep(waitTime);
          continue;
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await this.sleep(1000 * (i + 1));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

