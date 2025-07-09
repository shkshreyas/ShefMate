import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import { uploadImageToFreeImageHost } from '@/lib/uploadImage';

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
  user: { email: string };
  price: number;
}

interface Stats {
  total_orders: number;
  total_income: number;
  avg_rating: number;
  customers_served: number;
}

function ChefDashboardPageInner({ chefId }: { chefId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      // Fetch chef profile
      const { data: chefData } = await supabase
        .from('chefs')
        .select('*')
        .eq('id', chefId)
        .single();
      setProfile(chefData);
      setBio(chefData?.bio || '');
      setLocation(chefData?.location || '');
      setExperience(chefData?.experience_years?.toString() || '');
      setProfileImageUrl(chefData?.profile_image_url || null);
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status, order_date, order_time, duration, food_preference, customer_mobile, created_at, service:service_id(service_name, price), user:user_id(email)')
        .eq('chef_id', chefId)
        .order('created_at', { ascending: false });
      const fixedOrders = (ordersData || []).map((o: any) => ({
        ...o,
        service: Array.isArray(o.service) ? o.service[0] : o.service,
        user: Array.isArray(o.user) ? o.user[0] : o.user,
      }));
      setOrders(fixedOrders);
      setLoading(false);
    }
    fetchDashboard();
  }, [chefId]);

  if (loading) return <div>Loading...</div>;

  async function handleProfileSave() {
    setProfileMsg(null);
    let imageUrl = profileImageUrl;
    if (profileImage) {
      try {
        const compressedFile = await imageCompression(profileImage, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        imageUrl = await uploadImageToFreeImageHost(compressedFile);
      } catch (err) {
        setProfileMsg('Image upload failed.');
        return;
      }
    }
    const { error } = await supabase
      .from('chefs')
      .update({
        bio,
        location,
        experience_years: Number(experience),
        profile_image_url: imageUrl,
      })
      .eq('id', chefId);
    if (error) {
      setProfileMsg('Failed to update profile.');
    } else {
      setProfileMsg('Profile updated successfully!');
      setEditMode(false);
      setProfileImage(null);
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-6 text-primary">Chef Dashboard</h1>
      {/* Profile Edit Section */}
      <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Profile</h2>
        {editMode ? (
          <div className="space-y-4">
            <label className="block text-white font-semibold">Bio</label>
            <textarea className="w-full border-none rounded px-3 py-2 bg-black text-white focus:ring-2 focus:ring-primary" value={bio} onChange={e => setBio(e.target.value)} />
            <label className="block text-white font-semibold">Location</label>
            <input className="w-full border-none rounded px-3 py-2 bg-black text-white focus:ring-2 focus:ring-primary" value={location} onChange={e => setLocation(e.target.value)} />
            <label className="block text-white font-semibold">Experience (years)</label>
            <input type="number" className="w-full border-none rounded px-3 py-2 bg-black text-white focus:ring-2 focus:ring-primary" value={experience} onChange={e => setExperience(e.target.value)} />
            <label className="block text-white font-semibold">Profile Image</label>
            <input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files?.[0] || null)} className="text-white" />
            {profileImageUrl && (
              <img src={profileImageUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-primary mt-2 mx-auto" />
            )}
            <div className="flex gap-4 mt-4">
              <button className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition" onClick={handleProfileSave}>Save</button>
              <button className="px-6 py-2 bg-gray-700 text-white rounded shadow" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
            {profileMsg && <div className="mt-2 text-green-400 font-semibold">{profileMsg}</div>}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {profileImageUrl && <img src={profileImageUrl} alt="Chef" className="h-24 w-24 rounded-full object-cover border-2 border-primary" />}
            <div className="text-white">
              <div className="mb-1"><b>Bio:</b> {bio}</div>
              <div className="mb-1"><b>Location:</b> {location}</div>
              <div className="mb-1"><b>Experience:</b> {experience} years</div>
              <button className="mt-2 px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition" onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          </div>
        )}
      </div>
      {/* Orders Table (modern look) */}
      <div className="bg-white/5 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-primary">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Customer</th>
                <th className="px-4 py-2 font-semibold">Service</th>
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">Duration</th>
                <th className="px-4 py-2 font-semibold">Food Preference</th>
                <th className="px-4 py-2 font-semibold">Mobile</th>
                <th className="px-4 py-2 font-semibold">Price</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="px-4 py-2">{o.status}</td>
                  <td className="px-4 py-2">{o.user?.email}</td>
                  <td className="px-4 py-2">{o.service?.service_name}</td>
                  <td className="px-4 py-2">{o.order_date}</td>
                  <td className="px-4 py-2">{o.order_time}</td>
                  <td className="px-4 py-2">{o.duration}h</td>
                  <td className="px-4 py-2">{o.food_preference}</td>
                  <td className="px-4 py-2">{o.customer_mobile}</td>
                  <td className="px-4 py-2">₹{o.service?.price}</td>
                  <td className="px-4 py-2">
                    {o.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={() => updateOrder(o.id, 'completed')}>Complete</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition" onClick={() => updateOrder(o.id, 'cancelled')}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  async function updateOrder(orderId: string, status: string) {
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status } : o));
  }
}

export default function ChefDashboardPage() {
  const { user, isLoaded } = useUser();
  const [chefId, setChefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChefId() {
      if (user) {
        const { data, error } = await supabase
          .from('chefs')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (error || !data) {
          setError('No chef profile found for this user.');
          setLoading(false);
        } else {
          setChefId(data.id);
          setLoading(false);
        }
      } else if (isLoaded) {
        setError('Please log in as a chef.');
        setLoading(false);
      }
    }
    fetchChefId();
  }, [user, isLoaded]);

  if (!isLoaded || loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;
  if (!chefId) return <div>No chef profile found.</div>;
  return <ChefDashboardPageInner chefId={chefId} />;
} 