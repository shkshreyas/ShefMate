import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ChefWithDetails, ChefLocation, ChefService } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'experience_asc' | 'experience_desc' | 'price_asc' | 'price_desc';

interface ChefWithRelations extends ChefWithDetails {
  locations: ChefLocation[];
  services: ChefService[];
}

export function ChefListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chefs, setChefs] = useState<ChefWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 30]);
  const { toast } = useToast();

  const location = searchParams.get('location') || 'all';
  const service = searchParams.get('service') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') as SortOption || 'experience_desc';

  useEffect(() => {
    console.log('Fetching chefs and filters...');
    fetchChefs();
    fetchFilters();
  }, [location, service, search, sort, priceRange, experienceRange]);

  const fetchChefs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching chefs data...');
      // First, get all chefs with their basic information
      const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select('*');

      if (chefsError) {
        console.error('Error fetching chefs:', chefsError);
        throw chefsError;
      }

      console.log('Chefs data:', chefsData);

      // Then, get all locations and services
      const { data: locationsData, error: locationsError } = await supabase
        .from('chef_locations')
        .select('*');

      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }

      console.log('Locations data:', locationsData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('chef_services')
        .select('*');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      console.log('Services data:', servicesData);

      // Combine the data
      const chefsWithDetails = chefsData.map(chef => ({
        ...chef,
        locations: locationsData.filter((loc: ChefLocation) => loc.chef_id === chef.id),
        services: servicesData.filter((srv: ChefService) => srv.chef_id === chef.id)
      }));

      console.log('Combined chefs data:', chefsWithDetails);

      // Apply filters
      let filteredChefs = chefsWithDetails;

      if (location && location !== 'all') {
        filteredChefs = filteredChefs.filter(chef =>
          chef.locations.some((loc: ChefLocation) => loc.location === location)
        );
      }

      if (service && service !== 'all') {
        filteredChefs = filteredChefs.filter(chef =>
          chef.services.some((srv: ChefService) => srv.service_name === service)
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredChefs = filteredChefs.filter(chef =>
          chef.name.toLowerCase().includes(searchLower) ||
          chef.bio.toLowerCase().includes(searchLower)
        );
      }

      // Apply experience range filter
      filteredChefs = filteredChefs.filter(chef =>
        chef.experience_years >= experienceRange[0] &&
        chef.experience_years <= experienceRange[1]
      );

      // Apply price range filter
      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        filteredChefs = filteredChefs.filter(chef =>
          chef.services.some((srv: ChefService) => {
            const price = parseInt(srv.price_range.replace(/[^0-9]/g, ''));
            return price >= priceRange[0] && price <= priceRange[1];
          })
        );
      }

      // Sort chefs
      filteredChefs.sort((a, b) => {
        switch (sort) {
          case 'experience_asc':
            return a.experience_years - b.experience_years;
          case 'experience_desc':
            return b.experience_years - a.experience_years;
          case 'price_asc':
            return Math.min(...a.services.map((s: ChefService) => parseInt(s.price_range.replace(/[^0-9]/g, '')))) -
                   Math.min(...b.services.map((s: ChefService) => parseInt(s.price_range.replace(/[^0-9]/g, ''))));
          case 'price_desc':
            return Math.max(...b.services.map((s: ChefService) => parseInt(s.price_range.replace(/[^0-9]/g, '')))) -
                   Math.max(...a.services.map((s: ChefService) => parseInt(s.price_range.replace(/[^0-9]/g, ''))));
          default:
            return 0;
        }
      });

      console.log('Final filtered chefs:', filteredChefs);
      setChefs(filteredChefs);
    } catch (error: any) {
      console.error('Error in fetchChefs:', error);
      setError(error.message || 'Failed to fetch chefs');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch chefs. Please try again.',
        variant: 'destructive',
      });
    } finally {
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
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">Find Your Perfect Chef</h1>

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
              <Card key={chef.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{chef.name}</CardTitle>
                  <CardDescription>{chef.bio}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {chef.locations.map(l => l.location).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{chef.experience_years} years experience</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {chef.services.map((service) => (
                          <span
                            key={service.id}
                            className="text-sm bg-secondary px-2 py-1 rounded"
                          >
                            {service.service_name} - {service.price_range}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <a href={`tel:${chef.phone_number}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Chef
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 