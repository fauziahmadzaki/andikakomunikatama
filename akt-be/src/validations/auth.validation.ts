import { z } from 'zod';

export const loginValidationSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type LoginInput = z.infer<typeof loginValidationSchema>['body'];
