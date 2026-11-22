import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: [
    './src/models/user.model.ts',
    './src/models/router.model.ts',
    './src/models/branch.model.ts',
    './src/models/monitoring.model.ts',
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/akt_db',
  },
});
