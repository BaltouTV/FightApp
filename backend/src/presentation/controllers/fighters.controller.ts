import { FighterService } from '../../application/services/fighter.service.js';
import { FighterSearchParams, FighterBasicDTO, FighterDetailDTO, PaginatedResult } from '@fightapp/shared';

export class FightersController {
  private fighterService: FighterService;

  constructor() {
    this.fighterService = new FighterService();
  }

  async search(params: FighterSearchParams): Promise<PaginatedResult<FighterBasicDTO>> {
    // Ensure pageSize doesn't exceed maximum
    const safeParams = {
      ...params,
      pageSize: Math.min(params.pageSize || 20, 50),
    };

    return this.fighterService.search(safeParams);
  }

  async getById(id: string): Promise<FighterDetailDTO> {
    return this.fighterService.getById(id);
  }
}

