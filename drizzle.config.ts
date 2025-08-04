'use server';
import { defineConfig } from 'drizzle-kit';
import { getDatabaseUrl } from './lib/server-config';

const databaseUrl = getDatabaseUrl();

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
