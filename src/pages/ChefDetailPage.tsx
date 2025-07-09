import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/ui/header';

interface Chef {
  id: string;
  bio: string;
  profile_image_url: string;
  location: string;
  experience_years: number;
}

interface Service {
  id: string;
  service_name: string;
  description: string;
  price: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer: { email: string };
}

export default function ChefDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [chef, setChef] = useState<Chef | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBookForm, setShowBookForm] = useState(false);
  const [orderName, setOrderName] = useState(user?.fullName || '');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [orderLocation, setOrderLocation] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch chef profile
      const { data: chefData } = await supabase
        .from('chefs')
        .select('*')
        .eq('id', id)
        .single();
      setChef(chefData || null);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('chef_id', id)
        .eq('is_active', true);
      setServices(servicesData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!chef) return <div>Chef not found</div>;

  async function handleBookConfirm() {
    if (!user || !bookingService || !bookingDate || !bookingTime || !chef || !duration || !foodPreference || !customerMobile) {
      setBookingError('Please fill all required fields.');
      return;
    }
    setBookingStatus('submitting');
    setBookingError(null);
    try {
      const order_date = bookingDate;
      const order_time = bookingTime;
      const { error } = await supabase.from('orders').insert([
        {
          user_id: user.id,
          chef_id: chef.id,
          service_id: bookingService.id,
          order_date,
          order_time,
          duration: Number(duration),
          food_preference: foodPreference,
          customer_mobile: customerMobile,
          status: 'pending',
        },
      ]);
      if (error) throw error;
      setBookingStatus('success');
      toast({ title: 'Booking successful!', description: 'Your order has been placed.' });
      setTimeout(() => {
        setBookingService(null);
        setBookingDate('');
        setBookingTime('');
        setDuration('');
        setFoodPreference('');
        setCustomerMobile('');
        setBookingStatus('idle');
      }, 2000);
    } catch (err: any) {
      setBookingStatus('error');
      setBookingError(err.message || 'Booking failed');
    }
  }

  return (
    <div className="container py-8">
      <Header />
      <div className="flex gap-6 items-center mt-20">
        <img src={chef.profile_image_url} alt="Chef" className="w-32 h-32 rounded-full" />
        <div>
          <h1 className="text-3xl font-bold">Chef</h1>
          <div className="flex gap-4 items-center">
            <span>Location: {chef.location}</span>
            <span>Experience: {chef.experience_years} years</span>
          </div>
          <p className="mt-2">{chef.bio}</p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition text-lg font-semibold"
          onClick={() => setShowBookForm(true)}
        >
          Book Now
        </button>
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Services</h2>
      <ul className="space-y-2">
        {services.map(s => (
          <li key={s.id} className="flex items-center gap-4">
            <span className="font-medium">{s.service_name}</span>
            <span>₹{s.price}</span>
            <button
              className="ml-auto px-4 py-2 bg-primary text-white rounded"
              onClick={() => setBookingService(s)}
              disabled={!user}
            >
              Book Now
            </button>
          </li>
        ))}
      </ul>
      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-2 border-primary">
            <h3 className="text-2xl font-bold mb-4 text-primary">Book {bookingService.service_name}</h3>
            <div className="mb-2 text-lg font-semibold">Price: <span className="text-green-700">₹{bookingService.price}</span></div>
            <div className="space-y-2">
              <label className="block font-medium">Date <span className="text-red-500">*</span></label>
              <input type="date" className="mb-2 w-full border rounded px-2 py-1" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
              <label className="block font-medium">Time <span className="text-red-500">*</span></label>
              <input type="time" className="mb-2 w-full border rounded px-2 py-1" value={bookingTime} onChange={e => setBookingTime(e.target.value)} required />
              <label className="block font-medium">Duration (hours) <span className="text-red-500">*</span></label>
              <input type="number" className="mb-2 w-full border rounded px-2 py-1" value={duration} onChange={e => setDuration(e.target.value)} required min={1} />
              <label className="block font-medium">Food Preference <span className="text-red-500">*</span></label>
              <input type="text" className="mb-2 w-full border rounded px-2 py-1" value={foodPreference} onChange={e => setFoodPreference(e.target.value)} required />
              <label className="block font-medium">Mobile Number <span className="text-red-500">*</span></label>
              <input type="text" className="mb-2 w-full border rounded px-2 py-1" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} required />
              <label className="block font-medium">Name</label>
              <input type="text" className="mb-2 w-full border rounded px-2 py-1 bg-gray-100" value={user?.fullName || ''} disabled />
              <label className="block font-medium">Email</label>
              <input type="email" className="mb-2 w-full border rounded px-2 py-1 bg-gray-100" value={user?.emailAddresses?.[0]?.emailAddress || ''} disabled />
            </div>
            {bookingError && <div className="text-red-600 mb-2 font-semibold">{bookingError}</div>}
            {bookingStatus === 'success' && <div className="text-green-600 mb-2 font-semibold">Booking successful!</div>}
            <div className="flex gap-2 mt-4">
              <button
                className={`px-4 py-2 bg-primary text-white rounded ${bookingStatus === 'submitting' ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleBookConfirm}
                disabled={bookingStatus === 'submitting'}
              >
                {bookingStatus === 'submitting' ? 'Booking...' : 'Confirm'}
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setBookingService(null);
                  setBookingStatus('idle');
                  setBookingError(null);
                }}
                disabled={bookingStatus === 'submitting'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Booking Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border-2 border-primary">
            <h3 className="text-2xl font-bold mb-4 text-primary">Book Chef</h3>
            <div className="space-y-2">
              <label className="block font-medium text-white">Name <span className="text-red-500">*</span></label>
              <input type="text" className="mb-2 w-full border-none rounded px-2 py-1 bg-black text-white" value={orderName} onChange={e => setOrderName(e.target.value)} required />
              <label className="block font-medium text-white">Phone Number <span className="text-red-500">*</span></label>
              <input type="text" className="mb-2 w-full border-none rounded px-2 py-1 bg-black text-white" value={orderPhone} onChange={e => setOrderPhone(e.target.value)} required />
              <label className="block font-medium text-white">Date <span className="text-red-500">*</span></label>
              <input type="date" className="mb-2 w-full border-none rounded px-2 py-1 bg-black text-white" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
              <label className="block font-medium text-white">Time <span className="text-red-500">*</span></label>
              <input type="time" className="mb-2 w-full border-none rounded px-2 py-1 bg-black text-white" value={orderTime} onChange={e => setOrderTime(e.target.value)} required />
              <label className="block font-medium text-white">Order Location <span className="text-red-500">*</span></label>
              <input type="text" className="mb-2 w-full border-none rounded px-2 py-1 bg-black text-white" value={orderLocation} onChange={e => setOrderLocation(e.target.value)} required />
            </div>
            {orderError && <div className="text-red-600 mb-2 font-semibold">{orderError}</div>}
            {orderStatus === 'success' && <div className="text-green-600 mb-2 font-semibold">Order successful!</div>}
            <div className="flex gap-2 mt-4">
              <button
                className={`px-4 py-2 bg-primary text-white rounded ${orderStatus === 'submitting' ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={async () => {
                  if (!orderName || !orderPhone || !orderDate || !orderTime || !orderLocation) {
                    setOrderError('Please fill all required fields.');
                    return;
                  }
                  setOrderStatus('submitting');
                  setOrderError(null);
                  try {
                    const { error } = await supabase.from('orders').insert([
                      {
                        user_id: user?.id,
                        chef_id: chef.id,
                        order_date: orderDate,
                        order_time: orderTime,
                        customer_mobile: orderPhone,
                        food_preference: '',
                        duration: 1,
                        status: 'pending',
                        order_location: orderLocation,
                      },
                    ]);
                    if (error) throw error;
                    setOrderStatus('success');
                    setTimeout(() => {
                      setShowBookForm(false);
                      setOrderStatus('idle');
                      setOrderName(user?.fullName || '');
                      setOrderPhone('');
                      setOrderDate('');
                      setOrderTime('');
                      setOrderLocation('');
                    }, 2000);
                  } catch (err: any) {
                    setOrderStatus('error');
                    setOrderError(err.message || 'Order failed');
                  }
                }}
                disabled={orderStatus === 'submitting'}
              >
                {orderStatus === 'submitting' ? 'Booking...' : 'Submit'}
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setShowBookForm(false);
                  setOrderStatus('idle');
                  setOrderError(null);
                }}
                disabled={orderStatus === 'submitting'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 