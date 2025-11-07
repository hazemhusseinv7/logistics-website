import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

/**
 * Reset Database Script
 * 
 * This script deletes all data from all tables.
 * Run with: pnpm db:reset
 * 
 * WARNING: This will delete ALL data!
 */

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');

    // Create client directly to execute SQL
    const client = createClient({
      url: process.env.TURSO_DB_URL || 'file:logistics.db',
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });

    // Delete all data from tables (in correct order due to foreign keys)
    console.log('Deleting notifications...');
    await client.execute('DELETE FROM notifications');
    
    console.log('Deleting offers...');
    await client.execute('DELETE FROM offers');
    
    console.log('Deleting shipments...');
    await client.execute('DELETE FROM shipments');
    
    console.log('Deleting users...');
    await client.execute('DELETE FROM users');

    await client.close();

    console.log('✅ Database reset complete!');
    console.log('All tables are now empty.');
    console.log('You can now create new accounts and shipments.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();

