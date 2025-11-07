import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { shipments, offers, users } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';

// GET - Get all shipments (filtered by role)
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (auth.role === 'client') {
      // Clients see only their shipments
      const clientShipments = await db
        .select()
        .from(shipments)
        .where(eq(shipments.clientId, auth.userId))
        .orderBy(desc(shipments.createdAt));

      return NextResponse.json({ shipments: clientShipments });
    } else {
      // Agents see all available shipments (pending or offers_received)
      const availableShipments = await db
        .select({
          id: shipments.id,
          clientId: shipments.clientId,
          serviceType: shipments.serviceType,
          description: shipments.description,
          weight: shipments.weight,
          dimensions: shipments.dimensions,
          pickupAddress: shipments.pickupAddress,
          pickupDate: shipments.pickupDate,
          deliveryAddress: shipments.deliveryAddress,
          deliveryDate: shipments.deliveryDate,
          requiredDocuments: shipments.requiredDocuments,
          notes: shipments.notes,
          status: shipments.status,
          acceptedOfferId: shipments.acceptedOfferId,
          createdAt: shipments.createdAt,
          updatedAt: shipments.updatedAt,
          clientName: users.name,
        })
        .from(shipments)
        .leftJoin(users, eq(shipments.clientId, users.id))
        .where(or(eq(shipments.status, 'pending'), eq(shipments.status, 'offers_received')))
        .orderBy(desc(shipments.createdAt));

      return NextResponse.json({ shipments: availableShipments });
    }
  } catch (error) {
    console.error('Get shipments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new shipment (clients only)
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['client']);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      serviceType,
      description,
      weight,
      dimensions,
      pickupAddress,
      pickupDate,
      deliveryAddress,
      deliveryDate,
      requiredDocuments,
      notes,
    } = body;

    // Validate required fields
    if (!serviceType || !description || !weight || !dimensions || 
        !pickupAddress || !pickupDate || !deliveryAddress || !deliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newShipment] = await db.insert(shipments).values({
      clientId: auth.userId,
      serviceType,
      description,
      weight: parseFloat(weight),
      dimensions: typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions),
      pickupAddress,
      pickupDate: new Date(pickupDate),
      deliveryAddress,
      deliveryDate: new Date(deliveryDate),
      requiredDocuments: requiredDocuments ? (typeof requiredDocuments === 'string' ? requiredDocuments : JSON.stringify(requiredDocuments)) : null,
      notes: notes || null,
      status: 'pending',
    }).returning();

    return NextResponse.json({ shipment: newShipment }, { status: 201 });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

