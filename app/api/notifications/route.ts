import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Get user notifications
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, auth.userId))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json({ notifications: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



