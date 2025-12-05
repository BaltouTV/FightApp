import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fightapp_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types
interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface FighterBasicDTO {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  fullName: string;
  country: string;
  weightClass: string;
  isPro: boolean;
  imageUrl: string | null;
  proWins: number;
  proLosses: number;
  proDraws: number;
}

interface FighterFightHistoryDTO {
  fightId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  opponent: FighterBasicDTO;
  isWinner: boolean | null;
  method: string | null;
  round: number | null;
  time: string | null;
}

interface FighterDetailDTO extends FighterBasicDTO {
  birthDate: string | null;
  age: number | null;
  city: string | null;
  team: string | null;
  heightCm: number | null;
  reachCm: number | null;
  stance: string;
  proNoContests: number;
  proWinsByKO: number;
  proWinsBySubmission: number;
  proWinsByDecision: number;
  proLossesByKO: number;
  proLossesBySubmission: number;
  proLossesByDecision: number;
  amateurWins: number;
  amateurLosses: number;
  amateurDraws: number;
  amateurNoContests: number;
  upcomingFights: FighterFightHistoryDTO[];
  recentFights: FighterFightHistoryDTO[];
}

interface EventBasicDTO {
  id: string;
  name: string;
  slug: string;
  dateTimeUtc: string;
  city: string | null;
  country: string;
  status: string;
  isAmateurEvent: boolean;
  organization: {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
    level: string;
  };
}

interface FightDTO {
  id: string;
  fighterA: FighterBasicDTO;
  fighterB: FighterBasicDTO;
  winnerId: string | null;
  resultStatus: string;
  method: string | null;
  round: number | null;
  time: string | null;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
}

interface EventDetailDTO extends EventBasicDTO {
  organizationId: string;
  description: string | null;
  venue: string | null;
  fights: FightDTO[];
  organization: {
    id: string;
    name: string;
    shortName: string | null;
    country: string;
    city: string | null;
    level: string;
    logoUrl: string | null;
    websiteUrl: string | null;
  };
}

interface UserDTO {
  id: string;
  email: string;
  displayName: string;
}

interface AuthResponseDTO {
  user: UserDTO;
  token: string;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const response = await client.post<{ data: AuthResponseDTO }>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResponseDTO> {
    const response = await client.post<{ data: AuthResponseDTO }>('/auth/register', {
      email,
      password,
      displayName,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<UserDTO> {
    const response = await client.get<{ data: UserDTO }>('/auth/me');
    return response.data.data;
  },

  // Events
  async getUpcomingEvents(params?: {
    page?: number;
    pageSize?: number;
    organizationId?: string;
  }): Promise<PaginatedResult<EventBasicDTO>> {
    const response = await client.get<{
      data: EventBasicDTO[];
      meta: PaginatedResult<EventBasicDTO>['meta'];
    }>('/events/upcoming', { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getEventById(id: string): Promise<EventDetailDTO> {
    const response = await client.get<{ data: EventDetailDTO }>(`/events/${id}`);
    return response.data.data;
  },

  // Fighters
  async searchFighters(params?: {
    q?: string;
    country?: string;
    weightClass?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<FighterBasicDTO>> {
    const response = await client.get<{
      data: FighterBasicDTO[];
      meta: PaginatedResult<FighterBasicDTO>['meta'];
    }>('/fighters/search', { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getFighterById(id: string): Promise<FighterDetailDTO> {
    const response = await client.get<{ data: FighterDetailDTO }>(`/fighters/${id}`);
    return response.data.data;
  },
};

