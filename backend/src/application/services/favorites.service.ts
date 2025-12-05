import {
  UserFavoritesDTO,
  FavoriteActionResultDTO,
  FighterBasicDTO,
  EventBasicDTO,
  OrganizationDTO,
  EventStatus,
  OrganizationLevel,
} from '@fightapp/shared';
import { Fighter, Event, Organization } from '@prisma/client';
import { FavoritesRepository } from '../../infrastructure/repositories/favorites.repository.js';
import { FighterRepository } from '../../infrastructure/repositories/fighter.repository.js';
import { EventRepository } from '../../infrastructure/repositories/event.repository.js';
import { OrganizationRepository } from '../../infrastructure/repositories/organization.repository.js';
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

export class FavoritesService {
  private favoritesRepository: FavoritesRepository;
  private fighterRepository: FighterRepository;
  private eventRepository: EventRepository;
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.favoritesRepository = new FavoritesRepository();
    this.fighterRepository = new FighterRepository();
    this.eventRepository = new EventRepository();
    this.organizationRepository = new OrganizationRepository();
  }

  async getAllFavorites(userId: string): Promise<UserFavoritesDTO> {
    const favorites = await this.favoritesRepository.getAllFavorites(userId);

    return {
      fighters: favorites.fighters.map((f) => this.toFighterBasicDTO(f)),
      events: favorites.events.map((e) => this.toEventBasicDTO(e as EventWithOrg)),
      organizations: favorites.organizations.map((o) => this.toOrganizationDTO(o)),
    };
  }

  // Fighter favorites
  async addFavoriteFighter(userId: string, fighterId: string): Promise<FavoriteActionResultDTO> {
    const fighter = await this.fighterRepository.findById(fighterId);
    if (!fighter) {
      throw new NotFoundError('Fighter', fighterId);
    }

    await this.favoritesRepository.addFavoriteFighter(userId, fighterId);
    return { success: true, action: 'added' };
  }

  async removeFavoriteFighter(userId: string, fighterId: string): Promise<FavoriteActionResultDTO> {
    await this.favoritesRepository.removeFavoriteFighter(userId, fighterId);
    return { success: true, action: 'removed' };
  }

  // Event favorites
  async addFavoriteEvent(userId: string, eventId: string): Promise<FavoriteActionResultDTO> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event', eventId);
    }

    await this.favoritesRepository.addFavoriteEvent(userId, eventId);
    return { success: true, action: 'added' };
  }

  async removeFavoriteEvent(userId: string, eventId: string): Promise<FavoriteActionResultDTO> {
    await this.favoritesRepository.removeFavoriteEvent(userId, eventId);
    return { success: true, action: 'removed' };
  }

  // Organization favorites
  async addFavoriteOrganization(
    userId: string,
    organizationId: string
  ): Promise<FavoriteActionResultDTO> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization', organizationId);
    }

    await this.favoritesRepository.addFavoriteOrganization(userId, organizationId);
    return { success: true, action: 'added' };
  }

  async removeFavoriteOrganization(
    userId: string,
    organizationId: string
  ): Promise<FavoriteActionResultDTO> {
    await this.favoritesRepository.removeFavoriteOrganization(userId, organizationId);
    return { success: true, action: 'removed' };
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
}

