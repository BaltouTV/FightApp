import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { FighterSearchParams } from '@fightapp/shared';

export class FighterRepository {
  async findById(id: string) {
    return prisma.fighter.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string) {
    return prisma.fighter.findUnique({
      where: { id },
      include: {
        fightsAsA: {
          include: {
            event: true,
            fighterB: true,
          },
          orderBy: { event: { dateTimeUtc: 'desc' } },
          take: 10,
        },
        fightsAsB: {
          include: {
            event: true,
            fighterA: true,
          },
          orderBy: { event: { dateTimeUtc: 'desc' } },
          take: 10,
        },
      },
    });
  }

  async search(params: FighterSearchParams) {
    const { q, country, organizationId, weightClass, page = 1, pageSize = 20 } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FighterWhereInput = {};

    if (q) {
      const searchTerms = q.toLowerCase().split(' ');
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { nickname: { contains: q, mode: 'insensitive' } },
        // Search for full name combinations
        ...searchTerms.map((term) => ({
          AND: [
            {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' as const } },
                { lastName: { contains: term, mode: 'insensitive' as const } },
              ],
            },
          ],
        })),
      ];
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (weightClass) {
      where.weightClass = { equals: weightClass, mode: 'insensitive' };
    }

    if (organizationId) {
      where.OR = [
        {
          fightsAsA: {
            some: {
              event: { organizationId },
            },
          },
        },
        {
          fightsAsB: {
            some: {
              event: { organizationId },
            },
          },
        },
      ];
    }

    const [fighters, totalCount] = await Promise.all([
      prisma.fighter.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.fighter.count({ where }),
    ]);

    return {
      data: fighters,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: skip + fighters.length < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUpcomingFights(fighterId: string) {
    const now = new Date();

    return prisma.fight.findMany({
      where: {
        OR: [{ fighterAId: fighterId }, { fighterBId: fighterId }],
        event: {
          dateTimeUtc: { gte: now },
          status: 'SCHEDULED',
        },
      },
      include: {
        event: true,
        fighterA: true,
        fighterB: true,
      },
      orderBy: { event: { dateTimeUtc: 'asc' } },
    });
  }

  async getRecentFights(fighterId: string, limit = 10) {
    return prisma.fight.findMany({
      where: {
        OR: [{ fighterAId: fighterId }, { fighterBId: fighterId }],
        resultStatus: { not: 'SCHEDULED' },
      },
      include: {
        event: true,
        fighterA: true,
        fighterB: true,
      },
      orderBy: { event: { dateTimeUtc: 'desc' } },
      take: limit,
    });
  }

  async create(data: Prisma.FighterCreateInput) {
    return prisma.fighter.create({ data });
  }

  async update(id: string, data: Prisma.FighterUpdateInput) {
    return prisma.fighter.update({
      where: { id },
      data,
    });
  }

  async upsertByExternalId(
    provider: string,
    externalId: string,
    data: Omit<Prisma.FighterCreateInput, 'externalIds'>
  ) {
    const existingFighter = await prisma.fighter.findFirst({
      where: {
        externalIds: {
          path: [provider],
          equals: externalId,
        },
      },
    });

    const externalIds = { [provider]: externalId };

    if (existingFighter) {
      return prisma.fighter.update({
        where: { id: existingFighter.id },
        data: {
          ...data,
          externalIds: {
            ...((existingFighter.externalIds as Record<string, string>) || {}),
            ...externalIds,
          },
        },
      });
    }

    return prisma.fighter.create({
      data: {
        ...data,
        externalIds,
      },
    });
  }
}

