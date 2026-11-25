import { z } from 'zod';

export const newIpPoolSchema = z.object({
  routerId: z.string().min(1, 'Router IP pool wajib diisi'),
  name: z.string().min(1, 'Nama IP pool wajib diisi'),
  rangeStart: z.string().min(1, 'IP awal pool wajib diisi'),
  rangeEnd: z.string().min(1, 'IP akhir pool wajib diisi'),
});

const planProfileBodySchema = z.object({
  name: z.string().min(1, 'Nama paket wajib diisi'),
  description: z.string().default(''),
  price: z.coerce.number().int().min(0, 'Harga tidak boleh negatif'),
  type: z.enum(['pppoe', 'hotspot', 'other']),
  billingType: z.enum(['monthly', 'non_monthly']),
  isActive: z.boolean().default(true),
  routerId: z.string().min(1, 'Router wajib dipilih'),
  ipPoolId: z.string().optional().default(''),
  parentQueueId: z.string().optional().default(''),
  parentQueueName: z.string().optional().default(''),
  localAddress: z.string().optional().default(''),
  downloadMbps: z.coerce.number().min(0),
  uploadMbps: z.coerce.number().min(0),
  oversubscription: z.boolean().default(true),
  oversubRatio: z.coerce.number().min(1).default(1),
  newPool: newIpPoolSchema.optional(),
});

export const createPlanProfileSchema = z.object({
  body: planProfileBodySchema,
});

export const updatePlanProfileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID paket wajib diisi'),
  }),
  body: planProfileBodySchema,
});

export const planProfileIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID paket wajib diisi'),
  }),
});

export const ipPoolIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID IP pool wajib diisi'),
  }),
});

export type CreatePlanProfileInput = z.infer<typeof planProfileBodySchema>;
export type NewIpPoolInput = z.infer<typeof newIpPoolSchema>;
