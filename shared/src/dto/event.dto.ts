import { EventStatus, OrganizationLevel } from '../enums/index.js';
import { ExternalIds } from '../types/index.js';
import { FightDTO } from './fight.dto.js';
import { OrganizationDTO } from './organization.dto.js';

export interface EventDTO {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  venue: string | null;
  city: string | null;
  country: string;
  dateTimeUtc: string;
  status: EventStatus;
  isAmateurEvent: boolean;
  externalIds: ExternalIds;
  createdAt: string;
  updatedAt: string;
}

export interface EventBasicDTO {
  id: string;
  name: string;
  slug: string;
  dateTimeUtc: string;
  city: string | null;
  country: string;
  status: EventStatus;
  isAmateurEvent: boolean;
  organization: {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
    level: OrganizationLevel;
  };
}

export interface EventDetailDTO extends EventDTO {
  organization: OrganizationDTO;
  fights: FightDTO[];
}

export interface EventSearchParams {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  country?: string;
  level?: OrganizationLevel;
  fromDate?: string;
  toDate?: string;
  status?: EventStatus;
}

export interface CreateEventDTO {
  organizationId: string;
  name: string;
  description?: string;
  venue?: string;
  city?: string;
  country: string;
  dateTimeUtc: string;
  isAmateurEvent?: boolean;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventStatus;
}

