import { OrganizationService } from '../../application/services/organization.service.js';
import {
  OrganizationSearchParams,
  OrganizationDTO,
  OrganizationDetailDTO,
  PaginatedResult,
} from '@fightapp/shared';

export class OrganizationsController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  async getAll(params: OrganizationSearchParams): Promise<PaginatedResult<OrganizationDTO>> {
    return this.organizationService.getAll(params);
  }

  async getById(id: string): Promise<OrganizationDetailDTO> {
    return this.organizationService.getById(id);
  }
}

