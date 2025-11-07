'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';
import { Notifications } from '@/components/notifications';
import { LogOut, Eye, DollarSign } from 'lucide-react';

export default function AgentDashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || currentUser.role !== 'agent') {
        router.push('/login');
        return;
      }
      fetchShipments();
    };
    initAuth();
  }, [router]);

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments');
      const data = await response.json();
      setShipments(data.shipments || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSubmitOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const offerData = {
      shipmentId: selectedShipment.id,
      price: formData.get('price'),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        setShowOfferDialog(false);
        setSelectedShipment(null);
        fetchShipments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit offer');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      offers_received: 'default',
      offer_accepted: 'default',
      in_progress: 'default',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Agent Dashboard</h1>
          <div className="flex items-center gap-4">
            <Notifications />
            <span className="text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Available Shipments</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : shipments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No available shipments at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {shipments.map((shipment) => (
              <Card key={shipment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Shipment #{shipment.id}</CardTitle>
                      <CardDescription>{shipment.description}</CardDescription>
                      {shipment.clientName && (
                        <p className="text-sm text-muted-foreground/70 mt-1">Client: {shipment.clientName}</p>
                      )}
                    </div>
                    {getStatusBadge(shipment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-semibold">Pickup:</p>
                      <p className="text-muted-foreground">{shipment.pickupAddress}</p>
                      <p className="text-muted-foreground/70 text-xs">
                        {new Date(shipment.pickupDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Delivery:</p>
                      <p className="text-muted-foreground">{shipment.deliveryAddress}</p>
                      <p className="text-muted-foreground/70 text-xs">
                        {new Date(shipment.deliveryDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedShipment(shipment);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {shipment.status === 'pending' || shipment.status === 'offers_received' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setShowOfferDialog(true);
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Submit Offer
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Shipment Details Dialog */}
      {selectedShipment && !showOfferDialog && (
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Shipment #{selectedShipment.id} Details</DialogTitle>
            </DialogHeader>
            <ShipmentDetails shipment={selectedShipment} />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedShipment(null)}
              >
                Close
              </Button>
              {(selectedShipment.status === 'pending' || selectedShipment.status === 'offers_received') && (
                <Button
                  onClick={() => {
                    setShowOfferDialog(true);
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Submit Offer
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Offer Dialog */}
      {showOfferDialog && selectedShipment && (
        <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Offer</DialogTitle>
              <DialogDescription>
                Submit your offer for Shipment #{selectedShipment.id}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowOfferDialog(false);
                    setSelectedShipment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Offer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ShipmentDetails({ shipment }: { shipment: any }) {
  const dimensions = typeof shipment.dimensions === 'string' 
    ? JSON.parse(shipment.dimensions) 
    : shipment.dimensions;
  
  const requiredDocuments = shipment.requiredDocuments
    ? (typeof shipment.requiredDocuments === 'string' 
        ? JSON.parse(shipment.requiredDocuments) 
        : shipment.requiredDocuments)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground">{shipment.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Weight</h3>
          <p className="text-muted-foreground">{shipment.weight} kg</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Dimensions</h3>
          <p className="text-muted-foreground">
            {dimensions.length} × {dimensions.width} × {dimensions.height} cm
          </p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Pickup</h3>
        <p className="text-muted-foreground">{shipment.pickupAddress}</p>
        <p className="text-muted-foreground/70 text-sm">
          {new Date(shipment.pickupDate).toLocaleString()}
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Delivery</h3>
        <p className="text-muted-foreground">{shipment.deliveryAddress}</p>
        <p className="text-muted-foreground/70 text-sm">
          {new Date(shipment.deliveryDate).toLocaleString()}
        </p>
      </div>
      {requiredDocuments.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Required Documents</h3>
          <ul className="list-disc list-inside text-muted-foreground">
            {requiredDocuments.map((doc: string, idx: number) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>
      )}
      {shipment.notes && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-muted-foreground">{shipment.notes}</p>
        </div>
      )}
    </div>
  );
}

