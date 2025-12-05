import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO, UserDTO } from '@fightapp/shared';
import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
import { AppError, ConflictError, UnauthorizedError } from '../../domain/errors/app-error.js';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    });

    const token = this.generateToken(user.id, user.email);
    const userDto = this.toUserDTO(user);

    return { user: userDto, token };
  }

  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);
    const userDto = this.toUserDTO(user);

    return { user: userDto, token };
  }

  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.toUserDTO(user);
  }

  private generateToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('INTERNAL_ERROR', 'JWT secret not configured', 500);
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId, email }, secret, { expiresIn });
  }

  private toUserDTO(user: {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserDTO {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

