import { useUser, useSignIn } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
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
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [customImageUploaded, setCustomImageUploaded] = useState(false);
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
      clerk.openSignIn();
    }
  }, [user, isLoaded, clerk]);

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

  // Set default profile image from Clerk user and update when it changes
  useEffect(() => {
    if (user && !customImageUploaded) {
      // Use Clerk profile image as default
      const clerkImageUrl = user.imageUrl;
      if (clerkImageUrl) {
        setProfileImageUrl(clerkImageUrl);
      }
    }
  }, [user?.imageUrl, customImageUploaded]);

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

  // Image preview for uploaded files
  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setProfileImageUrl(url);
      setCustomImageUploaded(true);
      return () => URL.revokeObjectURL(url);
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
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {STEPS.map((label, idx) => (
          <div key={label} className={`flex items-center gap-1 ${idx === step ? 'font-bold text-primary' : 'text-gray-400'}`}> 
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${idx === step ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'}`}>{idx + 1}</div>
            <span className="text-sm">{label}</span>
            {idx < STEPS.length - 1 && <span className="hidden sm:block w-6 h-0.5 bg-gray-200 mx-1" />}
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
      console.log('Beginning image compression and upload process...');
      console.log('Original file:', file.name, 'Type:', file.type, 'Size:', Math.round(file.size / 1024), 'KB');
      
      let compressedFile = file;
      
      // Only compress if it's a large image (over 500KB)
      if (file.size > 500 * 1024) {
        try {
          // Compress image with more conservative settings
          compressedFile = await imageCompression(file, {
            maxSizeMB: 0.5, // Reduce max size to ensure smaller file
            maxWidthOrHeight: 800,
            useWebWorker: true,
            initialQuality: 0.7, // Slightly reduce quality to ensure size reduction
          });
          
          console.log('Compression successful:', 
            'Original:', Math.round(file.size / 1024), 'KB', 
            'Compressed:', Math.round(compressedFile.size / 1024), 'KB');
        } catch (compressionError) {
          console.error('Image compression failed:', compressionError);
          console.log('Proceeding with original file');
          compressedFile = file; // Fall back to original file if compression fails
        }
      } else {
        console.log('Image is already small enough, skipping compression');
      }
      
      // Convert to different format if needed (sometimes helps with upload issues)
      if (file.type === 'image/png' && file.size > 1000 * 1024) {
        try {
          console.log('Attempting to convert PNG to JPEG to reduce size');
          compressedFile = await convertToJpeg(compressedFile);
          console.log('Conversion successful, new size:', Math.round(compressedFile.size / 1024), 'KB');
        } catch (conversionError) {
          console.error('Format conversion failed:', conversionError);
          // Continue with the original compressed file
        }
      }
      
      // If still too large after compression, show error
      if (compressedFile.size > 2000 * 1024) {
        throw new Error('Image is too large. Please select a smaller image (under 2MB).');
      }
      
      // Use the utility function to upload to external service
      console.log('Starting upload of prepared file:', compressedFile.size / 1024, 'KB');
      const imageUrl = await uploadImage(compressedFile, ''); // Path parameter is ignored now
      console.log('Upload completed successfully, URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      throw error;
    }
  }
  
  // Helper function to convert image to JPEG format
  async function convertToJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            // Draw image on canvas with white background (for transparent PNGs)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG data URL
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              // Create a new file with JPEG mime type
              const newFile = new File([blob], file.name.replace(/\.(png|gif|jpeg|jpg)$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              
              resolve(newFile);
            }, 'image/jpeg', 0.85);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
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
      hasClerkImage: !!user?.imageUrl,
      customImageUploaded,
      profileImageSize: profileImage ? Math.round(profileImage.size / 1024) + ' KB' : 'N/A'
    });
    
    // Handle profile image - use uploaded image or Clerk profile image
    let imageUrl = null;
    if (profileImage) {
      // User uploaded a custom image
      try {
        setImageUploading(true);
        setUploadProgress(10);
        
        // Upload the image using our new function
        imageUrl = await uploadProfileImage(profileImage);
        
        setUploadProgress(100);
        setImageUploading(false);
      } catch (err: any) {
        console.error('Image upload error:', err);
        
        // More descriptive error message
        if (err.message && err.message.includes('too large')) {
          setError(err.message);
        } else if (err.message && err.message.includes('format')) {
          setError('Image format not supported. Please try a JPEG or PNG image.');
        } else {
          setError('Image upload failed. Please try again with a smaller image (under 1MB).');
        }
        
        setLoading(false);
        setImageUploading(false);
        return;
      }
    } else if (user?.imageUrl && !customImageUploaded) {
      // Use Clerk profile image
      imageUrl = user.imageUrl;
      console.log('Using Clerk profile image:', imageUrl);
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
      <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-6 md:py-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <LogoHeader />
          <Stepper />
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Registration Complete</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-3">Your Services</h3>
              <div className="space-y-3">
                {addedServices.map((service) => (
                  <div key={service.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                      <p className="font-bold text-gray-900">₹{service.price}</p>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition-colors" 
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showServiceForm) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-6 md:py-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <LogoHeader />
          <Stepper />
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Add Your Services</h2>
              <p className="text-gray-600">Add the services you offer to clients</p>
              
              <form onSubmit={handleAddService} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g. Private Dinner, Cooking Class"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="serviceDescription"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                    rows={3}
                    placeholder="Describe your service"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="servicePrice"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                    placeholder="Price"
                    min="0"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Service'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={handleFinish}
                    disabled={addedServices.length === 0}
                  >
                    {addedServices.length === 0 ? 'Add at least one service' : 'Continue to Summary'}
                  </button>
                </div>
                
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </form>
              
              {addedServices.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Your Added Services</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {addedServices.map((service) => (
                      <div key={service.id} className="bg-gray-50 p-4 rounded-lg relative">
                        <button
                          onClick={() => handleRemoveService(service.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          aria-label="Remove service"
                        >
                          ×
                        </button>
                        <h4 className="font-semibold text-primary">{service.serviceName}</h4>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <p className="font-bold">₹{service.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-6 md:py-12 pb-20">
      <div className="max-w-3xl mx-auto">
        <LogoHeader />
        <Stepper />
        
        {alreadyChef ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="text-2xl font-bold text-primary mb-4">You are already a chef!</div>
            <div className="text-lg text-gray-600">Redirecting to your dashboard...</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in">
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Chef Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                      <div 
                        className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3 border-2 border-primary relative"
                        style={{
                          backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {!profileImageUrl && !user?.imageUrl && <span className="text-gray-400">Photo</span>}
                        {!profileImageUrl && user?.imageUrl && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        )}
                        {imageUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-white text-sm font-semibold">{uploadProgress}%</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 items-center">
                        <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setProfileImage(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="profileImage"
                          className="text-sm text-primary font-medium cursor-pointer hover:underline"
                        >
                          {customImageUploaded ? 'Change Photo' : 'Upload Custom Photo'}
                        </label>
                        
                        {user?.imageUrl && customImageUploaded && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImage(null);
                              setCustomImageUploaded(false);
                              setProfileImageUrl(user.imageUrl);
                            }}
                            className="text-sm text-gray-600 hover:text-primary cursor-pointer"
                          >
                            Use Clerk Profile Photo
                          </button>
                        )}
                        
                        {user?.imageUrl && !customImageUploaded && (
                          <div className="text-xs text-gray-500 text-center">
                            Using your Clerk profile photo
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                          placeholder="City, State"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          id="experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                          placeholder="Years"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                        rows={4}
                        placeholder="Tell us about yourself, your cooking style, and specialties"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition-colors w-full sm:w-auto"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Continue to Services'}
                    </button>
                  </div>
                  
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </form>
              </div>
            )}
            
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Your Services</h2>
                <p className="text-gray-600">Add the services you offer to clients</p>
                
                {addedServices.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold">Your Added Services</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {addedServices.map((service) => (
                        <div key={service.id} className="bg-gray-50 p-4 rounded-lg relative">
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            aria-label="Remove service"
                          >
                            ×
                          </button>
                          <h4 className="font-semibold text-primary">{service.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                          <p className="font-bold">₹{service.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {showServiceForm ? (
                  <form onSubmit={handleAddService} className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                        placeholder="e.g. Private Dinner, Cooking Class"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="serviceDescription"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                        rows={3}
                        placeholder="Describe your service"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        id="servicePrice"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
                        placeholder="Price"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setShowServiceForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Add Service
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowServiceForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary flex items-center justify-center"
                  >
                    <span className="mr-2">+</span> Add a Service
                  </button>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition-colors"
                    disabled={addedServices.length === 0}
                  >
                    Continue to Summary
                  </button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Summary</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Profile</h3>
                    <div className="flex items-center gap-4 mb-4">
                      {profileImageUrl && (
                        <img src={profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{user?.fullName}</p>
                        <p className="text-gray-600 text-sm">{location}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="text-gray-900">{experience} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{phoneNumber}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-sm text-gray-900">{bio}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Services ({addedServices.length})</h3>
                    <div className="space-y-3">
                      {addedServices.map((service) => (
                        <div key={service.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="font-bold text-gray-900">₹{service.price}</p>
                          </div>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition-colors"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            )}
            
            {showSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Complete!</h3>
                    <p className="text-gray-600 mb-6">You are now registered as a chef on ShefMate. Start receiving orders and grow your culinary business!</p>
                    <button
                      onClick={handleGoToDashboard}
                      className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 