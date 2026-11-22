import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    username: z.string().min(2, 'Username must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'teknisi', 'cs']).default('teknisi'),
    branchId: z.string().default('br-jkt'),
    branchName: z.string().default('Jakarta Pusat'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['admin', 'teknisi', 'cs']).optional(),
    branchId: z.string().optional(),
    branchName: z.string().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6).optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user UUID'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
