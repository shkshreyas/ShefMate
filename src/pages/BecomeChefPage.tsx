import { useUser, useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import icon from '../assets/icon.png';
import imageCompression from 'browser-image-compression';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { registerChef, addService, uploadImage } from '@/lib/firebase-utils';

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
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = '/sign-in';
    }
  }, [user, isLoaded]);

  // Check if user is already a chef and redirect to dashboard if so
  useEffect(() => {
    async function checkIfChefExists() {
      if (isLoaded && user) {
        // Check if chef document exists with this userId
        const chefsQuery = query(
          collection(db, "chefs"), 
          where("userId", "==", user.id)
        );
        
        const querySnapshot = await getDocs(chefsQuery);
        if (!querySnapshot.empty) {
          setAlreadyChef(true);
          setTimeout(() => {
            navigate('/chef-dashboard', { replace: true });
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

  // Upload image directly to external service instead of Firebase Storage
  async function uploadProfileImage(file: File): Promise<string> {
    try {
      // Compress image first
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });
      
      // Use the utility function to upload to external service
      const imageUrl = await uploadImage(compressedFile, ''); // Path parameter is ignored now
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userId = user?.id ?? '';
    const userName = user?.fullName ?? user?.username ?? user?.emailAddresses?.[0]?.emailAddress ?? '';
    const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';
    
    // Debug information
    console.log('Form submission data:', {
      userId,
      userName,
      userEmail,
      bio,
      location,
      experience,
      phoneNumber,
      hasProfileImage: !!profileImage,
      profileImageSize: profileImage ? Math.round(profileImage.size / 1024) + ' KB' : 'N/A'
    });
    
    // Upload profile image if exists
    let imageUrl = null;
    if (profileImage) {
      try {
        setImageUploading(true);
        setUploadProgress(10);
        
        // Upload the image using our new function
        imageUrl = await uploadProfileImage(profileImage);
        
        setUploadProgress(100);
        setImageUploading(false);
      } catch (err) {
        console.error('Image upload error:', err);
        setError('Image upload failed. Please try again later.');
        setLoading(false);
        setImageUploading(false);
        return;
      }
    }

    // Register the chef in Firebase using the utility function
    try {
      const chefData = {
        userId,
        displayName: userName,
        email: userEmail,
        phoneNumber,
        bio,
        location,
        experienceYears: Number(experience),
        profileImage: imageUrl,
      };
      
      const result = await registerChef(chefData);
      
      if (result.success) {
        setChefId(result.id);
        setShowServiceForm(true);
        setStep(1);
      } else {
        throw new Error('Chef registration failed');
      }
    } catch (err) {
      console.error('Error registering chef:', err);
      setError('Failed to register as chef. Please try again later.');
    }
    
    setLoading(false);
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!chefId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const serviceData = {
        chefId,
        serviceName,
        description: serviceDescription,
        price: Number(servicePrice),
      };
      
      const result = await addService(serviceData);
      
      if (result.success) {
        setAddedServices(prev => [...prev, { 
          id: result.id, 
          serviceName, 
          description: serviceDescription, 
          price: Number(servicePrice) 
        }]);
        
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
      } else {
        throw new Error('Failed to add service');
      }
    } catch (err) {
      console.error('Error adding service:', err);
      setError('Failed to add service. Please try again.');
    }
    
    setLoading(false);
  }

  function handleRemoveService(id: string) {
    setAddedServices(prev => prev.filter(s => s.id !== id));
    // We'll handle actual deletion in a separate function in production
  }

  function handleFinish() {
    if (addedServices.length === 0) {
      setError('Please add at least one service before continuing');
      return;
    }
    
    setError(null);
    setShowSummary(true);
    setStep(2);
  }

  function handleGoToDashboard() {
    navigate('/chef-dashboard', { replace: true });
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
              <div className="font-semibold">{s.serviceName}</div>
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
            <label className="block mb-1 font-medium text-gray-700">Service Name</label>
            <input 
              className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
              value={serviceName} 
              onChange={e => setServiceName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Description</label>
            <textarea 
              className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
              value={serviceDescription} 
              onChange={e => setServiceDescription(e.target.value)} 
              required 
              rows={4}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Price (₹)</label>
            <input 
              type="number" 
              className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
              value={servicePrice} 
              onChange={e => setServicePrice(e.target.value)} 
              required 
            />
          </div>
          {error && <div className="text-red-600 font-medium">{error}</div>}
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition" 
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition" 
              onClick={handleFinish}
            >
              Finish
            </button>
          </div>
        </form>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Added Services</h2>
          <ul className="bg-white rounded-lg shadow p-4">
            {addedServices.length === 0 && (
              <li className="text-gray-500 italic">No services added yet. Add at least one service to continue.</li>
            )}
            {addedServices.map(s => (
              <li key={s.id} className="mb-2 pb-2 border-b flex items-center justify-between">
                <div>
                  <span className="font-medium">{s.serviceName}</span> - ₹{s.price}
                  <p className="text-sm text-gray-600">{s.description}</p>
                </div>
                <button 
                  className="ml-2 text-red-500 hover:text-red-700 hover:underline text-sm" 
                  onClick={() => handleRemoveService(s.id)}
                >
                  Remove
                </button>
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
          <label className="block mb-1 font-medium text-gray-700">Full Name</label>
          <input 
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800" 
            value={user.fullName || ''} 
            disabled 
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Bio</label>
          <textarea 
            className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            required 
            rows={4}
            placeholder="Tell us about yourself and your cooking style..."
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Location</label>
          <input 
            className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            required 
            placeholder="City, State"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Experience (years)</label>
          <input 
            type="number" 
            className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
            value={experience} 
            onChange={e => setExperience(e.target.value)} 
            required 
            min="0"
            placeholder="Years of cooking experience"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
          <input 
            className="w-full border rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary" 
            value={phoneNumber} 
            onChange={e => setPhoneNumber(e.target.value)} 
            required 
            placeholder="Contact number"
            type="tel"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Profile Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setProfileImage(e.target.files?.[0] || null)} 
            className="w-full border rounded px-3 py-2 bg-white text-gray-800"
          />
          {imageUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading image... {uploadProgress}%</p>
            </div>
          )}
          {profileImageUrl && (
            <div className="mt-2 flex justify-center">
              <img src={profileImageUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-primary shadow" />
            </div>
          )}
        </div>
        {error && <div className="text-red-600 font-medium">{error}</div>}
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary text-white rounded w-full shadow-lg hover:bg-primary/90 transition" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register as Chef'}
        </button>
      </form>
    </div>
  );
} 