export type Chef = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone_number: string;
    bio: string;
    experience_years: number;
    created_at: string;
    updated_at: string;
  }
  
  export type ChefLocation = {
    id: string;
    chef_id: string;
    location: string;
    created_at: string;
  }
  
  export type ChefService = {
    id: string;
    chef_id: string;
    service_name: string;
    price_range: string;
    created_at: string;
  }
  
  export type ChefWithDetails = Chef & {
    locations: ChefLocation[];
    services: ChefService[];
  }