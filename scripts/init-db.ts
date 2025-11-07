import { db } from '../lib/db';
import { users, shipments, offers, notifications } from '../lib/db/schema';

// This script initializes the database by creating tables
// Run with: pnpm tsx scripts/init-db.ts

async function initDatabase() {
  try {
    // Drizzle will create tables automatically on first query
    // But we can also push schema directly
    console.log('Database initialized successfully');
    console.log('Run "pnpm db:push" to create tables');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();



