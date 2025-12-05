import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  AuthResponseDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UserDTO,
  EventBasicDTO,
  EventDetailDTO,
  FighterBasicDTO,
  FighterDetailDTO,
  OrganizationDTO,
  OrganizationDetailDTO,
  UserFavoritesDTO,
  PaginatedResult,
} from '../types';

// Change this to your computer's IP address if testing on physical device
const API_URL = 'http://192.168.144.21:3000/api';
const TOKEN_KEY = 'fightapp_token';

interface OrganizationDetailDTO extends OrganizationDTO {
  upcomingEvents: {
    id: string;
    name: string;
    slug: string;
    dateTimeUtc: string;
    city: string | null;
    country: string;
    status: string;
  }[];
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.removeToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  // Auth endpoints
  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const response = await this.client.post<{ data: AuthResponseDTO }>('/auth/register', data);
    await this.setToken(response.data.data.token);
    return response.data.data;
  }

  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    const response = await this.client.post<{ data: AuthResponseDTO }>('/auth/login', data);
    await this.setToken(response.data.data.token);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async getCurrentUser(): Promise<UserDTO> {
    const response = await this.client.get<{ data: UserDTO }>('/auth/me');
    return response.data.data;
  }

  // Events endpoints
  async getUpcomingEvents(params?: {
    page?: number;
    pageSize?: number;
    organizationId?: string;
    country?: string;
    level?: string;
  }): Promise<PaginatedResult<EventBasicDTO>> {
    const response = await this.client.get<{ data: EventBasicDTO[]; meta: PaginatedResult<EventBasicDTO>['meta'] }>(
      '/events/upcoming',
      { params }
    );
    return { data: response.data.data, meta: response.data.meta };
  }

  async getEventById(id: string): Promise<EventDetailDTO> {
    const response = await this.client.get<{ data: EventDetailDTO }>(`/events/${id}`);
    return response.data.data;
  }

  // Fighters endpoints
  async searchFighters(params?: {
    q?: string;
    country?: string;
    weightClass?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<FighterBasicDTO>> {
    const response = await this.client.get<{ data: FighterBasicDTO[]; meta: PaginatedResult<FighterBasicDTO>['meta'] }>(
      '/fighters/search',
      { params }
    );
    return { data: response.data.data, meta: response.data.meta };
  }

  async getFighterById(id: string): Promise<FighterDetailDTO> {
    const response = await this.client.get<{ data: FighterDetailDTO }>(`/fighters/${id}`);
    return response.data.data;
  }

  // Organizations endpoints
  async getOrganizations(params?: {
    level?: string;
    country?: string;
  }): Promise<PaginatedResult<OrganizationDTO>> {
    const response = await this.client.get<{ data: OrganizationDTO[]; meta: PaginatedResult<OrganizationDTO>['meta'] }>(
      '/organizations',
      { params }
    );
    return { data: response.data.data, meta: response.data.meta };
  }

  async getOrganizationById(id: string): Promise<OrganizationDetailDTO> {
    const response = await this.client.get<{ data: OrganizationDetailDTO }>(`/organizations/${id}`);
    return response.data.data;
  }

  // Favorites endpoints
  async getFavorites(): Promise<UserFavoritesDTO> {
    const response = await this.client.get<{ data: UserFavoritesDTO }>('/me/favorites');
    return response.data.data;
  }

  async addFavoriteFighter(fighterId: string): Promise<void> {
    await this.client.post(`/me/favorites/fighters/${fighterId}`);
  }

  async removeFavoriteFighter(fighterId: string): Promise<void> {
    await this.client.delete(`/me/favorites/fighters/${fighterId}`);
  }

  async addFavoriteEvent(eventId: string): Promise<void> {
    await this.client.post(`/me/favorites/events/${eventId}`);
  }

  async removeFavoriteEvent(eventId: string): Promise<void> {
    await this.client.delete(`/me/favorites/events/${eventId}`);
  }

  async addFavoriteOrganization(organizationId: string): Promise<void> {
    await this.client.post(`/me/favorites/organizations/${organizationId}`);
  }

  async removeFavoriteOrganization(organizationId: string): Promise<void> {
    await this.client.delete(`/me/favorites/organizations/${organizationId}`);
  }
}

export const api = new ApiService();

