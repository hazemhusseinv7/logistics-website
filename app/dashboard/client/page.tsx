'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';
import { Notifications } from '@/components/notifications';
import { Truck, FileText, Warehouse, Package, Plus, LogOut, Eye, Trash2 } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transport');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || currentUser.role !== 'client') {
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

  const handleCreateShipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const shipmentData = {
      serviceType: activeTab,
      description: formData.get('description'),
      weight: formData.get('weight'),
      dimensions: JSON.stringify({
        length: formData.get('length'),
        width: formData.get('width'),
        height: formData.get('height'),
      }),
      pickupAddress: formData.get('pickupAddress'),
      pickupDate: formData.get('pickupDate'),
      deliveryAddress: formData.get('deliveryAddress'),
      deliveryDate: formData.get('deliveryDate'),
      requiredDocuments: JSON.stringify(
        formData.get('requiredDocuments')?.toString().split(',').map((d: string) => d.trim()) || []
      ),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        fetchShipments();
        e.currentTarget.reset();
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  };

  const handleDeleteShipment = async (shipmentId: number) => {
    if (!confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchShipments();
        if (selectedShipment?.id === shipmentId) {
          setSelectedShipment(null);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete shipment');
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('An error occurred while deleting the shipment');
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

  const filteredShipments = shipments.filter(s => s.serviceType === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Client Dashboard</h1>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transport">
              <Truck className="w-4 h-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="customs">
              <FileText className="w-4 h-4 mr-2" />
              Customs
            </TabsTrigger>
            <TabsTrigger value="storage">
              <Warehouse className="w-4 h-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="shipping">
              <Package className="w-4 h-4 mr-2" />
              Shipping
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold capitalize">{activeTab} Shipments</h2>
              {activeTab === 'transport' && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Shipment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Transport Shipment</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your shipment
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateShipment} className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input id="weight" name="weight" type="number" step="0.01" required />
                        </div>
                        <div>
                          <Label htmlFor="length">Length (cm)</Label>
                          <Input id="length" name="length" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="width">Width (cm)</Label>
                          <Input id="width" name="width" type="number" required />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input id="height" name="height" type="number" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pickupAddress">Pickup Address</Label>
                        <Textarea id="pickupAddress" name="pickupAddress" required />
                      </div>
                      <div>
                        <Label htmlFor="pickupDate">Pickup Date</Label>
                        <Input id="pickupDate" name="pickupDate" type="datetime-local" required />
                      </div>
                      <div>
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Textarea id="deliveryAddress" name="deliveryAddress" required />
                      </div>
                      <div>
                        <Label htmlFor="deliveryDate">Delivery Date</Label>
                        <Input id="deliveryDate" name="deliveryDate" type="datetime-local" required />
                      </div>
                      <div>
                        <Label htmlFor="requiredDocuments">Required Documents (comma-separated)</Label>
                        <Input id="requiredDocuments" name="requiredDocuments" placeholder="Invoice, Bill of Lading, etc." />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <Button type="submit" className="w-full">Create Shipment</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredShipments.length === 0 ? (
              <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No shipments found. {activeTab === 'transport' && 'Create your first shipment!'}
              </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Shipment #{shipment.id}</CardTitle>
                          <CardDescription>{shipment.description}</CardDescription>
                        </div>
                        {getStatusBadge(shipment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
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
                      <div className="mt-4 flex gap-2">
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
                        {(shipment.status === 'pending' || shipment.status === 'offers_received') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteShipment(shipment.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Shipment Details Dialog */}
      {selectedShipment && (
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Shipment #{selectedShipment.id} Details</DialogTitle>
            </DialogHeader>
            <ShipmentDetails 
              shipmentId={selectedShipment.id} 
              onClose={() => setSelectedShipment(null)}
              onUpdate={fetchShipments}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ShipmentDetails({ 
  shipmentId, 
  onClose,
  onUpdate 
}: { 
  shipmentId: number;
  onClose?: () => void;
  onUpdate?: () => void;
}) {
  const [shipment, setShipment] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentDetails();
    }
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/shipments/${shipmentId}`);
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || 'Failed to fetch shipment';
        console.error('Error fetching shipment:', errorMsg);
        setError(errorMsg);
        setShipment(null);
        setOffers([]);
        setLoading(false);
        return;
      }
      
      if (data.error) {
        console.error('API error:', data.error);
        setError(data.error);
        setShipment(null);
        setOffers([]);
        setLoading(false);
        return;
      }
      
      setShipment(data.shipment);
      setOffers(data.offers || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching shipment details:', error);
      setError('Network error: Could not fetch shipment details');
      setShipment(null);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async (offerId: number) => {
    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchShipmentDetails();
        // Refresh the shipments list in parent component
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('An error occurred while accepting the offer');
    }
  };

  const rejectOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to reject this offer?')) {
      return;
    }
    try {
      const response = await fetch(`/api/offers/${offerId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchShipmentDetails();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('An error occurred while rejecting the offer');
    }
  };

  if (loading) return <div className="p-4 text-center text-foreground">Loading shipment details...</div>;
  if (error) return (
    <div className="p-4 text-center">
      <div className="text-destructive mb-2">{error}</div>
      <Button size="sm" onClick={fetchShipmentDetails} variant="outline">
        Retry
      </Button>
    </div>
  );
  if (!shipment) return <div className="p-4 text-center text-destructive">Shipment not found</div>;

  let dimensions;
  try {
    dimensions = typeof shipment.dimensions === 'string' 
      ? JSON.parse(shipment.dimensions) 
      : shipment.dimensions;
    if (!dimensions || typeof dimensions !== 'object') {
      dimensions = { length: 0, width: 0, height: 0 };
    }
  } catch (e) {
    dimensions = { length: 0, width: 0, height: 0 };
  }

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
      {shipment.notes && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-muted-foreground">{shipment.notes}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Offers ({offers.length})</h3>
        {offers.length === 0 ? (
          <p className="text-muted-foreground">No offers yet</p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">${offer.price}</p>
                      <p className="text-sm text-muted-foreground">by {offer.agentName}</p>
                      {offer.notes && (
                        <p className="text-sm text-muted-foreground/70 mt-1">{offer.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={
                        offer.status === 'accepted' ? 'default' : 
                        offer.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {offer.status}
                      </Badge>
                      {offer.status === 'pending' && 
                       (shipment.status === 'pending' || shipment.status === 'offers_received') && 
                       !shipment.acceptedOfferId && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => acceptOffer(offer.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectOffer(offer.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {shipment.status === 'offer_accepted' && offer.status === 'accepted' && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

