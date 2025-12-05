import { EventService } from '../../application/services/event.service.js';
import { EventSearchParams, EventBasicDTO, EventDetailDTO, PaginatedResult } from '@fightapp/shared';

export class EventsController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async getUpcoming(params: EventSearchParams): Promise<PaginatedResult<EventBasicDTO>> {
    // Ensure pageSize doesn't exceed maximum
    const safeParams = {
      ...params,
      pageSize: Math.min(params.pageSize || 20, 50),
    };

    return this.eventService.getUpcoming(safeParams);
  }

  async getById(id: string): Promise<EventDetailDTO> {
    return this.eventService.getById(id);
  }
}

