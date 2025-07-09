import { useUser, useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import icon from '/public/assets/icon.png';
import imageCompression from 'browser-image-compression';
import { uploadImageToFreeImageHost } from '@/lib/uploadImage';

const QUOTES = [
  'Earn part-time with your passion!',
  'Grow your cooking business with ShefMate!',
  'Turn your kitchen into a business!',
  'Flexible hours, real income.',
  'Share your recipes, earn more!',
  'Be your own boss with ShefMate!',
  'Delight customers, build your brand!',
];

const STEPS = ['Profile', 'Services', 'Summary'];

export default function BecomeChefPage() {
  const { user, isLoaded } = useUser();
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [chefId, setChefId] = useState<string | null>(null);
  const [addedServices, setAddedServices] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const [step, setStep] = useState(0); // 0: Profile, 1: Services, 2: Summary
  const quoteTimeout = useRef<NodeJS.Timeout | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alreadyChef, setAlreadyChef] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = '/sign-in';
    }
  }, [user, isLoaded]);

  // Check if user is already a chef and redirect to dashboard if so
  useEffect(() => {
    async function checkIfChefExists() {
      if (isLoaded && user) {
        const { data, error } = await supabase
          .from('chefs')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (data && data.id) {
          setAlreadyChef(true);
          setTimeout(() => {
            navigate('/dashboard/chef', { replace: true });
          }, 1500);
        }
      }
    }
    checkIfChefExists();
  }, [isLoaded, user, navigate]);

  // Rotating quote with fade animation
  useEffect(() => {
    quoteTimeout.current = setTimeout(() => setQuoteFade(false), 2700);
    const interval = setInterval(() => {
      setQuoteFade(true);
      setTimeout(() => {
        setQuoteIdx((idx) => (idx + 1) % QUOTES.length);
        setQuoteFade(false);
      }, 400);
    }, 3500);
    return () => {
      if (quoteTimeout.current) clearTimeout(quoteTimeout.current);
      clearInterval(interval);
    };
  }, []);

  // Image preview
  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setProfileImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfileImageUrl(null);
    }
  }, [profileImage]);

  if (!isLoaded) return null;
  if (!user) return null;

  if (alreadyChef) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-primary mb-4">You are already a chef!</div>
        <div className="text-lg text-gray-600">Redirecting to your dashboard...</div>
      </div>
    );
  }

  function Stepper() {
    return (
      <div className="flex justify-center gap-2 mb-4">
        {STEPS.map((label, idx) => (
          <div key={label} className={`flex items-center gap-1 ${idx === step ? 'font-bold text-primary' : 'text-gray-400'}`}> 
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${idx === step ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'}`}>{idx + 1}</div>
            <span className="text-sm">{label}</span>
            {idx < STEPS.length - 1 && <span className="w-6 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>
    );
  }

  function LogoHeader() {
    return (
      <div className="flex flex-col items-center mb-6">
        <img src={icon} alt="ShefMate Logo" className="h-16 mb-2 animate-fade-in-up" />
        <h1 className="text-3xl font-extrabold text-primary mb-1">Become a Chef</h1>
        <div className={`text-lg text-center text-primary font-semibold min-h-[28px] transition-opacity duration-400 ${quoteFade ? 'opacity-100' : 'opacity-0'}`}
        >
          {QUOTES[quoteIdx]}
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Upsert user into users table
    const userId = user?.id ?? '';
    const userName = user?.fullName ?? user?.username ?? user?.emailAddresses?.[0]?.emailAddress ?? '';
    const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';
    
    try {
      // Use supabaseAdmin to bypass RLS
      const { error: userUpsertError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          full_name: userName,
          email: userEmail,
          updated_at: new Date().toISOString()
        });
      
      if (userUpsertError) {
        console.error('Failed to create user:', userUpsertError);
        setError('Failed to create user: ' + userUpsertError.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error upserting user:', err);
      setError('Failed to create user: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
      return;
    }

    // 2. Compress and upload profile image to Supabase Storage
    let imageUrl = null;
    if (profileImage) {
      try {
        const compressedFile = await imageCompression(profileImage, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        imageUrl = await uploadImageToFreeImageHost(compressedFile);
      } catch (err) {
        setError('Image upload failed. Please try again later.');
        setLoading(false);
        return;
      }
    }

    // 3. Insert chef into chefs table
    const chefName = user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || '';
    const chefEmail = user?.emailAddresses?.[0]?.emailAddress || '';
    const { data: chefData, error: chefError } = await supabase
      .from('chefs')
      .insert([{
        id: userId, // Set chef id to Clerk user ID
        user_id: userId,
        name: chefName,
        email: chefEmail,
        phone_number: phoneNumber,
        bio,
        location,
        experience_years: Number(experience),
        profile_image_url: imageUrl,
      }])
      .select('id')
      .single();

    if (chefError) {
      setError(chefError.message);
      setLoading(false);
      return;
    }

    setChefId(chefData.id);
    setShowServiceForm(true);
    setStep(1);
    setLoading(false);
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!chefId) return;
    setLoading(true);
    setError(null);
    const { data, error: serviceError } = await supabase
      .from('services')
      .insert([{
        chef_id: chefId,
        service_name: serviceName,
        description: serviceDescription,
        price: Number(servicePrice),
        is_active: true,
      }])
      .select('id, service_name, description, price')
      .single();
    if (serviceError) {
      setError(serviceError.message);
      setLoading(false);
      return;
    }
    setAddedServices(prev => [...prev, data]);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setLoading(false);
  }

  function handleRemoveService(id: string) {
    setAddedServices(prev => prev.filter(s => s.id !== id));
    // Optionally, also remove from DB
    supabase.from('services').delete().eq('id', id);
  }

  function handleFinish() {
    setShowSummary(true);
    setStep(2);
  }

  function handleGoToDashboard() {
    navigate('/dashboard/chef');
  }

  if (showSummary) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <LogoHeader />
        <Stepper />
        <h2 className="text-2xl font-bold mb-4">Your Services</h2>
        <ul className="mb-4">
          {addedServices.map(s => (
            <li key={s.id} className="mb-2 border-b pb-2">
              <div className="font-semibold">{s.service_name}</div>
              <div className="text-sm text-gray-600">{s.description}</div>
              <div className="text-sm">Price: ₹{s.price}</div>
            </li>
          ))}
        </ul>
        <button className="px-4 py-2 bg-primary text-white rounded w-full mt-4 shadow-lg hover:bg-primary/90 transition" onClick={handleGoToDashboard}>
          Finish & Go to Dashboard
        </button>
      </div>
    );
  }

  if (showServiceForm) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <LogoHeader />
        <Stepper />
        <h2 className="text-2xl font-bold mb-4">Add Your Services</h2>
        <form onSubmit={handleAddService} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
          <div>
            <label className="block mb-1 font-medium">Service Name</label>
            <input className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price (₹)</label>
            <input type="number" className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={servicePrice} onChange={e => setServicePrice(e.target.value)} required />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition" disabled={loading}>
              {loading ? 'Adding...' : 'Add Service'}
            </button>
            <button type="button" className="px-4 py-2 bg-gray-300 rounded shadow" onClick={handleFinish}>
              Finish
            </button>
          </div>
        </form>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Added Services</h2>
          <ul>
            {addedServices.map(s => (
              <li key={s.id} className="mb-1 flex items-center justify-between">
                <span><span className="font-medium">{s.service_name}</span> - ₹{s.price}</span>
                <button className="ml-2 text-red-500 hover:underline text-xs" onClick={() => handleRemoveService(s.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-8">
      <LogoHeader />
      <Stepper />
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={user.fullName || ''} disabled />
        </div>
        <div>
          <label className="block mb-1 font-medium">Bio</label>
          <textarea className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={bio} onChange={e => setBio(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Experience (years)</label>
          <input type="number" className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={experience} onChange={e => setExperience(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input className="w-full border rounded px-2 py-1 text-white bg-gray-800" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Profile Image</label>
          <input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files?.[0] || null)} />
          {profileImageUrl && (
            <div className="mt-2 flex justify-center">
              <img src={profileImageUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-primary shadow" />
            </div>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded w-full shadow-lg hover:bg-primary/90 transition" disabled={loading}>
          {loading ? 'Registering...' : 'Register as Chef'}
        </button>
      </form>
    </div>
  );
} 