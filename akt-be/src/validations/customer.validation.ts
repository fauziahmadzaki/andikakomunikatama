import { z } from 'zod';

const customerTypeSchema = z.enum(['residential', 'business']);
const registrationTypeSchema = z.enum(['new', 'existing', 'survey']);
const customerStatusSchema = z.enum(['active', 'suspended', 'inactive', 'draft']);
const addressTypeSchema = z.enum(['home', 'office', 'installation']);
const contactTypeSchema = z.enum(['phone', 'whatsapp', 'email']);
const identityTypeSchema = z.enum(['ktp', 'sim', 'ktm', 'npwp', 'passport']);
const connectionTypeSchema = z.enum(['static', 'dhcp', 'pppoe', 'hotspot']);
const provisionMethodSchema = z.enum(['new', 'sync']);
const incentiveMethodSchema = z.enum(['none', 'fixed', 'percentage']);

export const addressInputSchema = z.object({
  addressType: addressTypeSchema.default('home'),
  addressLine: z.string().min(1, 'Alamat lengkap wajib diisi'),
  village: z.string().default(''),
  villageId: z.string().optional(),
  district: z.string().default(''),
  districtId: z.string().optional(),
  city: z.string().min(1, 'Kota/kabupaten wajib diisi'),
  regencyId: z.string().optional(),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  provinceId: z.string().optional(),
  postalCode: z.string().default(''),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isPrimary: z.boolean().default(true),
});

export const contactInputSchema = z.object({
  contactType: contactTypeSchema.default('phone'),
  value: z.string().min(1, 'Kontak wajib diisi'),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

export const identityInputSchema = z.object({
  identityType: identityTypeSchema.default('ktp'),
  identityNumber: z.string().min(1, 'Nomor identitas wajib diisi'),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
});

export const accountInputSchema = z.object({
  email: z.string().default(''),
  phone: z.string().default(''),
  isActive: z.boolean().default(true),
});

export const installationSchema = z
  .object({
    snOnu: z.string().optional(),
    onuSerial: z.string().optional(),
    onuBrand: z.string().optional(),
    odc: z.string().optional(),
    odp: z.string().optional(),
    odpPort: z.string().optional(),
    cableLengthM: z.coerce.number().optional(),
    connectorCount: z.coerce.number().optional(),
    materialNotes: z.string().optional(),
  })
  .optional();

export const registerCustomerSchema = z.object({
  body: z.object({
    customer: z.object({
      customerNumber: z
        .string()
        .regex(/^\d{12}$/, 'ID pelanggan harus 12 digit')
        .optional(),
      branchId: z.string().min(1, 'Cabang wajib dipilih'),
      salesEmployeeId: z.string().optional(),
      fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
      customerType: customerTypeSchema.default('residential'),
      registrationType: registrationTypeSchema.default('new'),
      status: customerStatusSchema.default('active'),
      registeredAt: z.string().optional(),
      notes: z.string().default(''),
    }),
    address: addressInputSchema,
    contacts: z.array(contactInputSchema).min(1, 'Minimal satu kontak wajib diisi'),
    identity: identityInputSchema,
    account: accountInputSchema,
    subscription: z.object({
      planId: z.string().min(1, 'Paket wajib dipilih'),
      dueDay: z.coerce.number().int().min(1).max(31),
      startDate: z.string().optional(),
      discountId: z.string().optional(),
      prorateEnabled: z.boolean().default(false),
      taxEnabled: z.boolean().default(true),
      incentiveMethod: incentiveMethodSchema.default('none'),
      incentiveValue: z.coerce.number().min(0).default(0),
    }),
    service: z.object({
      connectionType: connectionTypeSchema,
      provisionMethod: provisionMethodSchema.default('new'),
      routerId: z.string().min(1, 'Router wajib dipilih'),
      targetIp: z.string().optional().default(''),
      syncSourceId: z.string().optional().default(''),
      username: z.string().optional().default(''),
      installation: installationSchema,
    }),
    overrideDuplicate: z.boolean().default(false),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    fullName: z.string().min(1).optional(),
    customerType: customerTypeSchema.optional(),
    registrationType: registrationTypeSchema.optional(),
    branchId: z.string().optional(),
    salesEmployeeId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateCustomerStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: customerStatusSchema,
    reason: z.string().default(''),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const customerAddressParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    addressId: z.string().min(1),
  }),
});

export const customerChildParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    childId: z.string().min(1),
  }),
});

export const createAddressSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: addressInputSchema,
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    addressId: z.string().min(1),
  }),
  body: addressInputSchema.partial(),
});

export const createContactSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: contactInputSchema,
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    childId: z.string().min(1),
  }),
  body: contactInputSchema.partial(),
});

export const createIdentitySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: identityInputSchema,
});

export const updateIdentitySchema = z.object({
  params: z.object({
    id: z.string().min(1),
    childId: z.string().min(1),
  }),
  body: identityInputSchema.partial(),
});

export const upsertAccountSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: accountInputSchema,
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
export type AddressInput = z.infer<typeof addressInputSchema>;
export type ContactInput = z.infer<typeof contactInputSchema>;
export type IdentityInput = z.infer<typeof identityInputSchema>;
export type AccountInput = z.infer<typeof accountInputSchema>;
