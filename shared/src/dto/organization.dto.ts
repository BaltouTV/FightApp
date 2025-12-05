import { OrganizationLevel } from '../enums/index.js';

export interface OrganizationDTO {
  id: string;
  name: string;
  shortName: string | null;
  country: string;
  city: string | null;
  websiteUrl: string | null;
  level: OrganizationLevel;
  logoUrl: string | null;
}

export interface OrganizationDetailDTO extends OrganizationDTO {
  upcomingEvents: OrganizationEventDTO[];
}

export interface OrganizationEventDTO {
  id: string;
  name: string;
  slug: string;
  dateTimeUtc: string;
  city: string | null;
  country: string;
  status: string;
}

export interface OrganizationSearchParams {
  level?: OrganizationLevel;
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateOrganizationDTO {
  name: string;
  shortName?: string;
  country: string;
  city?: string;
  websiteUrl?: string;
  level: OrganizationLevel;
  logoUrl?: string;
}

export interface UpdateOrganizationDTO extends Partial<CreateOrganizationDTO> {}

