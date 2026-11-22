import bcrypt from 'bcrypt';
import { db, pool } from './db.js';
import { users } from '../models/user.model.js';
import { logger } from '../utils/logger.js';

export async function seed() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Seed 1 User Admin ONLY
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db
      .insert(users)
      .values({
        name: 'Administrator',
        email: 'admin@akt.net.id',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: 'Administrator',
          password: hashedPassword,
          role: 'admin',
          username: 'admin',
          isActive: true,
          updatedAt: new Date(),
        },
      });
    logger.info('✓ Seeded admin user: admin (admin@akt.net.id / admin123)');
    logger.info('🎉 Database seeding completed: database clean (only 1 admin user ready)!');
  } catch (err) {
    logger.error('Database seeding failed:', err);
    throw err;
  }
}

// Run direct if called directly from CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
