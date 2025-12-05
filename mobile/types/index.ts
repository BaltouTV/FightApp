export interface PaginatedResult<T> {
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

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
}

export interface FighterBasicDTO {
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

export interface FighterFightHistoryDTO {
  fightId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  opponent: FighterBasicDTO;
  isWinner: boolean | null;
  method: string | null;
  methodDetail: string | null;
  round: number | null;
  time: string | null;
  weightClass: string;
}

export interface FighterDetailDTO extends FighterBasicDTO {
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
  instagramUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  upcomingFights: FighterFightHistoryDTO[];
  recentFights: FighterFightHistoryDTO[];
}

export interface OrganizationDTO {
  id: string;
  name: string;
  shortName: string | null;
  country: string;
  city: string | null;
  websiteUrl: string | null;
  level: 'MAJOR' | 'REGIONAL' | 'AMATEUR';
  logoUrl: string | null;
}

export interface EventBasicDTO {
  id: string;
  name: string;
  slug: string;
  dateTimeUtc: string;
  city: string | null;
  country: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  isAmateurEvent: boolean;
  organization: {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
    level: 'MAJOR' | 'REGIONAL' | 'AMATEUR';
  };
}

export interface FightDTO {
  id: string;
  eventId: string;
  fighterA: FighterBasicDTO;
  fighterB: FighterBasicDTO;
  winnerId: string | null;
  resultStatus: 'SCHEDULED' | 'COMPLETED' | 'DRAW' | 'NO_CONTEST' | 'CANCELLED';
  method: string | null;
  methodDetail: string | null;
  round: number | null;
  time: string | null;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
  isAmateurBout: boolean;
  cardType: 'MAIN' | 'PRELIM' | 'EARLY_PRELIM';
}

export interface EventDetailDTO extends EventBasicDTO {
  organizationId: string;
  description: string | null;
  venue: string | null;
  fights: FightDTO[];
}

export interface UserFavoritesDTO {
  fighters: FighterBasicDTO[];
  events: EventBasicDTO[];
  organizations: OrganizationDTO[];
}

