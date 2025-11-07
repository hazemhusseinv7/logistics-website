import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Use Turso (libSQL) - supports both local and remote
// For local development, use local file
// For production, use Turso cloud with TURSO_DB_URL and TURSO_DB_AUTH_TOKEN
const client = createClient({
  url: process.env.TURSO_DB_URL || 'file:logistics.db',
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

