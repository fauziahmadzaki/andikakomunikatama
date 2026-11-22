import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    code: z.string().min(2, 'Kode cabang minimal 2 karakter'),
    name: z.string().min(2, 'Nama cabang minimal 2 karakter'),
    phone: z.string().default(''),
    address: z.string().default(''),
    isHeadOffice: z.boolean().default(false),
    isActive: z.boolean().default(true),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID cabang wajib diisi'),
  }),
  body: z.object({
    code: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    isHeadOffice: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const branchIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID cabang wajib diisi'),
  }),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>['body'];
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>['body'];
