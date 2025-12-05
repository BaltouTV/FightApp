import { z } from 'zod';
import { AuthService } from '../../application/services/auth.service.js';
import { AuthResponseDTO, UserDTO, LoginRequestDTO, RegisterRequestDTO } from '@fightapp/shared';
import { ValidationError } from '../../domain/errors/app-error.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(body: unknown): Promise<AuthResponseDTO> {
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', {
        errors: result.error.flatten().fieldErrors,
      });
    }

    const data: RegisterRequestDTO = result.data;
    return this.authService.register(data);
  }

  async login(body: unknown): Promise<AuthResponseDTO> {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', {
        errors: result.error.flatten().fieldErrors,
      });
    }

    const data: LoginRequestDTO = result.data;
    return this.authService.login(data);
  }

  async me(userId: string): Promise<UserDTO> {
    return this.authService.getCurrentUser(userId);
  }
}

