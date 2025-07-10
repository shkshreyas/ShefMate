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
    <div className="container mx-auto py-6 px-4 pb-20 md:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Chef Dashboard</h1>
      
      {chef && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              {chef.profileImage && (
                <img 
                  src={chef.profileImage} 
                  alt={chef.displayName} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary"
                />
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{chef.displayName}</h2>
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
            
            <div className="md:ml-auto grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 md:mt-0">
              <div className="text-center bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs sm:text-sm">Total Orders</p>
                <p className="text-xl sm:text-2xl font-semibold">{chef.totalOrders || 0}</p>
              </div>
              <div className="text-center bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs sm:text-sm">Customers</p>
                <p className="text-xl sm:text-2xl font-semibold">{chef.customersServed || 0}</p>
              </div>
              <div className="text-center bg-green-50 p-3 rounded-lg">
                <p className="text-green-700 text-xs sm:text-sm">Earnings</p>
                <p className="text-xl sm:text-2xl font-semibold text-green-700">₹{totalEarnings}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => navigate('/become-chef')} variant="outline" size="sm" className="text-sm">
              Edit Profile
            </Button>
            <Button onClick={() => navigate(`/chefs/${chef.id}`)} variant="outline" size="sm" className="text-sm">
              View Public Profile
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Orders Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <div className="flex justify-between">
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-lg font-semibold text-yellow-600">₹{pendingEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Accepted</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <div className="flex justify-between">
                <p className="text-2xl font-bold">{acceptedOrders.length}</p>
                <p className="text-lg font-semibold text-blue-600">₹{acceptedEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <div className="flex justify-between">
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-lg font-semibold text-green-600">₹{totalEarnings}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Cancelled</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <p className="text-2xl font-bold">{cancelledOrders.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
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
              <p className="text-gray-500">No pending orders</p>
            </div>
          ) : (
            pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus}
                showAcceptButton
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
                onUpdateStatus={handleUpdateOrderStatus}
                showCompleteButton
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
                onUpdateStatus={handleUpdateOrderStatus}
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
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
      window.location.href = `tel:${order.customerMobile}`;
    }
  };
  
  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-xl">
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base sm:text-lg">{order.serviceName}</CardTitle>
            <CardDescription>Order #{order.id.substring(0, 8)}</CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium">{order.userName}</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-medium">₹{order.price}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p>{formatDate(order.orderDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p>{order.orderTime || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Location</p>
            <p className="truncate">{order.orderLocation}</p>
          </div>
          {order.orderNotes && (
            <div className="col-span-2">
              <p className="text-gray-500">Notes</p>
              <p>{order.orderNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0 border-t mt-4 bg-gray-50">
        {order.customerMobile && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCallCustomer}
            className="text-sm"
          >
            Call Customer
          </Button>
        )}
        
        {showAcceptButton && (
          <Button 
            variant="default"
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'accepted')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            Accept Order
          </Button>
        )}
        
        {showAcceptButton && (
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            className="text-red-500 border-red-200 hover:bg-red-50 text-sm"
          >
            Decline
          </Button>
        )}
        
        {showCompleteButton && (
          <Button 
            variant="default"
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="bg-green-500 hover:bg-green-600 text-white text-sm"
          >
            Mark Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 