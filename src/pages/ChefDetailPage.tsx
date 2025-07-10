import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getChefById, getServicesByChefId, createOrder } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

export default function ChefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [chef, setChef] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
  const [orderTime, setOrderTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [foodPreference, setFoodPreference] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [orderLocation, setOrderLocation] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    async function fetchChefDetails() {
      if (!id) return;

      try {
        const chefData = await getChefById(id);
        if (!chefData) {
          setError('Chef not found');
          return;
        }
        
        setChef(chefData);
        
        const servicesData = await getServicesByChefId(id);
        setServices(servicesData);
      } catch (err) {
        console.error('Error fetching chef details:', err);
        setError('Failed to load chef details');
      } finally {
      setLoading(false);
      }
    }
    
    fetchChefDetails();
  }, [id]);

  const handleBookNow = (service: any) => {
    if (!isLoaded || !user) {
      navigate('/sign-in', { state: { returnTo: `/chefs/${id}` } });
      return;
    }
    
    setSelectedService(service);
    setOpenBookingDialog(true);
  };

  const handleSubmitBooking = async () => {
    if (!user || !chef || !selectedService || !orderDate) {
      setBookingStatus('error');
      setBookingMessage('Missing required information');
      return;
    }

    if (!orderTime) {
      setBookingStatus('error');
      setBookingMessage('Please select a time for your booking');
      return;
    }

    if (!customerMobile) {
      setBookingStatus('error');
      setBookingMessage('Please provide your phone number');
      return;
    }

    if (!orderLocation) {
      setBookingStatus('error');
      setBookingMessage('Please provide your address');
      return;
    }

    setBookingStatus('loading');

    try {
      // Format date and time for easier display
      const formattedDate = format(orderDate, 'MMM dd, yyyy');
      
      // Prepare order data
      const orderData = {
        userId: user.id,
        userName: user.fullName || user.firstName || user.emailAddresses[0].emailAddress,
        userEmail: user.emailAddresses[0].emailAddress,
        chefId: chef.id,
        chefName: chef.displayName,
        serviceId: selectedService.id,
        serviceName: selectedService.serviceName,
        orderDate: Timestamp.fromDate(orderDate),
        orderTime: orderTime,
        formattedDate: formattedDate, // For easier display
        duration,
        foodPreference,
        customerMobile,
        orderLocation,
        price: selectedService.price,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        setBookingStatus('success');
        setBookingMessage(`Booking successful! Chef ${chef.displayName} will review your request soon.`);
        
        // Reset form and close dialog after delay
        setTimeout(() => {
          setOpenBookingDialog(false);
          setOrderDate(undefined);
          setOrderTime('');
          setDuration(2);
          setFoodPreference('');
          setCustomerMobile('');
          setOrderLocation('');
          setBookingStatus('idle');
          
          // Redirect to orders page
          navigate('/orders', { state: { newBooking: true } });
        }, 3000);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setBookingStatus('error');
      setBookingMessage('Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading chef details...</div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error || 'Chef not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="rounded-lg overflow-hidden shadow-lg mb-4 h-80">
            {chef.profileImage ? (
              <img 
                src={chef.profileImage} 
                alt={chef.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">No Image</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {chef.rating ? `${chef.rating.toFixed(1)} ★` : 'New Chef'}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {chef.experienceYears} years experience
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {chef.totalOrders || 0} orders
            </Badge>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{chef.displayName}</h1>
          <p className="text-gray-600 mb-4">{chef.location}</p>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{chef.bio}</p>
      </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            {services.length === 0 ? (
              <p className="text-gray-500">No services available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <Card key={service.id} className="transition-all duration-300 hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{service.serviceName}</CardTitle>
                      <CardDescription>₹{service.price} per session</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handleBookNow(service)}
        >
          Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Book {chef.displayName}</DialogTitle>
            <DialogDescription>
              {selectedService && (
                <span>Service: {selectedService.serviceName} - ₹{selectedService.price}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {bookingStatus === 'success' ? (
            <div className="py-6 text-center">
              <div className="text-green-600 mb-2 text-xl">✓</div>
              <h3 className="text-lg font-semibold mb-2">Booking Successful!</h3>
              <p className="text-gray-600">{bookingMessage}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date</Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !orderDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={orderDate}
                          onSelect={setOrderDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Time</Label>
                  <div className="col-span-3">
                    <Select value={orderTime} onValueChange={setOrderTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Duration (hours)</Label>
                  <div className="col-span-3">
                    <Select 
                      value={duration.toString()} 
                      onValueChange={(value) => setDuration(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Food Preference</Label>
                  <div className="col-span-3">
                    <Input 
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value)}
                      placeholder="Vegetarian, Non-veg, Vegan, etc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Mobile Number</Label>
                  <div className="col-span-3">
                    <Input 
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="Your contact number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Address</Label>
                  <div className="col-span-3">
                    <Textarea 
                      value={orderLocation}
                      onChange={(e) => setOrderLocation(e.target.value)}
                      placeholder="Where should the chef come?"
                    />
                  </div>
                </div>
              </div>
              
              {bookingStatus === 'error' && (
                <div className="text-red-600 mb-4 text-sm">{bookingMessage}</div>
              )}
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={bookingStatus === 'loading' || !orderDate || !orderTime || !customerMobile || !orderLocation}
                  onClick={handleSubmitBooking}
                >
                  {bookingStatus === 'loading' ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 