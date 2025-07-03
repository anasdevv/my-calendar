import invariant from 'tiny-invariant';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
invariant(databaseUrl, 'DATABASE_URL is not defined');

export default defineConfig({
  out: './db/migrations',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: databaseUrl,
  },
});
