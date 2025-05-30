import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface ChefWithRelations {
  id: number;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  bio: string;
  experience_years: number;
  created_at: string;
  locations: { location: string }[];
  services: { service_name: string; price_range: string }[];
}

type SortOption = 'experience_asc' | 'experience_desc' | 'price_asc' | 'price_desc';

export function ChefListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chefs, setChefs] = useState<ChefWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('all');
  const [service, setService] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 50]);
  const [sortBy, setSortBy] = useState<SortOption>('experience_desc');
  const { toast } = useToast();

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('chef_locations')
        .select('location')
        .order('location');

      if (locationsError) throw locationsError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('chef_services')
        .select('service_name')
        .order('service_name');

      if (servicesError) throw servicesError;

      // Use Set to ensure uniqueness
      const uniqueLocations = new Set(locationsData.map(loc => loc.location));
      const uniqueServices = new Set(servicesData.map(srv => srv.service_name));

      setLocations(Array.from(uniqueLocations));
      setServices(Array.from(uniqueServices));
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load filters. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch chefs
      const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select('*')
        .order('created_at', { ascending: false });

      if (chefsError) throw chefsError;

      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('chef_locations')
        .select('*');

      if (locationsError) throw locationsError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('chef_services')
        .select('*');

      if (servicesError) throw servicesError;

      // Combine the data
      const chefsWithDetails = chefsData.map(chef => ({
        ...chef,
        locations: locationsData.filter((loc: { chef_id: number }) => loc.chef_id === chef.id),
        services: servicesData.filter((srv: { chef_id: number }) => srv.chef_id === chef.id)
      }));

      setChefs(chefsWithDetails);
    } catch (error) {
      console.error('Error fetching chefs:', error);
      setError('Failed to load chefs. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load chefs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    let filteredChefs = [...chefs];

    // Apply search filter
    if (searchTerm) {
      filteredChefs = filteredChefs.filter(chef =>
        chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chef.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (location && location !== 'all') {
      filteredChefs = filteredChefs.filter(chef =>
        chef.locations.some((loc: { location: string }) => loc.location === location)
      );
    }

    // Apply service filter
    if (service && service !== 'all') {
      filteredChefs = filteredChefs.filter(chef =>
        chef.services.some((srv: { service_name: string }) => srv.service_name === service)
      );
    }

    // Apply price range filter
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filteredChefs = filteredChefs.filter(chef =>
        chef.services.some((srv: { price_range: string }) => {
          const price = parseInt(srv.price_range.replace(/[^0-9]/g, ''));
          return price >= priceRange[0] && price <= priceRange[1];
        })
      );
    }

    // Apply experience range filter
    filteredChefs = filteredChefs.filter(chef =>
      chef.experience_years >= experienceRange[0] && chef.experience_years <= experienceRange[1]
    );

    // Apply sorting
    filteredChefs.sort((a, b) => {
      switch (sortBy) {
        case 'experience_asc':
          return a.experience_years - b.experience_years;
        case 'experience_desc':
          return b.experience_years - a.experience_years;
        case 'price_asc':
          return Math.min(...a.services.map((s: { price_range: string }) => parseInt(s.price_range.replace(/[^0-9]/g, '')))) -
                 Math.min(...b.services.map((s: { price_range: string }) => parseInt(s.price_range.replace(/[^0-9]/g, ''))));
        case 'price_desc':
          return Math.max(...b.services.map((s: { price_range: string }) => parseInt(s.price_range.replace(/[^0-9]/g, '')))) -
                 Math.max(...a.services.map((s: { price_range: string }) => parseInt(s.price_range.replace(/[^0-9]/g, ''))));
        default:
          return 0;
      }
    });

    return filteredChefs;
  };

  const filteredChefs = handleFilterChange();

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chefs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchChefs}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search by name or bio..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service</label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map((srv) => (
                        <SelectItem key={srv} value={srv}>
                          {srv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider
                    min={0}
                    max={1000}
                    step={50}
                    value={priceRange}
                    onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience (years)</label>
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={experienceRange}
                    onValueChange={(value: number[]) => setExperienceRange([value[0], value[1]])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{experienceRange[0]} years</span>
                    <span>{experienceRange[1]} years</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
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
              </CardContent>
            </Card>
          </div>

          {/* Chef Listings */}
          <div className="md:col-span-3">
            {filteredChefs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No chefs found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChefs.map((chef) => (
                  <Card key={chef.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{chef.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{chef.experience_years} years experience</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{chef.bio}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{chef.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {chef.locations.map(loc => loc.location).join(', ')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">View Profile</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 