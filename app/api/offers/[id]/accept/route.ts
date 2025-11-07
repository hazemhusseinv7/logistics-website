import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { offers, shipments, notifications, users } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { sendOfferAcceptedEmail } from '@/lib/email';

// POST - Accept an offer (clients only)
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
      .select({
        offer: offers,
        shipment: shipments,
      })
      .from(offers)
      .innerJoin(shipments, eq(offers.shipmentId, shipments.id))
      .where(eq(offers.id, offerId))
      .limit(1);

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Check if client owns the shipment
    if (offer.shipment.clientId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if shipment can accept offers
    if (offer.shipment.status !== 'offers_received' && offer.shipment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Shipment is not in a state to accept offers' },
        { status: 400 }
      );
    }

    // Check if another offer was already accepted
    if (offer.shipment.acceptedOfferId) {
      return NextResponse.json(
        { error: 'An offer has already been accepted for this shipment' },
        { status: 400 }
      );
    }

    // Update offer status
    await db
      .update(offers)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    // Reject all other offers for this shipment
    await db
      .update(offers)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(
        and(
          eq(offers.shipmentId, offer.shipment.id),
          ne(offers.id, offerId)
        )
      );

    // Update shipment
    await db
      .update(shipments)
      .set({
        status: 'offer_accepted',
        acceptedOfferId: offerId,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, offer.shipment.id));

    // Get agent info for email
    const [agent] = await db.select().from(users).where(eq(users.id, offer.offer.agentId)).limit(1);

    // Create notification for agent
    await db.insert(notifications).values({
      userId: offer.offer.agentId,
      type: 'offer_accepted',
      title: 'Offer Accepted',
      message: `Your offer of $${offer.offer.price} has been accepted!`,
      shipmentId: offer.shipment.id,
      offerId: offerId,
      read: false,
    });

    // Send email notification
    if (agent) {
      await sendOfferAcceptedEmail(
        agent.email,
        agent.name,
        offer.offer.price,
        offer.shipment.id
      );
    }

    return NextResponse.json({ message: 'Offer accepted successfully' });
  } catch (error) {
    console.error('Accept offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

