import { branchRepository, BranchRepository } from '../repositories/branch.repository.js';
import { ConflictError, NotFoundError } from '../core/errors.js';
import { CreateBranchInput, UpdateBranchInput } from '../validations/branch.validation.js';

export class BranchService {
  constructor(private branchRepo: BranchRepository = branchRepository) {}

  async getAllBranches() {
    return this.branchRepo.findAll();
  }

  async getBranchById(id: string) {
    const branch = await this.branchRepo.findById(id);
    if (!branch) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }
    return branch;
  }

  async createBranch(input: CreateBranchInput) {
    const codeNormalized = input.code.trim().toUpperCase();
    const existing = await this.branchRepo.findByCode(codeNormalized);
    if (existing) {
      throw new ConflictError(`Cabang dengan kode ${codeNormalized} sudah terdaftar`);
    }

    return this.branchRepo.create({
      ...(input.id && { id: input.id }),
      code: codeNormalized,
      name: input.name.trim(),
      phone: input.phone || '',
      address: input.address || '',
      isHeadOffice: input.isHeadOffice ?? false,
      isActive: input.isActive ?? true,
      customerCount: 0,
    });
  }

  async updateBranch(id: string, input: UpdateBranchInput) {
    const existing = await this.branchRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }

    const updatePayload: Record<string, unknown> = {};

    if (input.code !== undefined) {
      const codeNormalized = input.code.trim().toUpperCase();
      if (codeNormalized !== existing.code) {
        const duplicate = await this.branchRepo.findByCode(codeNormalized);
        if (duplicate) {
          throw new ConflictError(`Cabang dengan kode ${codeNormalized} sudah terdaftar`);
        }
      }
      updatePayload.code = codeNormalized;
    }

    if (input.name !== undefined) updatePayload.name = input.name.trim();
    if (input.phone !== undefined) updatePayload.phone = input.phone;
    if (input.address !== undefined) updatePayload.address = input.address;
    if (input.isHeadOffice !== undefined) updatePayload.isHeadOffice = input.isHeadOffice;
    if (input.isActive !== undefined) updatePayload.isActive = input.isActive;

    const updated = await this.branchRepo.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }
    return updated;
  }

  async toggleBranchStatus(id: string) {
    const existing = await this.branchRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }

    const updated = await this.branchRepo.update(id, {
      isActive: !existing.isActive,
    });
    return updated;
  }

  async deleteBranch(id: string) {
    const existing = await this.branchRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }

    const deleted = await this.branchRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Cabang dengan id ${id} tidak ditemukan`);
    }
    return { deleted: true };
  }
}

export const branchService = new BranchService();
