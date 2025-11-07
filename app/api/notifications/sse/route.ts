import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Server-Sent Events endpoint for real-time notifications
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: 'connected' }));

      // Poll for new notifications every 2 seconds
      let lastCheck = Date.now();
      
      const interval = setInterval(async () => {
        try {
          const newNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, auth.userId))
            .where(eq(notifications.read, false));

          // Check if there are notifications created after last check
          const recentNotifications = newNotifications.filter(
            (n) => new Date(n.createdAt).getTime() > lastCheck
          );

          if (recentNotifications.length > 0) {
            send(JSON.stringify({ type: 'notifications', data: recentNotifications }));
            lastCheck = Date.now();
          }
        } catch (error) {
          console.error('SSE error:', error);
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}



