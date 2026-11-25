import {
  customerRepository,
  CustomerRepository,
} from '../repositories/customer.repository.js';
import {
  branchRepository,
  BranchRepository,
} from '../repositories/branch.repository.js';
import {
  routerRepository,
  RouterRepository,
} from '../repositories/router.repository.js';
import {
  planProfileRepository,
  PlanProfileRepository,
} from '../repositories/plan-profile.repository.js';
import { BadRequestError, ConflictError, NotFoundError } from '../core/errors.js';
import { provisionCustomerService } from '../core/customer-provisioning.js';
import {
  RegisterCustomerInput,
  UpdateCustomerInput,
  AddressInput,
  ContactInput,
  IdentityInput,
  AccountInput,
} from '../validations/customer.validation.js';

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizePhone(value: string) {
  const valueDigits = digits(value);
  if (valueDigits.startsWith('62')) {
    return `0${valueDigits.slice(2)}`;
  }
  return valueDigits;
}

function randomPassword(length = 10) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function customerNumberFromDate(date = new Date()) {
  return [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join('');
}

function planTypeForConnection(connectionType: RegisterCustomerInput['service']['connectionType']) {
  if (connectionType === 'pppoe') return 'pppoe';
  if (connectionType === 'hotspot') return 'hotspot';
  return 'other';
}

function toDateOnly(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export class CustomerService {
  constructor(
    private customerRepo: CustomerRepository = customerRepository,
    private branchRepo: BranchRepository = branchRepository,
    private routerRepo: RouterRepository = routerRepository,
    private planRepo: PlanProfileRepository = planProfileRepository
  ) {}

  async getAll() {
    return this.customerRepo.findAllBundle();
  }

  async getById(id: string) {
    const bundle = await this.customerRepo.findBundleById(id);
    if (!bundle) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }
    return bundle;
  }

  async register(input: RegisterCustomerInput, actor = 'System') {
    const branch = await this.branchRepo.findById(input.customer.branchId);
    if (!branch || !branch.isActive) {
      throw new BadRequestError('Cabang tidak ditemukan atau tidak aktif');
    }

    const router = await this.routerRepo.findById(input.service.routerId);
    if (!router) {
      throw new NotFoundError('Router tidak ditemukan');
    }

    const plan = await this.planRepo.findProfileById(input.subscription.planId);
    if (!plan) {
      throw new NotFoundError('Paket tidak ditemukan');
    }
    if (!plan.isActive) {
      throw new BadRequestError('Paket tidak aktif');
    }
    if (plan.routerId !== router.id) {
      throw new BadRequestError('Paket tidak terdaftar pada router yang dipilih');
    }
    if (plan.type !== planTypeForConnection(input.service.connectionType)) {
      throw new BadRequestError('Tipe paket tidak cocok dengan jenis koneksi');
    }

    await this.ensureNotDuplicate(input);

    const customerNumber = await this.resolveCustomerNumber(
      input.customer.customerNumber
    );
    const fullName = input.customer.fullName.trim();
    const staticQueueName = `${customerNumber}-${fullName}`;
    const sourceUsername = input.service.username?.trim();
    const isSync =
      input.service.provisionMethod === 'sync' && Boolean(sourceUsername);

    const username = isSync
      ? String(sourceUsername)
      : input.service.connectionType === 'static'
        ? staticQueueName
        : customerNumber;
    const queueName = input.service.connectionType === 'static' ? username : '';
    const password = randomPassword();

    const subscriptionCount = await this.customerRepo.countSubscriptions();
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(
      subscriptionCount + 1
    ).padStart(6, '0')}`;

    const registration = await this.customerRepo.createRegistration({
      customer: {
        id: customerNumber,
        branchId: input.customer.branchId,
        salesEmployeeId: input.customer.salesEmployeeId || null,
        customerNumber,
        fullName,
        customerType: input.customer.customerType,
        registrationType: input.customer.registrationType,
        status: input.customer.status,
        registeredAt: toDateOnly(input.customer.registeredAt),
        notes: input.customer.notes ?? '',
      },
      address: {
        addressType: input.address.addressType,
        addressLine: input.address.addressLine,
        village: input.address.village ?? '',
        villageId: input.address.villageId,
        district: input.address.district ?? '',
        districtId: input.address.districtId,
        city: input.address.city,
        regencyId: input.address.regencyId,
        province: input.address.province,
        provinceId: input.address.provinceId,
        postalCode: input.address.postalCode ?? '',
        latitude: input.address.latitude,
        longitude: input.address.longitude,
        isPrimary: input.address.isPrimary,
      },
      contacts: input.contacts.map((contact) => ({
        contactType: contact.contactType,
        value: contact.value,
        isPrimary: contact.isPrimary,
        isVerified: contact.isVerified,
      })),
      identity: {
        identityType: input.identity.identityType,
        identityNumber: input.identity.identityNumber,
        fileId: input.identity.fileId,
        fileName: input.identity.fileName,
      },
      account: {
        email: input.account.email ?? '',
        phone: input.account.phone ?? '',
        isActive: input.account.isActive,
      },
      subscription: {
        number: subscriptionNumber,
        planId: plan.id,
        branchId: branch.id,
        discountId: input.subscription.discountId,
        salesEmployeeId: input.customer.salesEmployeeId || null,
        status: 'active',
        startDate: toDateOnly(input.subscription.startDate),
        dueDay: input.subscription.dueDay,
        prorateEnabled: input.subscription.prorateEnabled,
        taxEnabled: input.subscription.taxEnabled,
        priceSnapshot: plan.price,
        incentiveMethod: input.subscription.incentiveMethod,
        incentiveValue: input.subscription.incentiveValue,
      },
      service: {
        serviceType: input.service.connectionType,
        username,
        routerId: router.id,
        planProfileId: plan.id,
        connectionType: input.service.connectionType,
        provisionMethod: input.service.provisionMethod,
        parentQueueId: plan.parentQueueId || '',
        parentQueueName: plan.parentQueueName || '',
        queueName,
        targetIp: input.service.targetIp || '',
        syncSourceId: input.service.syncSourceId || '',
        installation: input.service.installation ?? null,
        status: 'pending',
        installedAt: toDateOnly(input.customer.registeredAt),
      },
      credential: {
        credentialType: input.service.connectionType,
        username,
        password,
        secretRef:
          input.service.connectionType === 'pppoe'
            ? `ppp/secret/${username}`
            : input.service.connectionType === 'hotspot'
              ? `hotspot/user/${username}`
              : `queue/simple/${queueName || username}`,
        isActive: true,
      },
    });

    const pool = plan.ipPoolId
      ? await this.planRepo.findPoolById(plan.ipPoolId)
      : undefined;

    const routerSync = await provisionCustomerService({
      router,
      plan,
      pool,
      connectionType: input.service.connectionType,
      provisionMethod: input.service.provisionMethod,
      username,
      password,
      customerNumber,
      customerName: fullName,
      queueName,
      targetIp: input.service.targetIp,
    });

    const service = routerSync.success
      ? await this.customerRepo.updateServiceStatus(registration.service.id, 'active')
      : registration.service;

    return {
      ...registration,
      service: service ?? registration.service,
      routerSync,
      provisioning: { username, password },
    };
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    const existing = await this.customerRepo.findCustomerById(id);
    if (!existing) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }

    if (input.branchId) {
      const branch = await this.branchRepo.findById(input.branchId);
      if (!branch) {
        throw new BadRequestError('Cabang tidak ditemukan');
      }
    }

    const updated = await this.customerRepo.updateCustomer(id, {
      ...(input.fullName !== undefined && { fullName: input.fullName.trim() }),
      ...(input.customerType !== undefined && { customerType: input.customerType }),
      ...(input.registrationType !== undefined && {
        registrationType: input.registrationType,
      }),
      ...(input.branchId !== undefined && { branchId: input.branchId }),
      ...(input.salesEmployeeId !== undefined && {
        salesEmployeeId: input.salesEmployeeId,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
    });

    if (!updated) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }
    return updated;
  }

  async updateStatus(id: string, status: string, reason: string, actor: string) {
    const updated = await this.customerRepo.updateStatus(id, status, reason, actor);
    if (!updated) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }
    return updated;
  }

  async deleteCustomer(id: string) {
    const deleted = await this.customerRepo.deleteCustomer(id);
    if (!deleted) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }
    return { deleted: true };
  }

  async addAddress(id: string, input: AddressInput) {
    await this.ensureCustomer(id);
    return this.customerRepo.addAddress(id, input);
  }

  async updateAddress(id: string, addressId: string, input: Partial<AddressInput>) {
    await this.ensureCustomer(id);
    const updated = await this.customerRepo.updateAddress(id, addressId, input);
    if (!updated) {
      throw new NotFoundError('Alamat tidak ditemukan');
    }
    return updated;
  }

  async deleteAddress(id: string, addressId: string) {
    await this.ensureCustomer(id);
    const deleted = await this.customerRepo.deleteAddress(id, addressId);
    if (!deleted) {
      throw new NotFoundError('Alamat tidak ditemukan');
    }
    return { deleted: true };
  }

  async addContact(id: string, input: ContactInput) {
    await this.ensureCustomer(id);
    return this.customerRepo.addContact(id, input);
  }

  async updateContact(id: string, contactId: string, input: Partial<ContactInput>) {
    await this.ensureCustomer(id);
    const updated = await this.customerRepo.updateContact(id, contactId, input);
    if (!updated) {
      throw new NotFoundError('Kontak tidak ditemukan');
    }
    return updated;
  }

  async deleteContact(id: string, contactId: string) {
    await this.ensureCustomer(id);
    const deleted = await this.customerRepo.deleteContact(id, contactId);
    if (!deleted) {
      throw new NotFoundError('Kontak tidak ditemukan');
    }
    return { deleted: true };
  }

  async addIdentity(id: string, input: IdentityInput) {
    await this.ensureCustomer(id);
    return this.customerRepo.addIdentity(id, input);
  }

  async updateIdentity(
    id: string,
    identityId: string,
    input: Partial<IdentityInput>
  ) {
    await this.ensureCustomer(id);
    const updated = await this.customerRepo.updateIdentity(id, identityId, input);
    if (!updated) {
      throw new NotFoundError('Identitas tidak ditemukan');
    }
    return updated;
  }

  async deleteIdentity(id: string, identityId: string) {
    await this.ensureCustomer(id);
    const deleted = await this.customerRepo.deleteIdentity(id, identityId);
    if (!deleted) {
      throw new NotFoundError('Identitas tidak ditemukan');
    }
    return { deleted: true };
  }

  async upsertAccount(id: string, input: AccountInput) {
    await this.ensureCustomer(id);
    return this.customerRepo.upsertAccount(id, input);
  }

  private async ensureCustomer(id: string) {
    const customer = await this.customerRepo.findCustomerById(id);
    if (!customer) {
      throw new NotFoundError(`Pelanggan dengan id ${id} tidak ditemukan`);
    }
    return customer;
  }

  private async ensureNotDuplicate(input: RegisterCustomerInput) {
    if (input.overrideDuplicate) return;

    const phoneTargets = input.contacts
      .filter(
        (contact) =>
          contact.contactType === 'phone' || contact.contactType === 'whatsapp'
      )
      .map((contact) => normalizePhone(contact.value))
      .filter((value) => value.length >= 8);

    const identityTarget = digits(input.identity.identityNumber);
    if (phoneTargets.length === 0 && identityTarget.length < 8) {
      return;
    }

    const { contacts, identities } =
      await this.customerRepo.findContactsAndIdentities();

    const conflicts = new Set<string>();

    for (const contact of contacts) {
      if (
        (contact.contactType === 'phone' || contact.contactType === 'whatsapp') &&
        phoneTargets.includes(normalizePhone(contact.value))
      ) {
        conflicts.add(contact.customerId);
      }
    }

    if (identityTarget.length >= 8) {
      for (const identity of identities) {
        if (digits(identity.identityNumber) === identityTarget) {
          conflicts.add(identity.customerId);
        }
      }
    }

    if (conflicts.size > 0) {
      throw new ConflictError(
        'Pelanggan dengan nomor HP atau identitas yang sama sudah ada'
      );
    }
  }

  private async resolveCustomerNumber(inputNumber?: string) {
    if (inputNumber?.trim()) {
      const existing = await this.customerRepo.findByCustomerNumber(
        inputNumber.trim()
      );
      if (existing) {
        throw new ConflictError('ID pelanggan sudah dipakai');
      }
      return inputNumber.trim();
    }

    let candidate = customerNumberFromDate();
    let existing = await this.customerRepo.findByCustomerNumber(candidate);
    let offset = 1;

    while (existing) {
      const next = new Date(Date.now() + offset * 1000);
      candidate = customerNumberFromDate(next);
      existing = await this.customerRepo.findByCustomerNumber(candidate);
      offset += 1;
    }

    return candidate;
  }
}

export const customerService = new CustomerService();
