import { prisma } from '../database/prisma.js';

export class FavoritesRepository {
  // Fighter favorites
  async addFavoriteFighter(userId: string, fighterId: string) {
    return prisma.favoriteFighter.upsert({
      where: {
        userId_fighterId: { userId, fighterId },
      },
      create: { userId, fighterId },
      update: {},
    });
  }

  async removeFavoriteFighter(userId: string, fighterId: string) {
    return prisma.favoriteFighter.deleteMany({
      where: { userId, fighterId },
    });
  }

  async getFavoriteFighters(userId: string) {
    return prisma.favoriteFighter.findMany({
      where: { userId },
      include: {
        fighter: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFavoriteFighter(userId: string, fighterId: string) {
    const favorite = await prisma.favoriteFighter.findUnique({
      where: {
        userId_fighterId: { userId, fighterId },
      },
    });
    return !!favorite;
  }

  // Event favorites
  async addFavoriteEvent(userId: string, eventId: string) {
    return prisma.favoriteEvent.upsert({
      where: {
        userId_eventId: { userId, eventId },
      },
      create: { userId, eventId },
      update: {},
    });
  }

  async removeFavoriteEvent(userId: string, eventId: string) {
    return prisma.favoriteEvent.deleteMany({
      where: { userId, eventId },
    });
  }

  async getFavoriteEvents(userId: string) {
    return prisma.favoriteEvent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Organization favorites
  async addFavoriteOrganization(userId: string, organizationId: string) {
    return prisma.favoriteOrganization.upsert({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      create: { userId, organizationId },
      update: {},
    });
  }

  async removeFavoriteOrganization(userId: string, organizationId: string) {
    return prisma.favoriteOrganization.deleteMany({
      where: { userId, organizationId },
    });
  }

  async getFavoriteOrganizations(userId: string) {
    return prisma.favoriteOrganization.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all favorites
  async getAllFavorites(userId: string) {
    const [fighters, events, organizations] = await Promise.all([
      this.getFavoriteFighters(userId),
      this.getFavoriteEvents(userId),
      this.getFavoriteOrganizations(userId),
    ]);

    return {
      fighters: fighters.map((f) => f.fighter),
      events: events.map((e) => e.event),
      organizations: organizations.map((o) => o.organization),
    };
  }
}

