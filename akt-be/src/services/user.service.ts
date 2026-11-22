import bcrypt from 'bcrypt';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { ConflictError, NotFoundError } from '../core/errors.js';
import { CreateUserInput, UpdateUserInput } from '../validations/user.validation.js';
import { User } from '../models/user.model.js';

export class UserService {
  constructor(private userRepo: UserRepository = userRepository) {}

  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;
    return rest;
  }

  async getAllUsers() {
    const all = await this.userRepo.findAll();
    return all.map((u) => this.sanitizeUser(u));
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async createUser(input: CreateUserInput) {
    const existingEmail = await this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError(`User with email ${input.email} already exists`);
    }

    const existingUsername = await this.userRepo.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError(`User with username ${input.username} already exists`);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await this.userRepo.create({
      name: input.name,
      email: input.email,
      username: input.username,
      password: hashedPassword,
      role: input.role,
      branchId: input.branchId,
      branchName: input.branchName,
    });

    return this.sanitizeUser(newUser);
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (input.name) updateData.name = input.name;
    if (input.role) updateData.role = input.role;
    if (input.branchId) updateData.branchId = input.branchId;
    if (input.branchName) updateData.branchName = input.branchName;
    if (typeof input.isActive === 'boolean') updateData.isActive = input.isActive;
    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10);
    }

    const updated = await this.userRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return this.sanitizeUser(updated);
  }

  async deleteUser(id: string) {
    const deleted = await this.userRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return { deleted: true };
  }
}

export const userService = new UserService();
