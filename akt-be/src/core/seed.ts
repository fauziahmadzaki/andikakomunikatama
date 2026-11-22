import bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { db, pool } from './db.js';
import { users } from '../models/user.model.js';
import { logger } from '../utils/logger.js';

export async function seed() {
  logger.info('🌱 Checking database seeding...');

  try {
    // Seed 1 User Admin ONLY if not exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, 'admin'), eq(users.email, 'admin@akt.net.id')))
      .limit(1);

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(users).values({
        name: 'Administrator',
        email: 'admin@akt.net.id',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      logger.info('✓ Seeded admin user: admin (admin@akt.net.id / admin123)');
    } else {
      logger.info('✓ Admin user already exists.');
    }

    logger.info('🎉 Database seeding completed: database clean (only 1 admin user ready)!');
  } catch (err) {
    logger.error('Database seeding check failed:', err);
  }
}

// Run direct if called directly from CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
