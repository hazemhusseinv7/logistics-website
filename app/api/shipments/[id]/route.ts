import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { shipments, offers, users, notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get a specific shipment with offers
export async function GET(
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

    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 });
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

    // Get offers for this shipment
    const shipmentOffers = await db
      .select({
        id: offers.id,
        agentId: offers.agentId,
        price: offers.price,
        status: offers.status,
        notes: offers.notes,
        createdAt: offers.createdAt,
        agentName: users.name,
        agentEmail: users.email,
      })
      .from(offers)
      .leftJoin(users, eq(offers.agentId, users.id))
      .where(eq(offers.shipmentId, shipmentId));

    // Sort offers by createdAt descending (newest first)
    shipmentOffers.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Parse dimensions and requiredDocuments safely
    let dimensions;
    try {
      dimensions = typeof shipment.dimensions === 'string' 
        ? JSON.parse(shipment.dimensions) 
        : shipment.dimensions;
    } catch {
      dimensions = shipment.dimensions;
    }

    let requiredDocuments;
    try {
      requiredDocuments = shipment.requiredDocuments 
        ? (typeof shipment.requiredDocuments === 'string' 
            ? JSON.parse(shipment.requiredDocuments) 
            : shipment.requiredDocuments)
        : [];
    } catch {
      requiredDocuments = [];
    }

    return NextResponse.json({
      shipment: {
        ...shipment,
        dimensions,
        requiredDocuments,
      },
      offers: shipmentOffers,
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a shipment (clients only, and only if no offers accepted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['client']);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const shipmentId = parseInt(id);

    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 });
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

    // Check if client owns the shipment
    if (shipment.clientId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if shipment can be deleted (only if no offer has been accepted)
    if (shipment.status === 'offer_accepted' || shipment.status === 'in_progress' || shipment.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete shipment with accepted offer or in progress' },
        { status: 400 }
      );
    }

    // Delete related offers first
    await db
      .delete(offers)
      .where(eq(offers.shipmentId, shipmentId));

    // Delete related notifications
    await db
      .delete(notifications)
      .where(eq(notifications.shipmentId, shipmentId));

    // Delete shipment
    await db
      .delete(shipments)
      .where(eq(shipments.id, shipmentId));

    return NextResponse.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
