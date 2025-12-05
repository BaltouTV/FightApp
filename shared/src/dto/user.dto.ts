import { OrganizationAccountRole } from '../enums/index.js';

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDTO extends UserDTO {
  organizationAccounts: UserOrganizationAccountDTO[];
}

export interface UserOrganizationAccountDTO {
  id: string;
  organizationId: string;
  organizationName: string;
  role: OrganizationAccountRole;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  displayName: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  email?: string;
}

