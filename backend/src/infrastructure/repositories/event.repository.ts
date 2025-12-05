import { Prisma, EventStatus } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { EventSearchParams, OrganizationLevel } from '@fightapp/shared';

export class EventRepository {
  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organization: true,
        fights: {
          include: {
            fighterA: true,
            fighterB: true,
            winner: true,
          },
          orderBy: [
            { fightOrder: 'asc' }, // Sort by fightOrder: MAIN (100+), PRELIM (200+), EARLY_PRELIM (300+)
          ],
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        organization: true,
        fights: {
          include: {
            fighterA: true,
            fighterB: true,
            winner: true,
          },
          orderBy: [
            { fightOrder: 'asc' }, // Sort by fightOrder: MAIN (100+), PRELIM (200+), EARLY_PRELIM (300+)
          ],
        },
      },
    });
  }

  async getUpcoming(params: EventSearchParams) {
    const {
      page = 1,
      pageSize = 20,
      organizationId,
      country,
      level,
      fromDate,
      toDate,
    } = params;

    const skip = (page - 1) * pageSize;
    const now = new Date();

    const where: Prisma.EventWhereInput = {
      dateTimeUtc: { gte: fromDate ? new Date(fromDate) : now },
      status: { not: 'CANCELLED' },
    };

    if (toDate) {
      where.dateTimeUtc = {
        ...(where.dateTimeUtc as Prisma.DateTimeFilter),
        lte: new Date(toDate),
      };
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (level) {
      where.organization = {
        level: level as OrganizationLevel,
      };
    }

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Math.min(pageSize, 50),
        orderBy: { dateTimeUtc: 'asc' },
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
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: skip + events.length < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getByOrganization(organizationId: string, limit = 10) {
    const now = new Date();

    return prisma.event.findMany({
      where: {
        organizationId,
        dateTimeUtc: { gte: now },
        status: { not: 'CANCELLED' },
      },
      orderBy: { dateTimeUtc: 'asc' },
      take: limit,
    });
  }

  async create(data: Prisma.EventCreateInput) {
    return prisma.event.create({ data });
  }

  async update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
    });
  }

  async upsertByExternalId(
    provider: string,
    externalId: string,
    data: Omit<Prisma.EventCreateInput, 'externalIds'>
  ) {
    const existingEvent = await prisma.event.findFirst({
      where: {
        externalIds: {
          path: [provider],
          equals: externalId,
        },
      },
    });

    const externalIds = { [provider]: externalId };

    if (existingEvent) {
      return prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          ...data,
          externalIds: {
            ...((existingEvent.externalIds as Record<string, string>) || {}),
            ...externalIds,
          },
        },
      });
    }

    return prisma.event.create({
      data: {
        ...data,
        externalIds,
      },
    });
  }
}

