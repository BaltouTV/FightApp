import { UserDTO } from './user.dto.js';

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

