import { FightResultStatus } from '../enums/index.js';
import { ExternalIds } from '../types/index.js';
import { FighterBasicDTO } from './fighter.dto.js';

export interface FightDTO {
  id: string;
  eventId: string;
  fighterA: FighterBasicDTO;
  fighterB: FighterBasicDTO;
  winnerId: string | null;
  resultStatus: FightResultStatus;
  method: string | null;
  methodDetail: string | null;
  round: number | null;
  time: string | null;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
  isAmateurBout: boolean;
  externalIds: ExternalIds;

  // Optional stats
  fighterATotalStrikes: number | null;
  fighterBTotalStrikes: number | null;
  fighterASignificantStrikes: number | null;
  fighterBSignificantStrikes: number | null;
  fighterATakedowns: number | null;
  fighterBTakedowns: number | null;
  fighterAControlTimeSeconds: number | null;
  fighterBControlTimeSeconds: number | null;
}

export interface FightBasicDTO {
  id: string;
  fighterA: FighterBasicDTO;
  fighterB: FighterBasicDTO;
  winnerId: string | null;
  resultStatus: FightResultStatus;
  method: string | null;
  round: number | null;
  time: string | null;
  weightClass: string;
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMainEvent: boolean;
}

export interface CreateFightDTO {
  eventId: string;
  fighterAId: string;
  fighterBId: string;
  weightClass: string;
  isTitleFight?: boolean;
  isMainEvent?: boolean;
  isCoMainEvent?: boolean;
  isAmateurBout?: boolean;
}

export interface UpdateFightDTO {
  winnerId?: string | null;
  resultStatus?: FightResultStatus;
  method?: string;
  methodDetail?: string;
  round?: number;
  time?: string;
  fighterATotalStrikes?: number;
  fighterBTotalStrikes?: number;
  fighterASignificantStrikes?: number;
  fighterBSignificantStrikes?: number;
  fighterATakedowns?: number;
  fighterBTakedowns?: number;
  fighterAControlTimeSeconds?: number;
  fighterBControlTimeSeconds?: number;
}

