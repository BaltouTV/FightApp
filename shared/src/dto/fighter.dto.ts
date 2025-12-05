import { Stance } from '../enums/index.js';
import { ExternalIds } from '../types/index.js';

export interface FighterDTO {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  fullName: string;
  birthDate: string | null;
  age: number | null;
  country: string;
  city: string | null;
  team: string | null;
  heightCm: number | null;
  reachCm: number | null;
  stance: Stance;
  weightClass: string;
  isPro: boolean;
  imageUrl: string | null;

  // Pro record
  proWins: number;
  proLosses: number;
  proDraws: number;
  proNoContests: number;
  proWinsByKO: number;
  proWinsBySubmission: number;
  proWinsByDecision: number;
  proLossesByKO: number;
  proLossesBySubmission: number;
  proLossesByDecision: number;

  // Amateur record
  amateurWins: number;
  amateurLosses: number;
  amateurDraws: number;
  amateurNoContests: number;

  // Socials
  instagramUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;

  externalIds: ExternalIds;
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

export interface FighterSearchParams {
  q?: string;
  country?: string;
  organizationId?: string;
  weightClass?: string;
  page?: number;
  pageSize?: number;
}

export interface FighterDetailDTO extends FighterDTO {
  upcomingFights: FighterFightHistoryDTO[];
  recentFights: FighterFightHistoryDTO[];
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

export interface CreateFighterDTO {
  firstName: string;
  lastName: string;
  nickname?: string;
  birthDate?: string;
  country: string;
  city?: string;
  team?: string;
  heightCm?: number;
  reachCm?: number;
  stance?: Stance;
  weightClass: string;
  isPro?: boolean;
}

export interface UpdateFighterDTO extends Partial<CreateFighterDTO> {
  proWins?: number;
  proLosses?: number;
  proDraws?: number;
  proNoContests?: number;
  proWinsByKO?: number;
  proWinsBySubmission?: number;
  proWinsByDecision?: number;
  proLossesByKO?: number;
  proLossesBySubmission?: number;
  proLossesByDecision?: number;
  amateurWins?: number;
  amateurLosses?: number;
  amateurDraws?: number;
  amateurNoContests?: number;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

