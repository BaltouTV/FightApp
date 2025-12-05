import { PrismaClient, Stance, OrganizationLevel, EventStatus, FightResultStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting database seed...');

  // Create organizations
  const ufc = await prisma.organization.upsert({
    where: { id: 'org-ufc' },
    update: {},
    create: {
      id: 'org-ufc',
      name: 'Ultimate Fighting Championship',
      shortName: 'UFC',
      country: 'USA',
      city: 'Las Vegas',
      websiteUrl: 'https://www.ufc.com',
      level: OrganizationLevel.MAJOR,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/UFC_Logo.svg',
    },
  });

  const pfl = await prisma.organization.upsert({
    where: { id: 'org-pfl' },
    update: {},
    create: {
      id: 'org-pfl',
      name: 'Professional Fighters League',
      shortName: 'PFL',
      country: 'USA',
      city: 'New York',
      websiteUrl: 'https://www.pflmma.com',
      level: OrganizationLevel.MAJOR,
    },
  });

  const bellator = await prisma.organization.upsert({
    where: { id: 'org-bellator' },
    update: {},
    create: {
      id: 'org-bellator',
      name: 'Bellator MMA',
      shortName: 'Bellator',
      country: 'USA',
      city: 'Santa Monica',
      websiteUrl: 'https://www.bellator.com',
      level: OrganizationLevel.MAJOR,
    },
  });

  console.info('✅ Organizations created');

  // Create fighters
  const fighter1 = await prisma.fighter.upsert({
    where: { id: 'fighter-1' },
    update: {},
    create: {
      id: 'fighter-1',
      firstName: 'Islam',
      lastName: 'Makhachev',
      nickname: 'Islam',
      birthDate: new Date('1991-10-27'),
      country: 'Russia',
      city: 'Makhachkala',
      team: 'American Kickboxing Academy',
      heightCm: 178,
      reachCm: 178,
      stance: Stance.SOUTHPAW,
      weightClass: 'Lightweight',
      isPro: true,
      proWins: 25,
      proLosses: 1,
      proDraws: 0,
      proWinsByKO: 4,
      proWinsBySubmission: 11,
      proWinsByDecision: 10,
    },
  });

  const fighter2 = await prisma.fighter.upsert({
    where: { id: 'fighter-2' },
    update: {},
    create: {
      id: 'fighter-2',
      firstName: 'Charles',
      lastName: 'Oliveira',
      nickname: 'Do Bronx',
      birthDate: new Date('1989-10-17'),
      country: 'Brazil',
      city: 'Guaruja',
      team: 'Chute Boxe',
      heightCm: 178,
      reachCm: 188,
      stance: Stance.ORTHODOX,
      weightClass: 'Lightweight',
      isPro: true,
      proWins: 34,
      proLosses: 10,
      proDraws: 0,
      proWinsByKO: 10,
      proWinsBySubmission: 21,
      proWinsByDecision: 3,
    },
  });

  const fighter3 = await prisma.fighter.upsert({
    where: { id: 'fighter-3' },
    update: {},
    create: {
      id: 'fighter-3',
      firstName: 'Alex',
      lastName: 'Pereira',
      nickname: 'Poatan',
      birthDate: new Date('1987-07-07'),
      country: 'Brazil',
      city: 'Sao Paulo',
      team: 'Glover Teixeira MMA',
      heightCm: 193,
      reachCm: 203,
      stance: Stance.ORTHODOX,
      weightClass: 'Light Heavyweight',
      isPro: true,
      proWins: 11,
      proLosses: 2,
      proDraws: 0,
      proWinsByKO: 10,
      proWinsBySubmission: 0,
      proWinsByDecision: 1,
    },
  });

  const fighter4 = await prisma.fighter.upsert({
    where: { id: 'fighter-4' },
    update: {},
    create: {
      id: 'fighter-4',
      firstName: 'Jon',
      lastName: 'Jones',
      nickname: 'Bones',
      birthDate: new Date('1987-07-19'),
      country: 'USA',
      city: 'Albuquerque',
      team: 'Jackson Wink MMA Academy',
      heightCm: 193,
      reachCm: 215,
      stance: Stance.ORTHODOX,
      weightClass: 'Heavyweight',
      isPro: true,
      proWins: 27,
      proLosses: 1,
      proDraws: 0,
      proNoContests: 1,
      proWinsByKO: 10,
      proWinsBySubmission: 7,
      proWinsByDecision: 10,
    },
  });

  console.info('✅ Fighters created');

  // Create events
  const event1 = await prisma.event.upsert({
    where: { id: 'event-1' },
    update: {},
    create: {
      id: 'event-1',
      organizationId: ufc.id,
      name: 'UFC 310',
      slug: 'ufc-310',
      description: 'UFC 310 Fight Night',
      venue: 'T-Mobile Arena',
      city: 'Las Vegas',
      country: 'USA',
      dateTimeUtc: new Date('2025-01-18T22:00:00Z'),
      status: EventStatus.SCHEDULED,
      isAmateurEvent: false,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'event-2' },
    update: {},
    create: {
      id: 'event-2',
      organizationId: ufc.id,
      name: 'UFC Fight Night: Pereira vs Challenger',
      slug: 'ufc-fn-pereira-2025',
      description: 'Light Heavyweight title defense',
      venue: 'Apex',
      city: 'Las Vegas',
      country: 'USA',
      dateTimeUtc: new Date('2025-02-08T20:00:00Z'),
      status: EventStatus.SCHEDULED,
      isAmateurEvent: false,
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: 'event-3' },
    update: {},
    create: {
      id: 'event-3',
      organizationId: bellator.id,
      name: 'Bellator Champions Series',
      slug: 'bellator-champions-2025',
      description: 'Bellator Champions Series event',
      venue: 'Wembley Arena',
      city: 'London',
      country: 'UK',
      dateTimeUtc: new Date('2025-03-15T19:00:00Z'),
      status: EventStatus.SCHEDULED,
      isAmateurEvent: false,
    },
  });

  console.info('✅ Events created');

  // Create fights
  await prisma.fight.upsert({
    where: { id: 'fight-1' },
    update: {},
    create: {
      id: 'fight-1',
      eventId: event1.id,
      fighterAId: fighter1.id,
      fighterBId: fighter2.id,
      resultStatus: FightResultStatus.SCHEDULED,
      weightClass: 'Lightweight',
      isTitleFight: true,
      isMainEvent: true,
      isCoMainEvent: false,
      isAmateurBout: false,
      fightOrder: 10,
    },
  });

  await prisma.fight.upsert({
    where: { id: 'fight-2' },
    update: {},
    create: {
      id: 'fight-2',
      eventId: event2.id,
      fighterAId: fighter3.id,
      fighterBId: fighter4.id,
      resultStatus: FightResultStatus.SCHEDULED,
      weightClass: 'Light Heavyweight',
      isTitleFight: true,
      isMainEvent: true,
      isCoMainEvent: false,
      isAmateurBout: false,
      fightOrder: 10,
    },
  });

  console.info('✅ Fights created');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { id: 'user-demo' },
    update: {},
    create: {
      id: 'user-demo',
      email: 'demo@fightapp.com',
      passwordHash,
      displayName: 'Demo User',
    },
  });

  console.info('✅ Demo user created (email: demo@fightapp.com, password: password123)');

  // Add some favorites for demo user
  await prisma.favoriteFighter.upsert({
    where: { userId_fighterId: { userId: user.id, fighterId: fighter1.id } },
    update: {},
    create: { userId: user.id, fighterId: fighter1.id },
  });

  await prisma.favoriteEvent.upsert({
    where: { userId_eventId: { userId: user.id, eventId: event1.id } },
    update: {},
    create: { userId: user.id, eventId: event1.id },
  });

  await prisma.favoriteOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: ufc.id } },
    update: {},
    create: { userId: user.id, organizationId: ufc.id },
  });

  console.info('✅ Demo favorites created');
  console.info('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

