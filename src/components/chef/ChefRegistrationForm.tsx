import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const chefSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  experience_years: z.number().min(0, 'Experience must be a positive number'),
  locations: z.array(z.string()).min(1, 'Please add at least one location'),
  services: z.array(z.object({
    name: z.string(),
    price_range: z.string()
  })).min(1, 'Please add at least one service')
});

type ChefFormData = z.infer<typeof chefSchema>;

export function ChefRegistrationForm() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [newLocation, setNewLocation] = useState('');
  const [newService, setNewService] = useState({ name: '', price_range: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ChefFormData>({
    resolver: zodResolver(chefSchema),
    defaultValues: {
      name: user?.fullName || '',
      locations: [],
      services: []
    }
  });

  const locations = watch('locations');
  const services = watch('services');

  const addLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setValue('locations', [...locations, newLocation]);
      setNewLocation('');
    }
  };

  const addService = () => {
    if (newService.name && newService.price_range) {
      setValue('services', [...services, newService]);
      setNewService({ name: '', price_range: '' });
    }
  };

  const removeLocation = (location: string) => {
    setValue('locations', locations.filter(l => l !== location));
  };

  const removeService = (index: number) => {
    setValue('services', services.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ChefFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a chef profile.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting chef registration with data:', {
        user_id: user.id,
        name: data.name,
        email: user.primaryEmailAddress?.emailAddress,
        phone_number: data.phone_number,
        bio: data.bio,
        experience_years: data.experience_years
      });

      // First check if user already has a chef profile
      const { data: existingChef, error: checkError } = await supabase
        .from('chefs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing chef:', checkError);
        throw checkError;
      }

      if (existingChef) {
        toast({
          title: 'Error',
          description: 'You already have a chef profile.',
          variant: 'destructive',
        });
        return;
      }

      // Insert chef data
      const { data: chef, error: chefError } = await supabase
        .from('chefs')
        .insert({
          user_id: user.id,
          name: data.name,
          email: user.primaryEmailAddress?.emailAddress,
          phone_number: data.phone_number,
          bio: data.bio,
          experience_years: data.experience_years
        })
        .select('*')
        .single();

      if (chefError) {
        console.error('Error creating chef profile:', chefError);
        throw chefError;
      }

      if (!chef) {
        throw new Error('Failed to create chef profile');
      }

      console.log('Chef profile created successfully:', chef);

      // Insert locations
      if (data.locations.length > 0) {
        console.log('Inserting locations:', data.locations);
        const { error: locationsError } = await supabase
          .from('chef_locations')
          .insert(
            data.locations.map(location => ({
              chef_id: chef.id,
              location
            }))
          );

        if (locationsError) {
          console.error('Error adding locations:', locationsError);
          throw locationsError;
        }
      }

      // Insert services
      if (data.services.length > 0) {
        console.log('Inserting services:', data.services);
        const { error: servicesError } = await supabase
          .from('chef_services')
          .insert(
            data.services.map(service => ({
              chef_id: chef.id,
              service_name: service.name,
              price_range: service.price_range
            }))
          );

        if (servicesError) {
          console.error('Error adding services:', servicesError);
          throw servicesError;
        }
      }

      toast({
        title: 'Success!',
        description: 'Your chef profile has been created successfully.',
      });

      // Navigate to the chef listing page after successful registration
      navigate('/chefs');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chef profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        navigate('/chefs');
      }
    }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[600px] w-full bg-background p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">
              Create Your Chef Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              Fill out the form below to create your chef profile and start accepting bookings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Full Name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Phone Number"
                  {...register('phone_number')}
                  className={errors.phone_number ? 'border-destructive' : ''}
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                )}
              </div>

              <div>
                <Textarea
                  placeholder="Tell us about yourself and your culinary journey..."
                  {...register('bio')}
                  className={errors.bio ? 'border-destructive' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div>
                <Input
                  type="number"
                  placeholder="Years of Experience"
                  {...register('experience_years', { valueAsNumber: true })}
                  className={errors.experience_years ? 'border-destructive' : ''}
                />
                {errors.experience_years && (
                  <p className="text-sm text-destructive">{errors.experience_years.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Locations You Serve</h3>
                <div className="flex gap-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add a location"
                  />
                  <Button type="button" onClick={addLocation}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {locations.map((location) => (
                    <div key={location} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                      <span>{location}</span>
                      <button
                        type="button"
                        onClick={() => removeLocation(location)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.locations && (
                  <p className="text-sm text-destructive">{errors.locations.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Services You Offer</h3>
                <div className="flex gap-2">
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Service name"
                  />
                  <Input
                    value={newService.price_range}
                    onChange={(e) => setNewService({ ...newService, price_range: e.target.value })}
                    placeholder="Price range"
                  />
                  <Button type="button" onClick={addService}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                      <span>{service.name} - {service.price_range}</span>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.services && (
                  <p className="text-sm text-destructive">{errors.services.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Profile...' : 'Create Chef Profile'}
            </Button>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 