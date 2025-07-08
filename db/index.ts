import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import invariant from 'tiny-invariant';

const dbUrl = process.env.DATABASE_URL;
invariant(dbUrl, 'DATABASE_URL is not defined');

// Create a connection pool using Neon's serverless pool
// This supports transactions and works with drizzle-orm/neon-serverless
const pool = new Pool({ connectionString: dbUrl });

// Create the drizzle instance with the Neon pool
// This instance will be reused across all database operations
const db = drizzle(pool, { schema });

export { db };

export type Database = typeof db;
