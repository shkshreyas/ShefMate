import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getChefByUserId, getOrdersByChefId, updateOrderStatus, subscribeToChefOrders } from '@/lib/firebase-utils';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";

export default function ChefDashboardPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [chef, setChef] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [user, isLoaded, navigate]);

  useEffect(() => {
    async function fetchChefData() {
      if (isLoaded && user) {
        try {
          const chefData = await getChefByUserId(user.id);
          if (!chefData) {
            navigate('/become-chef');
            return;
          }
          
          setChef(chefData);
          
          // Subscribe to real-time order updates
          const unsubscribe = subscribeToChefOrders(chefData.id, (updatedOrders) => {
            setOrders(updatedOrders);
            setLoading(false);
          });
          
          return () => unsubscribe();
        } catch (err) {
          console.error('Error fetching chef data:', err);
          setError('Failed to load chef data');
          setLoading(false);
        }
      }
    }
    
    fetchChefData();
  }, [isLoaded, user, navigate]);

  async function handleUpdateOrderStatus(orderId: string, status: string) {
    try {
      await updateOrderStatus(orderId, status);
      
      // Show toast notification
      toast({
        title: `Order ${status}`,
        description: `Order has been marked as ${status}.`,
        variant: status === 'cancelled' ? 'destructive' : 'default',
      });
      
      // The real-time subscription will update the orders
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
      
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  }

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
        <div className="text-xl">Loading...</div>
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

  // Calculate earnings
  const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const pendingEarnings = pendingOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const acceptedEarnings = acceptedOrders.reduce((sum, order) => sum + (order.price || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Chef Dashboard</h1>
      
      {chef && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              {chef.profileImage && (
                <img 
                  src={chef.profileImage} 
                  alt={chef.displayName} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{chef.displayName}</h2>
                <p className="text-gray-600">{chef.location}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge className="bg-primary text-white">
                    {chef.experienceYears} years experience
                  </Badge>
                  <Badge className="bg-gray-800 text-white">
                    {chef.rating || '0'} ★ Rating
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="md:ml-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-semibold">{chef.totalOrders || 0}</p>
              </div>
              <div className="text-center bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Customers Served</p>
                <p className="text-2xl font-semibold">{chef.customersServed || 0}</p>
              </div>
              <div className="text-center bg-green-50 p-3 rounded-lg">
                <p className="text-green-700 text-sm">Total Earnings</p>
                <p className="text-2xl font-semibold text-green-700">₹{totalEarnings}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={() => navigate('/become-chef')} variant="outline" className="mr-2">
              Edit Profile
            </Button>
            <Button onClick={() => navigate(`/chefs/${chef.id}`)} variant="outline">
              View Public Profile
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Orders Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <p className="text-3xl font-bold">{pendingOrders.length}</p>
                <p className="text-xl font-semibold text-yellow-600">₹{pendingEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <p className="text-3xl font-bold">{acceptedOrders.length}</p>
                <p className="text-xl font-semibold text-blue-600">₹{acceptedEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <p className="text-3xl font-bold">{completedOrders.length}</p>
                <p className="text-xl font-semibold text-green-600">₹{totalEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cancelledOrders.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
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
            <div className="text-center py-8 text-gray-500">No pending orders</div>
          ) : (
            pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus}
                showAcceptButton={true}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
          {acceptedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No accepted orders</div>
          ) : (
            acceptedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus}
                showCompleteButton={true}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No completed orders</div>
          ) : (
            completedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cancelled orders</div>
          ) : (
            cancelledOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OrderCardProps {
  order: any;
  onUpdateStatus: (orderId: string, status: string) => void;
  showAcceptButton?: boolean;
  showCompleteButton?: boolean;
}

function OrderCard({ order, onUpdateStatus, showAcceptButton, showCompleteButton }: OrderCardProps) {
  const navigate = useNavigate();
  
  // Use formatted date if available, otherwise try to format from Timestamp
  const displayDate = order.formattedDate || (order.orderDate ? 
    (order.orderDate.toDate ? 
      order.orderDate.toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) 
      : new Date(order.orderDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }))
    : 'Unknown date');
  
  // Display the time - could be a string or could need formatting
  const displayTime = order.orderTime || 'Unknown time';

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

  const handleCallCustomer = () => {
    if (order.customerMobile) {
      window.open(`tel:${order.customerMobile}`);
    } else {
      toast({
        title: "No phone number",
        description: "Customer phone number is not available.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              {displayDate} at {displayTime}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Customer:</span> 
            <span className="text-primary font-medium">{order.userName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Phone:</span> {order.customerMobile}
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span> {order.orderLocation}
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span> {order.duration} hour(s)
          </div>
          {order.foodPreference && (
            <div>
              <span className="font-medium text-gray-700">Food Preference:</span> {order.foodPreference}
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Service:</span> {order.serviceName}
          </div>
          <div className="mt-1">
            <span className="font-medium text-gray-700 text-lg">Price:</span> <span className="text-green-600 font-semibold text-lg">₹{order.price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        {showAcceptButton && (
          <>
            <Button 
              variant="outline" 
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90" 
              onClick={() => onUpdateStatus(order.id, 'accepted')}
            >
              Accept Order
            </Button>
          </>
        )}
        
        {showCompleteButton && (
          <>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={handleCallCustomer}
            >
              Call Customer
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => onUpdateStatus(order.id, 'completed')}
            >
              Mark as Completed
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 