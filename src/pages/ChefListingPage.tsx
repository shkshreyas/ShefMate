import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllChefs } from '@/lib/firebase-utils';
import { useUser } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search, MapPin, Star, Clock, CheckCircle } from 'lucide-react';

export default function ChefListingPage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  // Open Clerk sign-in modal if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      clerk.openSignIn();
    }
  }, [isLoaded, user, clerk]);
  if (isLoaded && !user) return null;

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-medium">Loading chefs...</div>
        </div>
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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Find Your Perfect Chef</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">Browse through our talented chefs and find the perfect match for your culinary needs</p>
      </div>
      
      {/* AI Assistant Banner */}
      <div className="mb-10 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full text-white">
            <Bot size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">Need help finding the perfect chef?</h3>
            <p className="text-gray-600">Our AI assistant can recommend chefs based on your preferences, dietary requirements, or special occasions. Just click the chat icon in the corner!</p>
          </div>
          <Button 
            onClick={() => {
              // This will trigger the chatbot to open
              const event = new CustomEvent('open-ai-chatbot');
              window.dispatchEvent(event);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
          >
            Ask for Recommendations
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <Label htmlFor="search" className="flex items-center gap-2 mb-2">
            <Search size={16} />
            <span>Search</span>
          </Label>
          <Input 
            id="search"
            placeholder="Search by name, bio or location" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="location" className="flex items-center gap-2 mb-2">
            <MapPin size={16} />
            <span>Filter by Location</span>
          </Label>
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
          <Label htmlFor="sort" className="flex items-center gap-2 mb-2">
            <Star size={16} />
            <span>Sort By</span>
          </Label>
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
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <Search size={64} />
          </div>
          <p className="text-xl font-medium mb-2">No chefs found</p>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className="h-48 overflow-hidden">
        {chef.profileImage ? (
          <img 
            src={chef.profileImage} 
            alt={chef.displayName} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">No Image</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{chef.displayName}</CardTitle>
          <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            {chef.rating ? `${chef.rating.toFixed(1)}` : 'New Chef'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          {chef.location || 'Location not specified'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{chef.bio}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
            <Clock size={14} />
            {chef.experienceYears} years experience
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
            <CheckCircle size={14} />
            {chef.totalOrders || 0} orders completed
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link to={`/chefs/${chef.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 