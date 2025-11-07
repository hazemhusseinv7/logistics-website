import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { offers, shipments, notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Reject an offer (clients only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['client']);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const offerId = parseInt(id);

    // Get offer with shipment
    const [offer] = await db
      .select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Get shipment
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, offer.shipmentId))
      .limit(1);

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Check if client owns the shipment
    if (shipment.clientId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if offer can be rejected
    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'This offer cannot be rejected' },
        { status: 400 }
      );
    }

    // Update offer status
    await db
      .update(offers)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    // Create notification for agent
    await db.insert(notifications).values({
      userId: offer.agentId,
      type: 'offer_rejected',
      title: 'Offer Rejected',
      message: `Your offer of $${offer.price} has been rejected.`,
      shipmentId: shipment.id,
      offerId: offerId,
      read: false,
    });

    return NextResponse.json({ message: 'Offer rejected successfully' });
  } catch (error) {
    console.error('Reject offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

