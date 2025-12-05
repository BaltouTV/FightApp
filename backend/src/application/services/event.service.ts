import {
  EventDTO,
  EventBasicDTO,
  EventDetailDTO,
  EventSearchParams,
  FightDTO,
  FighterBasicDTO,
  PaginatedResult,
  EventStatus,
  FightResultStatus,
  OrganizationLevel,
} from '@fightapp/shared';
import { Event, Organization, Fight, Fighter } from '@prisma/client';
import { EventRepository } from '../../infrastructure/repositories/event.repository.js';
import { NotFoundError } from '../../domain/errors/app-error.js';

type EventWithOrg = Event & {
  organization: {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
    level: string;
  };
};

type EventWithDetails = Event & {
  organization: Organization;
  fights: (Fight & {
    fighterA: Fighter;
    fighterB: Fighter;
    winner: Fighter | null;
  })[];
};

export class EventService {
  private eventRepository: EventRepository;

  constructor() {
    this.eventRepository = new EventRepository();
  }

  async getUpcoming(params: EventSearchParams): Promise<PaginatedResult<EventBasicDTO>> {
    const result = await this.eventRepository.getUpcoming(params);

    return {
      data: result.data.map((e) => this.toEventBasicDTO(e as EventWithOrg)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<EventDetailDTO> {
    const event = await this.eventRepository.findByIdWithDetails(id);
    if (!event) {
      throw new NotFoundError('Event', id);
    }

    return this.toEventDetailDTO(event as EventWithDetails);
  }

  async getBySlug(slug: string): Promise<EventDetailDTO> {
    const event = await this.eventRepository.findBySlug(slug);
    if (!event) {
      throw new NotFoundError('Event');
    }

    return this.toEventDetailDTO(event as EventWithDetails);
  }

  private toEventDTO(event: Event): EventDTO {
    return {
      id: event.id,
      organizationId: event.organizationId,
      name: event.name,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      city: event.city,
      country: event.country,
      dateTimeUtc: event.dateTimeUtc.toISOString(),
      status: event.status as EventStatus,
      isAmateurEvent: event.isAmateurEvent,
      externalIds: event.externalIds as Record<string, string>,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  private toEventBasicDTO(event: EventWithOrg): EventBasicDTO {
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      dateTimeUtc: event.dateTimeUtc.toISOString(),
      city: event.city,
      country: event.country,
      status: event.status as EventStatus,
      isAmateurEvent: event.isAmateurEvent,
      organization: {
        id: event.organization.id,
        name: event.organization.name,
        shortName: event.organization.shortName,
        logoUrl: event.organization.logoUrl,
        level: event.organization.level as OrganizationLevel,
      },
    };
  }

  private toEventDetailDTO(event: EventWithDetails): EventDetailDTO {
    return {
      ...this.toEventDTO(event),
      organization: {
        id: event.organization.id,
        name: event.organization.name,
        shortName: event.organization.shortName,
        country: event.organization.country,
        city: event.organization.city,
        websiteUrl: event.organization.websiteUrl,
        level: event.organization.level as OrganizationLevel,
        logoUrl: event.organization.logoUrl,
      },
      fights: event.fights.map((f) => this.toFightDTO(f)),
    };
  }

  private toFightDTO(
    fight: Fight & {
      fighterA: Fighter;
      fighterB: Fighter;
      winner: Fighter | null;
    }
  ): FightDTO {
    return {
      id: fight.id,
      eventId: fight.eventId,
      fighterA: this.toFighterBasicDTO(fight.fighterA),
      fighterB: this.toFighterBasicDTO(fight.fighterB),
      winnerId: fight.winnerId,
      resultStatus: fight.resultStatus as FightResultStatus,
      method: fight.method,
      methodDetail: fight.methodDetail,
      round: fight.round,
      time: fight.time,
      weightClass: fight.weightClass,
      isTitleFight: fight.isTitleFight,
      isMainEvent: fight.isMainEvent,
      isCoMainEvent: fight.isCoMainEvent,
      isAmateurBout: fight.isAmateurBout,
      externalIds: fight.externalIds as Record<string, string>,
      fighterATotalStrikes: fight.fighterATotalStrikes,
      fighterBTotalStrikes: fight.fighterBTotalStrikes,
      fighterASignificantStrikes: fight.fighterASignificantStrikes,
      fighterBSignificantStrikes: fight.fighterBSignificantStrikes,
      fighterATakedowns: fight.fighterATakedowns,
      fighterBTakedowns: fight.fighterBTakedowns,
      fighterAControlTimeSeconds: fight.fighterAControlTimeSeconds,
      fighterBControlTimeSeconds: fight.fighterBControlTimeSeconds,
    };
  }

  private toFighterBasicDTO(fighter: Fighter): FighterBasicDTO {
    return {
      id: fighter.id,
      firstName: fighter.firstName,
      lastName: fighter.lastName,
      nickname: fighter.nickname,
      fullName: fighter.nickname
        ? `${fighter.firstName} "${fighter.nickname}" ${fighter.lastName}`
        : `${fighter.firstName} ${fighter.lastName}`,
      country: fighter.country,
      weightClass: fighter.weightClass,
      isPro: fighter.isPro,
      imageUrl: fighter.imageUrl,
      proWins: fighter.proWins,
      proLosses: fighter.proLosses,
      proDraws: fighter.proDraws,
    };
  }
}

