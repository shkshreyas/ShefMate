import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllChefs } from '@/lib/firebase-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ChefListingPage() {
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortOption, setSortOption] = useState('rating');

  useEffect(() => {
    async function fetchChefs() {
      try {
        const chefsData = await getAllChefs();
        setChefs(chefsData);
      } catch (err) {
        console.error('Error fetching chefs:', err);
        setError('Failed to load chefs');
      } finally {
        setLoading(false);
      }
    }
    
    fetchChefs();
  }, []);

  // Get unique locations for filter
  const locations = [...new Set(chefs.map(chef => chef.location))].filter(Boolean);

  // Filter and sort chefs
  const filteredChefs = chefs.filter(chef => {
    const matchesSearch = 
      chef.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' ? true : chef.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  // Sort chefs
  const sortedChefs = [...filteredChefs].sort((a, b) => {
    if (sortOption === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortOption === 'experience') {
      return (b.experienceYears || 0) - (a.experienceYears || 0);
    } else if (sortOption === 'orders') {
      return (b.totalOrders || 0) - (a.totalOrders || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading chefs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Find Your Perfect Chef</h1>
      <p className="text-gray-600 mb-8">Browse through our talented chefs and find the perfect match for your culinary needs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input 
            id="search"
            placeholder="Search by name, bio or location" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="location">Filter by Location</Label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger id="location">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location || "unknown"}>{location || "Unknown"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="sort">Sort By</Label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="experience">Most Experience</SelectItem>
              <SelectItem value="orders">Most Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedChefs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl mb-2">No chefs found</p>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChefs.map(chef => (
            <ChefCard key={chef.id} chef={chef} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChefCard({ chef }: { chef: any }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        {chef.profileImage ? (
          <img 
            src={chef.profileImage} 
            alt={chef.displayName} 
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">No Image</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{chef.displayName}</CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {chef.rating ? `${chef.rating.toFixed(1)} ★` : 'New Chef'}
          </Badge>
        </div>
        <CardDescription>{chef.location}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{chef.bio}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {chef.experienceYears} years experience
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            {chef.totalOrders || 0} orders completed
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link to={`/chefs/${chef.id}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 