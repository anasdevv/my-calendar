import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import invariant from 'tiny-invariant';

const dbUrl = process.env.DATABASE_URL;
invariant(dbUrl, 'DATABASE_URL is not defined');

// Create a singleton connection using Neon's HTTP driver
// Neon uses HTTP requests instead of persistent TCP connections,
// so there's no connection pooling needed and no TCP handshake overhead
// offcourse there is cold start
const sql = neon(dbUrl);

// Create the drizzle instance with the Neon client
// This instance will be reused across all database operations
const db = drizzle({ client: sql, schema });

// Export the database instance and schema
export { db };

export type Database = typeof db;
