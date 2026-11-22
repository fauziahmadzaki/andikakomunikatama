import { pool } from '../core/db.js';

export class HealthService {
  async checkHealth() {
    let dbStatus = 'healthy';
    let dbError: string | null = null;

    try {
      await pool.query('SELECT 1');
    } catch (err: unknown) {
      dbStatus = 'unhealthy';
      dbError = err instanceof Error ? err.message : 'Database check failed';
    }

    return {
      server: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      ...(dbError && { databaseError: dbError }),
    };
  }
}

export const healthService = new HealthService();
