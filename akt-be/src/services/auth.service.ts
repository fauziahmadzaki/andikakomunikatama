import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { env } from '../core/config.js';
import { UnauthorizedError, NotFoundError } from '../core/errors.js';
import { LoginInput } from '../validations/auth.validation.js';
import { User } from '../models/user.model.js';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;
    return rest;
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByIdentifier(input.identifier);

    if (!user) {
      throw new UnauthorizedError('Email/ID atau kata sandi salah.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Akun tidak aktif. Hubungi administrator.');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Email/ID atau kata sandi salah.');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
