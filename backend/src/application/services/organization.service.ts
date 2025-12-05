import {
  OrganizationDTO,
  OrganizationDetailDTO,
  OrganizationEventDTO,
  OrganizationSearchParams,
  PaginatedResult,
  OrganizationLevel,
  EventStatus,
} from '@fightapp/shared';
import { Organization, Event } from '@prisma/client';
import { OrganizationRepository } from '../../infrastructure/repositories/organization.repository.js';
import { NotFoundError } from '../../domain/errors/app-error.js';

type OrganizationWithEvents = Organization & {
  events: Event[];
};

export class OrganizationService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }

  async getAll(params: OrganizationSearchParams): Promise<PaginatedResult<OrganizationDTO>> {
    const result = await this.organizationRepository.findAll(params);

    return {
      data: result.data.map((o) => this.toOrganizationDTO(o)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<OrganizationDetailDTO> {
    const organization = await this.organizationRepository.findByIdWithEvents(id);
    if (!organization) {
      throw new NotFoundError('Organization', id);
    }

    return this.toOrganizationDetailDTO(organization as OrganizationWithEvents);
  }

  private toOrganizationDTO(org: Organization): OrganizationDTO {
    return {
      id: org.id,
      name: org.name,
      shortName: org.shortName,
      country: org.country,
      city: org.city,
      websiteUrl: org.websiteUrl,
      level: org.level as OrganizationLevel,
      logoUrl: org.logoUrl,
    };
  }

  private toOrganizationDetailDTO(org: OrganizationWithEvents): OrganizationDetailDTO {
    return {
      ...this.toOrganizationDTO(org),
      upcomingEvents: org.events.map((e) => this.toOrganizationEventDTO(e)),
    };
  }

  private toOrganizationEventDTO(event: Event): OrganizationEventDTO {
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      dateTimeUtc: event.dateTimeUtc.toISOString(),
      city: event.city,
      country: event.country,
      status: event.status as EventStatus,
    };
  }
}

