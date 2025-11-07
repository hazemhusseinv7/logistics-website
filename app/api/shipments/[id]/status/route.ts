import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { shipments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PATCH - Update shipment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const shipmentId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'offers_received', 'offer_accepted', 'in_progress', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get shipment
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Check access
    if (auth.role === 'client' && shipment.clientId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status
    await db
      .update(shipments)
      .set({ status, updatedAt: new Date() })
      .where(eq(shipments.id, shipmentId));

    return NextResponse.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

