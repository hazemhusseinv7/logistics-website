import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Warehouse, FileText, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">LogiFlow</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          Streamline Your Logistics Operations
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with trusted agents for transport, customs clearance, storage, and shipping services.
          Manage your shipments efficiently from one platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup?role=client">
            <Button size="lg">I'm a Client</Button>
          </Link>
          <Link href="/signup?role=agent">
            <Button size="lg" variant="outline">I'm an Agent</Button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Truck className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Transport</CardTitle>
              <CardDescription>
                Reliable transportation services for your goods with real-time tracking
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Customs Clearance</CardTitle>
              <CardDescription>
                Expert assistance with customs documentation and clearance procedures
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Warehouse className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Storage</CardTitle>
              <CardDescription>
                Secure storage facilities for your inventory with flexible terms
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Package className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Shipping</CardTitle>
              <CardDescription>
                Comprehensive shipping solutions for domestic and international deliveries
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-card">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose LogiFlow?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Secure Platform</h3>
            <p className="text-muted-foreground">
              Your data and transactions are protected with industry-standard security measures
            </p>
          </div>
          <div className="text-center">
            <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Updates</h3>
            <p className="text-muted-foreground">
              Get instant notifications on offers and shipment status updates
            </p>
          </div>
          <div className="text-center">
            <Package className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Easy Management</h3>
            <p className="text-muted-foreground">
              Intuitive interface to create, track, and manage all your shipments
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of clients and agents already using LogiFlow
        </p>
        <Link href="/signup">
          <Button size="lg">Create Your Account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 LogiFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
