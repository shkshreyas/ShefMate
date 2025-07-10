import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrdersByUserId, subscribeToUserOrders } from '@/lib/firebase-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from "@/hooks/use-toast";

export default function CustomerOrdersPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Check if user was redirected after creating a new booking
  useEffect(() => {
    if (location.state?.newBooking) {
      toast({
        title: "Booking Successful",
        description: "Your booking has been created successfully.",
        variant: "default",
      });
      
      // Clear the state
      navigate('/orders', { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [user, isLoaded, navigate]);

  useEffect(() => {
    if (isLoaded && user) {
      // Set up realtime subscription to orders
      const unsubscribe = subscribeToUserOrders(user.id, (updatedOrders) => {
        setOrders(updatedOrders);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [isLoaded, user]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status === 'accepted');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  return (
    <div className="container mx-auto py-6 px-4 pb-20 md:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">My Orders</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="relative">
            Accepted
            {acceptedOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {acceptedOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-lg mb-4">No pending orders</p>
              <Button onClick={() => navigate('/chefs')} className="bg-primary hover:bg-primary/90">
                Browse Chefs
              </Button>
            </div>
          ) : (
            pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
          {acceptedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">No accepted orders</p>
            </div>
          ) : (
            acceptedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">No completed orders</p>
            </div>
          ) : (
            completedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">No cancelled orders</p>
            </div>
          ) : (
            cancelledOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Accepted</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date properly
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Display the time - could be a string or could need formatting
  const displayTime = order.orderTime || 'N/A';

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-xl">
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base sm:text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              {formatDate(order.orderDate)} at {displayTime}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-gray-500">Chef</p>
            <p className="font-medium text-primary">{order.chefName}</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-medium">₹{order.price}</p>
          </div>
          <div>
            <p className="text-gray-500">Service</p>
            <p>{order.serviceName}</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p>{order.duration || 'N/A'} hour(s)</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Location</p>
            <p className="truncate">{order.orderLocation}</p>
          </div>
          {order.foodPreference && (
            <div className="col-span-2">
              <p className="text-gray-500">Food Preference</p>
              <p>{order.foodPreference}</p>
            </div>
          )}
        </div>
      </CardContent>
      {order.status === 'accepted' && order.chefPhone && (
        <CardFooter className="flex flex-wrap gap-2 pt-0 border-t mt-4 bg-gray-50">
          <Button 
            onClick={() => window.open(`tel:${order.chefPhone}`)}
            size="sm"
            className="text-sm"
          >
            Contact Chef
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 