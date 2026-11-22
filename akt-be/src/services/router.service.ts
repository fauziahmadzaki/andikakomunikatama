import { routerRepository, RouterRepository } from '../repositories/router.repository.js';
import { NotFoundError } from '../core/errors.js';
import { testRouterConnection } from '../core/router-connection.js';
import { fetchRealRouterTelemetry } from '../core/routeros-client.js';
import {
  CreateRouterInput,
  UpdateRouterInput,
  TestConnectionInput,
} from '../validations/router.validation.js';
import { RouterEntity } from '../models/router.model.js';

export class RouterService {
  constructor(private routerRepo: RouterRepository = routerRepository) {}

  /**
   * Sanitizes router data so that the password is NEVER sent to the client.
   * secretConfigured indicates whether a password is set in DB.
   */
  private sanitizeRouter(router: RouterEntity) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = router;
    return {
      ...rest,
      secretConfigured: Boolean(password && password.length > 0),
    };
  }

  async getAllRouters() {
    const items = await this.routerRepo.findAll();
    return items.map((r) => this.sanitizeRouter(r));
  }

  async getRouterById(id: string) {
    const item = await this.routerRepo.findById(id);
    if (!item) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }
    return this.sanitizeRouter(item);
  }

  async createRouter(input: CreateRouterInput) {
    // Auto test connection to host:apiPort immediately on router creation
    const testResult = await testRouterConnection(input.host, input.apiPort);
    const now = new Date();

    const created = await this.routerRepo.create({
      name: input.name,
      branchId: input.branchId,
      host: input.host,
      apiPort: input.apiPort,
      username: input.username,
      password: input.password,
      status: testResult.success ? input.status : 'active',
      lastTestResult: testResult.success ? 'success' : 'failed',
      lastTestMessage: testResult.message,
      lastSeenAt: testResult.success ? now : null,
    });

    return {
      ...this.sanitizeRouter(created),
      connectionTest: testResult,
    };
  }

  async updateRouter(id: string, input: UpdateRouterInput) {
    const existing = await this.routerRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }

    const updatePayload: Record<string, unknown> = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.branchId !== undefined) updatePayload.branchId = input.branchId;
    if (input.host !== undefined) updatePayload.host = input.host;
    if (input.apiPort !== undefined) updatePayload.apiPort = input.apiPort;
    if (input.username !== undefined) updatePayload.username = input.username;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.password && input.password.trim().length > 0) {
      updatePayload.password = input.password;
    }

    // If host or apiPort changed, run auto test
    let connectionTest;
    if (
      (input.host && input.host !== existing.host) ||
      (input.apiPort && input.apiPort !== existing.apiPort)
    ) {
      const targetHost = input.host ?? existing.host;
      const targetPort = input.apiPort ?? existing.apiPort;
      connectionTest = await testRouterConnection(targetHost, targetPort);
      updatePayload.lastTestResult = connectionTest.success ? 'success' : 'failed';
      updatePayload.lastTestMessage = connectionTest.message;
      if (connectionTest.success) {
        updatePayload.lastSeenAt = new Date();
      }
    }

    const updated = await this.routerRepo.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }

    return {
      ...this.sanitizeRouter(updated),
      ...(connectionTest && { connectionTest }),
    };
  }

  async deleteRouter(id: string) {
    const deleted = await this.routerRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }
    return { deleted: true };
  }

  async testRouterById(id: string) {
    const router = await this.routerRepo.findById(id);
    if (!router) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }

    const testResult = await testRouterConnection(router.host, router.apiPort);

    const now = new Date();
    const statusUpdate = testResult.success ? 'active' : router.status;

    const updated = await this.routerRepo.update(id, {
      lastTestResult: testResult.success ? 'success' : 'failed',
      lastTestMessage: testResult.message,
      lastSeenAt: testResult.success ? now : router.lastSeenAt,
      status: statusUpdate,
    });

    return {
      ...testResult,
      router: updated ? this.sanitizeRouter(updated) : this.sanitizeRouter(router),
    };
  }

  async testDirectConnection(input: TestConnectionInput) {
    const testResult = await testRouterConnection(input.host, input.apiPort);
    return testResult;
  }

  async getRouterTelemetry(id: string) {
    const router = await this.routerRepo.findById(id);
    if (!router) {
      throw new NotFoundError(`Router dengan id ${id} tidak ditemukan`);
    }

    // Connect and fetch real telemetry from MikroTik RouterOS
    const telemetry = await fetchRealRouterTelemetry({
      routerId: router.id,
      host: router.host,
      apiPort: router.apiPort,
      username: router.username,
      password: router.password,
    });

    if (telemetry.connected) {
      await this.routerRepo.update(id, {
        lastSeenAt: new Date(),
        lastTestResult: 'success',
        lastTestMessage: telemetry.message,
      });
    }

    return telemetry;
  }
}

export const routerService = new RouterService();
