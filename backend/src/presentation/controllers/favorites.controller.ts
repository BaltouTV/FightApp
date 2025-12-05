import { FavoritesService } from '../../application/services/favorites.service.js';
import { UserFavoritesDTO, FavoriteActionResultDTO } from '@fightapp/shared';

export class FavoritesController {
  private favoritesService: FavoritesService;

  constructor() {
    this.favoritesService = new FavoritesService();
  }

  async getAllFavorites(userId: string): Promise<UserFavoritesDTO> {
    return this.favoritesService.getAllFavorites(userId);
  }

  async addFavoriteFighter(userId: string, fighterId: string): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.addFavoriteFighter(userId, fighterId);
  }

  async removeFavoriteFighter(userId: string, fighterId: string): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.removeFavoriteFighter(userId, fighterId);
  }

  async addFavoriteEvent(userId: string, eventId: string): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.addFavoriteEvent(userId, eventId);
  }

  async removeFavoriteEvent(userId: string, eventId: string): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.removeFavoriteEvent(userId, eventId);
  }

  async addFavoriteOrganization(
    userId: string,
    organizationId: string
  ): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.addFavoriteOrganization(userId, organizationId);
  }

  async removeFavoriteOrganization(
    userId: string,
    organizationId: string
  ): Promise<FavoriteActionResultDTO> {
    return this.favoritesService.removeFavoriteOrganization(userId, organizationId);
  }
}

