import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  status: string;
  order_date: string;
  order_time: string;
  duration: number;
  food_preference: string;
  customer_mobile: string;
  created_at: string;
  service: { service_name: string; price: number };
  chef: { id: string; };
}

export default function CustomerOrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setLoading(true);
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status, order_date, order_time, duration, food_preference, customer_mobile, created_at, service:service_id(service_name, price), chef:chef_id(id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const fixedOrders = (ordersData || []).map((o: any) => ({
        ...o,
        service: Array.isArray(o.service) ? o.service[0] : o.service,
        chef: Array.isArray(o.chef) ? o.chef[0] : o.chef,
      }));
      setOrders(fixedOrders);
      setLoading(false);
    }
    if (isLoaded && user) fetchOrders();
  }, [user, isLoaded]);

  if (!isLoaded || loading) return <div>Loading your orders...</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Status</th>
              <th>Chef</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Food Preference</th>
              <th>Mobile</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.status}</td>
                <td><a href={`/chefs/${o.chef?.id}`} className="text-primary underline">View Chef</a></td>
                <td>{o.service?.service_name}</td>
                <td>{o.order_date}</td>
                <td>{o.order_time}</td>
                <td>{o.duration}h</td>
                <td>{o.food_preference}</td>
                <td>{o.customer_mobile}</td>
                <td>₹{o.service?.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 