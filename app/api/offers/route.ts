import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { offers, shipments, notifications, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendNewOfferEmail } from '@/lib/email';

// POST - Create a new offer (agents only)
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['agent']);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shipmentId, price, notes } = body;

    if (!shipmentId || !price) {
      return NextResponse.json(
        { error: 'Shipment ID and price are required' },
        { status: 400 }
      );
    }

    // Check if shipment exists and is available
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    if (shipment.status !== 'pending' && shipment.status !== 'offers_received') {
      return NextResponse.json(
        { error: 'Shipment is not accepting offers' },
        { status: 400 }
      );
    }

    // Check if agent already made an offer
    const existingOffer = await db
      .select()
      .from(offers)
      .where(and(eq(offers.shipmentId, shipmentId), eq(offers.agentId, auth.userId)))
      .limit(1);

    if (existingOffer.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted an offer for this shipment' },
        { status: 400 }
      );
    }

    // Create offer
    const [newOffer] = await db.insert(offers).values({
      agentId: auth.userId,
      shipmentId,
      price: parseFloat(price),
      notes: notes || null,
      status: 'pending',
    }).returning();

    // Update shipment status
    const newStatus = shipment.status === 'pending' ? 'offers_received' : 'offers_received';
    await db
      .update(shipments)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(shipments.id, shipmentId));

    // Get client and agent info for email
    const [client] = await db.select().from(users).where(eq(users.id, shipment.clientId)).limit(1);
    const [agent] = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);

    // Create notification ONLY for the client (not the agent)
    // The agent should not receive a notification when they create an offer
    await db.insert(notifications).values({
      userId: shipment.clientId, // Only notify the client
      type: 'new_offer',
      title: 'New Offer Received',
      message: `You have received a new offer of $${price} from ${agent?.name || 'an agent'} for your shipment #${shipmentId}.`,
      shipmentId: shipmentId,
      offerId: newOffer.id,
      read: false,
    });

    // Send email notification only to client
    if (client && agent) {
      await sendNewOfferEmail(
        client.email,
        client.name,
        agent.name,
        parseFloat(price),
        shipmentId
      );
    }

    return NextResponse.json({ offer: newOffer }, { status: 201 });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

