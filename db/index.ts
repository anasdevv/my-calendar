// 'use server';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { schema } from './schema';
import invariant from 'tiny-invariant';
import { getDatabaseUrl } from '@/lib/server-config';

class DatabaseSingleton {
  private static _instance: DatabaseSingleton | null = null;
  private _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
  private _pool: Pool | null = null;

  private constructor() {}

  public static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton._instance) {
      DatabaseSingleton._instance = new DatabaseSingleton();
    }
    return DatabaseSingleton._instance;
  }

  public getDb() {
    if (!this._db) {
      this.initializeDatabase();
    }
    return this._db!;
  }

  private initializeDatabase() {
    if (typeof window !== 'undefined') {
      throw new Error('Database can only be initialized on the server side');
    }

    const dbUrl = getDatabaseUrl();
    this._pool = new Pool({ connectionString: dbUrl });
    this._db = drizzle(this._pool, { schema });

    console.log('Database connection initialized successfully');
  }

  public async close() {
    if (this._pool) {
      await this._pool.end();
      this._pool = null;
      this._db = null;
      console.log('Database connection closed');
    }
  }

  public async healthCheck() {
    const db = this.getDb();
    try {
      await db.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const getDbInstance = () => {
  return DatabaseSingleton.getInstance().getDb();
};

export const withDb = async <T>(
  callback: (db: Database) => Promise<T>
): Promise<T> => {
  const db = getDbInstance();
  return await callback(db);
};

export const checkDbHealth = async (): Promise<boolean> => {
  return await DatabaseSingleton.getInstance().healthCheck();
};

export type Database = ReturnType<typeof getDbInstance>;

export const dbSingleton = DatabaseSingleton.getInstance();
