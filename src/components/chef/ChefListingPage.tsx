import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'experience_asc' | 'experience_desc' | 'price_asc' | 'price_desc';

interface ChefLocation {
  location: string;
}

interface ChefService {
  service_name: string;
  price_range: string;
}

interface Chef {
  id: number;
  name: string;
  phone_number: string;
  bio: string;
  experience_years: number;
  locations: ChefLocation[];
  services: ChefService[];
}

export function ChefListingPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [filters] = useState({
    location: '',
    service: '',
    search: '',
    priceRange: [0, 1000] as [number, number],
    experienceRange: [0, 50] as [number, number]
  });

  const [sortBy] = useState<SortOption>('experience_desc');

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select(`
          *,
          locations:chef_locations(*),
          services:chef_services(*)
        `);

      if (chefsError) throw chefsError;

      if (chefsData) {
        setChefs(chefsData as Chef[]);
      }
    } catch (err) {
      console.error('Error fetching chefs:', err);
      setError('Failed to load chefs. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load chefs. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChefs = chefs.filter(chef => {
    const matchesLocation = !filters.location || 
      chef.locations.some(loc => loc.location === filters.location);
    const matchesService = !filters.service || 
      chef.services.some(serv => serv.service_name === filters.service);
    const matchesSearch = !filters.search || 
      chef.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      chef.bio.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPrice = chef.services.some(serv => {
      const price = parseInt(serv.price_range);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
    const matchesExperience = chef.experience_years >= filters.experienceRange[0] && 
      chef.experience_years <= filters.experienceRange[1];

    return matchesLocation && matchesService && matchesSearch && matchesPrice && matchesExperience;
  });

  const sortedChefs = [...filteredChefs].sort((a, b) => {
    switch (sortBy) {
      case 'experience_asc':
        return a.experience_years - b.experience_years;
      case 'experience_desc':
        return b.experience_years - a.experience_years;
      case 'price_asc':
        return Math.min(...a.services.map(s => parseInt(s.price_range))) - 
               Math.min(...b.services.map(s => parseInt(s.price_range)));
      case 'price_desc':
        return Math.max(...b.services.map(s => parseInt(s.price_range))) - 
               Math.max(...a.services.map(s => parseInt(s.price_range)));
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
          <Button onClick={fetchChefs}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedChefs.map((chef) => (
          <Card key={chef.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{chef.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{chef.phone_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{chef.locations.map(l => l.location).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{chef.experience_years} years experience</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{chef.bio}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 