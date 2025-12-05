import { EventBasicDTO } from './event.dto.js';
import { FighterBasicDTO } from './fighter.dto.js';
import { OrganizationDTO } from './organization.dto.js';

export interface UserFavoritesDTO {
  fighters: FighterBasicDTO[];
  events: EventBasicDTO[];
  organizations: OrganizationDTO[];
}

export interface FavoriteActionResultDTO {
  success: boolean;
  action: 'added' | 'removed';
}

