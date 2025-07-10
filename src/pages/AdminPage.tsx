import { useState, useEffect } from 'react';
import { getAllOrders } from '@/lib/firebase-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timestamp } from 'firebase/firestore';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleLogin = () => {
    if (username === 'shefmate' && password === '123456') {
      setIsAuthenticated(true);
      setError(null);
      fetchOrders();
    } else {
      setError('Invalid username or password');
    }
  };
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getAllOrders();
      
      // Delete orders with dates that have already passed
      const now = new Date();
      const currentOrders = ordersData.filter(order => {
        const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
        return orderDate >= now;
      });
      
      setOrders(currentOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return timeString;
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl sm:text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-11"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 h-11" 
              onClick={handleLogin}
            >
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 pb-20 md:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Orders Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <p className="text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm sm:text-lg">Cancelled</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0 px-3">
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'cancelled').length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">All Orders</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        ) : (
          <>
            {/* Desktop view - table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>{order.chefName}</TableCell>
                      <TableCell>{order.serviceName}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>₹{order.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile view - cards */}
            <div className="md:hidden space-y-4">
              {orders.map(order => (
                <Card key={order.id} className="overflow-hidden border-0 shadow-md">
                  <CardHeader className="pb-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-sm">Order #{order.id.substring(0, 8)}</CardTitle>
                        <CardDescription>{formatDate(order.orderDate)}</CardDescription>
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
                        <p className="text-gray-500">Chef</p>
                        <p className="font-medium">{order.chefName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Service</p>
                        <p>{order.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">₹{order.price}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Location</p>
                        <p className="truncate">{order.orderLocation}</p>
                      </div>
                      {order.customerMobile && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Phone</p>
                          <p>{order.customerMobile}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 