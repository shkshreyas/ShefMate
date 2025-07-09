import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ChefWithDetails, ChefLocation, ChefService } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock, Star, Award, ChefHat, Users } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  getRandomChefProfile, 
  getRandomCuisine, 
  getRandomChefQuote, 
  getRandomSpecialties,
  getRandomRating,
  getRandomServingCapacity,
  getRandomPriceRange
} from '@/lib/api-utils';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

type SortOption = 'experience_asc' | 'experience_desc' | 'price_asc' | 'price_desc';

interface ChefWithRelations extends ChefWithDetails {
  locations: ChefLocation[];
  services: ChefService[];
}

interface EnhancedChef extends ChefWithRelations {
  image?: string;
  quote?: string;
  specialties?: string[];
  rating?: string;
  reviews?: number;
  servingCapacity?: number;
  profile_image?: string; // Add this line
}

export function ChefListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chefs, setChefs] = useState<EnhancedChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 30]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState<string>('');

  // Get user location from profile or prompt
  useEffect(() => {
    if (user && user.publicMetadata && user.publicMetadata.location) {
      setUserLocation(user.publicMetadata.location as string);
    }
  }, [user, userLocation]);

  const location = searchParams.get('location') || 'all';
  const service = searchParams.get('service') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') as SortOption || 'experience_desc';

  useEffect(() => {
    console.log('Fetching chefs and filters...');
    fetchChefs();
    fetchFilters();
  }, [location, service, search, sort, priceRange, experienceRange, userLocation]);

  const fetchChefs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all chefs
      const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select('*');
      if (chefsError) throw chefsError;

      // Fetch all services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');
      if (servicesError) throw servicesError;

      // Combine chefs with their services and compute price range
      const chefsWithDetails = chefsData.map(chef => {
        const chefServices = servicesData.filter(srv => srv.chef_id === chef.id);
        const prices = chefServices.map(srv => Number(srv.price));
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        return {
          ...chef,
          services: chefServices,
          minPrice,
          maxPrice,
        };
      });

      setChefs(chefsWithDetails);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chefs');
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      console.log('Fetching filters...');
      const { data: locationData, error: locationError } = await supabase
        .from('chef_locations')
        .select('location');

      if (locationError) {
        console.error('Error fetching locations for filters:', locationError);
        throw locationError;
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from('chef_services')
        .select('service_name');

      if (serviceError) {
        console.error('Error fetching services for filters:', serviceError);
        throw serviceError;
      }

      const uniqueLocations = [...new Set(locationData?.map((l: { location: string }) => l.location) || [])];
      const uniqueServices = [...new Set(serviceData?.map((s: { service_name: string }) => s.service_name) || [])];

      console.log('Unique locations:', uniqueLocations);
      console.log('Unique services:', uniqueServices);

      setLocations(uniqueLocations);
      setServices(uniqueServices);
    } catch (error: any) {
      console.error('Error in fetchFilters:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch filters. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Add function to format price in rupees
  const formatPrice = (price: string) => {
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
    return `₹${numericPrice.toLocaleString('en-IN')}`;
  };

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 text-destructive">
            <h2 className="text-2xl font-bold mb-4">Error Loading Chefs</h2>
            <p>{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                fetchChefs();
              }}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">Find Chefs in {userLocation || 'Your Location'}</h1>

        {/* Free Trial Registration Button */}
        <div className="mb-8">
          <Button 
            asChild
            className="w-full md:w-auto"
            variant="default"
          >
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSfqfKq1QZPHX-icaNLKGQl2PS2JVSrdgAhMV-aLZF-mMSUVgQ/viewform" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              👉 ShefMate Book Chef
            </a>
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name or bio..."
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select value={location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={service} onValueChange={(value) => handleFilterChange('service', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((srv) => (
                  <SelectItem key={srv} value={srv}>{srv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experience_desc">Experience (High to Low)</SelectItem>
                <SelectItem value="experience_asc">Experience (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range (per service)</label>
              <Slider
                value={priceRange}
                onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Range (years)</label>
              <Slider
                value={experienceRange}
                onValueChange={(value: number[]) => setExperienceRange([value[0], value[1]])}
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{experienceRange[0]} years</span>
                <span>{experienceRange[1]} years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chef Cards */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : chefs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No chefs found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chefs.map((chef) => (
              <div
                key={chef.id}
                className="cursor-pointer"
                onClick={() => navigate(`/chefs/${chef.id}`)}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col h-full">
                  <div className="flex items-center gap-4 p-4 border-b">
                    <img
                      src={chef.profile_image_url || chef.image || '/default-chef.png'}
                      alt={chef.name}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <div className="text-xl font-bold">{chef.name}</div>
                      <div className="text-sm text-gray-500">{chef.location}</div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="mb-2">
                      <span className="font-semibold">Price Range: </span>
                      {chef.services && chef.services.length > 0
                        ? `${formatPrice(chef.minPrice.toString())} - ${formatPrice(chef.maxPrice.toString())}`
                        : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500 font-bold">★ {chef.rating}</span>
                      <span className="text-sm text-gray-400">({chef.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 