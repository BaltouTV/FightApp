import {
  FighterDTO,
  FighterBasicDTO,
  FighterDetailDTO,
  FighterSearchParams,
  FighterFightHistoryDTO,
  PaginatedResult,
  Stance,
} from '@fightapp/shared';
import { Fighter, Fight, Event } from '@prisma/client';
import { FighterRepository } from '../../infrastructure/repositories/fighter.repository.js';
import { NotFoundError } from '../../domain/errors/app-error.js';

type FightWithRelations = Fight & {
  event: Event;
  fighterA: Fighter;
  fighterB: Fighter;
};

export class FighterService {
  private fighterRepository: FighterRepository;

  constructor() {
    this.fighterRepository = new FighterRepository();
  }

  async search(params: FighterSearchParams): Promise<PaginatedResult<FighterBasicDTO>> {
    const result = await this.fighterRepository.search(params);

    return {
      data: result.data.map((f) => this.toFighterBasicDTO(f)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<FighterDetailDTO> {
    const fighter = await this.fighterRepository.findByIdWithDetails(id);
    if (!fighter) {
      throw new NotFoundError('Fighter', id);
    }

    const [upcomingFights, recentFights] = await Promise.all([
      this.fighterRepository.getUpcomingFights(id),
      this.fighterRepository.getRecentFights(id),
    ]);

    return {
      ...this.toFighterDTO(fighter),
      upcomingFights: upcomingFights.map((f) => this.toFightHistoryDTO(f, id)),
      recentFights: recentFights.map((f) => this.toFightHistoryDTO(f, id)),
    };
  }

  private toFighterDTO(fighter: Fighter): FighterDTO {
    return {
      id: fighter.id,
      firstName: fighter.firstName,
      lastName: fighter.lastName,
      nickname: fighter.nickname,
      fullName: this.getFullName(fighter),
      birthDate: fighter.birthDate?.toISOString() || null,
      age: fighter.birthDate ? this.calculateAge(fighter.birthDate) : null,
      country: fighter.country,
      city: fighter.city,
      team: fighter.team,
      heightCm: fighter.heightCm,
      reachCm: fighter.reachCm,
      stance: fighter.stance as Stance,
      weightClass: fighter.weightClass,
      isPro: fighter.isPro,
      imageUrl: fighter.imageUrl,
      proWins: fighter.proWins,
      proLosses: fighter.proLosses,
      proDraws: fighter.proDraws,
      proNoContests: fighter.proNoContests,
      proWinsByKO: fighter.proWinsByKO,
      proWinsBySubmission: fighter.proWinsBySubmission,
      proWinsByDecision: fighter.proWinsByDecision,
      proLossesByKO: fighter.proLossesByKO,
      proLossesBySubmission: fighter.proLossesBySubmission,
      proLossesByDecision: fighter.proLossesByDecision,
      amateurWins: fighter.amateurWins,
      amateurLosses: fighter.amateurLosses,
      amateurDraws: fighter.amateurDraws,
      amateurNoContests: fighter.amateurNoContests,
      instagramUrl: fighter.instagramUrl,
      twitterUrl: fighter.twitterUrl,
      websiteUrl: fighter.websiteUrl,
      externalIds: fighter.externalIds as Record<string, string>,
    };
  }

  private toFighterBasicDTO(fighter: Fighter): FighterBasicDTO {
    return {
      id: fighter.id,
      firstName: fighter.firstName,
      lastName: fighter.lastName,
      nickname: fighter.nickname,
      fullName: this.getFullName(fighter),
      country: fighter.country,
      weightClass: fighter.weightClass,
      isPro: fighter.isPro,
      imageUrl: fighter.imageUrl,
      proWins: fighter.proWins,
      proLosses: fighter.proLosses,
      proDraws: fighter.proDraws,
    };
  }

  private toFightHistoryDTO(fight: FightWithRelations, fighterId: string): FighterFightHistoryDTO {
    const isFighterA = fight.fighterAId === fighterId;
    const opponent = isFighterA ? fight.fighterB : fight.fighterA;

    let isWinner: boolean | null = null;
    if (fight.winnerId) {
      isWinner = fight.winnerId === fighterId;
    } else if (fight.resultStatus === 'DRAW' || fight.resultStatus === 'NO_CONTEST') {
      isWinner = null;
    }

    return {
      fightId: fight.id,
      eventId: fight.eventId,
      eventName: fight.event.name,
      eventDate: fight.event.dateTimeUtc.toISOString(),
      opponent: this.toFighterBasicDTO(opponent),
      isWinner,
      method: fight.method,
      methodDetail: fight.methodDetail,
      round: fight.round,
      time: fight.time,
      weightClass: fight.weightClass,
    };
  }

  private getFullName(fighter: { firstName: string; lastName: string; nickname?: string | null }): string {
    if (fighter.nickname) {
      return `${fighter.firstName} "${fighter.nickname}" ${fighter.lastName}`;
    }
    return `${fighter.firstName} ${fighter.lastName}`;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

