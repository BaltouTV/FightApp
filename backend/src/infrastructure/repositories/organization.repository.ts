import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { OrganizationSearchParams } from '@fightapp/shared';

export class OrganizationRepository {
  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
    });
  }

  async findByIdWithEvents(id: string) {
    const now = new Date();

    return prisma.organization.findUnique({
      where: { id },
      include: {
        events: {
          where: {
            dateTimeUtc: { gte: now },
            status: { not: 'CANCELLED' },
          },
          orderBy: { dateTimeUtc: 'asc' },
          take: 10,
        },
      },
    });
  }

  async findAll(params: OrganizationSearchParams) {
    const { level, country, page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrganizationWhereInput = {};

    if (level) {
      where.level = level;
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    const [organizations, totalCount] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
      }),
      prisma.organization.count({ where }),
    ]);

    return {
      data: organizations,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: skip + organizations.length < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({ data });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async findByName(name: string) {
    return prisma.organization.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { shortName: { equals: name, mode: 'insensitive' } },
        ],
      },
    });
  }
}

