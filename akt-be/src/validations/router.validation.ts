import { z } from 'zod';

export const createRouterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama router minimal 2 karakter'),
    branchId: z.string().default('br-jkt'),
    host: z.string().min(1, 'Host/IP address wajib diisi'),
    apiPort: z.coerce.number().int().min(1).max(65535, 'Port API harus antara 1-65535').default(8728),
    username: z.string().min(1, 'Username router wajib diisi').default('admin'),
    password: z.string().min(1, 'Password router wajib diisi'),
    status: z.enum(['active', 'inactive', 'maintenance', 'retired']).default('active'),
  }),
});

export const updateRouterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID router wajib diisi'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    branchId: z.string().optional(),
    host: z.string().min(1).optional(),
    apiPort: z.coerce.number().int().min(1).max(65535).optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    status: z.enum(['active', 'inactive', 'maintenance', 'retired']).optional(),
  }),
});

export const routerIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID router wajib diisi'),
  }),
});

export const testConnectionSchema = z.object({
  body: z.object({
    host: z.string().min(1, 'Host/IP wajib diisi'),
    apiPort: z.coerce.number().int().min(1).max(65535).default(8728),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
});

export type CreateRouterInput = z.infer<typeof createRouterSchema>['body'];
export type UpdateRouterInput = z.infer<typeof updateRouterSchema>['body'];
export type TestConnectionInput = z.infer<typeof testConnectionSchema>['body'];
