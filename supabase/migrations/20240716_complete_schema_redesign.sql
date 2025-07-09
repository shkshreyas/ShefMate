-- COMPLETE DATABASE REDESIGN FOR SHEFMATE
-- Inspired by Amazon, Zomato, Flipkart style platforms
-- This migration drops all existing tables and creates a fresh optimized schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS chef_reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS chef_services CASCADE;
DROP TABLE IF EXISTS chef_locations CASCADE;
DROP TABLE IF EXISTS chef_availability CASCADE;
DROP TABLE IF EXISTS chef_cuisines CASCADE;
DROP TABLE IF EXISTS cuisines CASCADE;
DROP TABLE IF EXISTS chefs CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_payment_methods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===============================
-- CORE USER AND PROFILE TABLES
-- ===============================

-- Users table (linked to Clerk auth)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    profile_image_url TEXT,
    is_chef BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User addresses for delivery/service locations
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- CHEF PROFILE RELATED TABLES
-- ===============================

-- Chefs table - extends users
CREATE TABLE chefs (
    id TEXT PRIMARY KEY, -- Same as user_id for easy joins
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INTEGER,
    hourly_rate_min NUMERIC(10,2),
    hourly_rate_max NUMERIC(10,2),
    specialization TEXT,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuisines master table
CREATE TABLE cuisines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
);

-- Chef cuisines - many-to-many relationship
CREATE TABLE chef_cuisines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    cuisine_id UUID NOT NULL REFERENCES cuisines(id) ON DELETE CASCADE,
    UNIQUE(chef_id, cuisine_id)
);

-- Chef service locations
CREATE TABLE chef_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    radius_km INTEGER DEFAULT 10, -- How far chef is willing to travel
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chef availability schedule
CREATE TABLE chef_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chef_id, day_of_week, start_time, end_time)
);

-- Chef services/offerings
CREATE TABLE chef_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price_range TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL,
    max_guests INTEGER DEFAULT 10,
    preparation_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- ORDER AND BOOKING RELATED TABLES
-- ===============================

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE, -- Human-readable order ID (SHEF-YYYYMMDD-XXXX)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    service_id UUID REFERENCES chef_services(id) ON DELETE SET NULL,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    total_guests INTEGER NOT NULL DEFAULT 1,
    address TEXT NOT NULL,
    special_instructions TEXT,
    food_preference TEXT,
    dietary_restrictions TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    cancellation_reason TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items (if chef offers multiple items in a service)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL,
    special_requests TEXT
);

-- Chef reviews
CREATE TABLE chef_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_id TEXT NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, order_id) -- One review per order
);

-- ===============================
-- INDEXES FOR PERFORMANCE
-- ===============================

-- User indexes
CREATE INDEX idx_users_email ON users(email);

-- Chef indexes
CREATE INDEX idx_chefs_user_id ON chefs(user_id);
CREATE INDEX idx_chefs_rating ON chefs(avg_rating DESC);
CREATE INDEX idx_chefs_featured ON chefs(is_featured) WHERE is_featured = TRUE;

-- Location indexes
CREATE INDEX idx_chef_locations_chef_id ON chef_locations(chef_id);
CREATE INDEX idx_chef_locations_location ON chef_locations(location);

-- Service indexes
CREATE INDEX idx_chef_services_chef_id ON chef_services(chef_id);
CREATE INDEX idx_chef_services_price ON chef_services(base_price);

-- Order indexes
CREATE INDEX idx_orders_chef_id ON orders(chef_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Review indexes
CREATE INDEX idx_chef_reviews_chef_id ON chef_reviews(chef_id);
CREATE INDEX idx_chef_reviews_rating ON chef_reviews(rating);

-- ===============================
-- ROW LEVEL SECURITY POLICIES
-- ===============================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_reviews ENABLE ROW LEVEL SECURITY;

-- For development, allow all operations on all tables
CREATE POLICY "Allow all operations on all tables" ON users USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON user_addresses USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chefs USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chef_locations USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chef_services USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chef_availability USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chef_cuisines USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON cuisines USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON order_items USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on all tables" ON chef_reviews USING (true) WITH CHECK (true);

-- ===============================
-- TRIGGERS AND FUNCTIONS
-- ===============================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at column
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chefs_updated_at
BEFORE UPDATE ON chefs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chef_services_updated_at
BEFORE UPDATE ON chef_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chef_availability_updated_at
BEFORE UPDATE ON chef_availability
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update chef rating when a review is added
CREATE OR REPLACE FUNCTION update_chef_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update chef's average rating and total ratings count
  UPDATE chefs
  SET 
    total_ratings = total_ratings + 1,
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM chef_reviews
      WHERE chef_id = NEW.chef_id
    )
  WHERE id = NEW.chef_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chef rating when review is added
CREATE TRIGGER update_chef_rating_on_review
AFTER INSERT ON chef_reviews
FOR EACH ROW EXECUTE FUNCTION update_chef_rating();

-- Function to update order count when an order is completed
CREATE OR REPLACE FUNCTION update_chef_order_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE chefs
    SET total_orders = total_orders + 1
    WHERE id = NEW.chef_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chef order count when order is completed
CREATE TRIGGER update_chef_order_count_on_completion
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_chef_order_count();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'SHEF-' || 
                     TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' ||
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate order number
CREATE TRIGGER generate_order_number_on_insert
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function to update user.is_chef flag when chef is created
CREATE OR REPLACE FUNCTION update_user_is_chef()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET is_chef = TRUE
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user.is_chef flag
CREATE TRIGGER update_user_is_chef_on_insert
AFTER INSERT ON chefs
FOR EACH ROW EXECUTE FUNCTION update_user_is_chef();

-- ===============================
-- INITIAL DATA SETUP
-- ===============================

-- Insert some cuisines
INSERT INTO cuisines (name, description) VALUES
('Indian', 'Traditional Indian cuisine including North and South Indian specialties'),
('Italian', 'Authentic Italian dishes including pasta, pizza, and risotto'),
('Chinese', 'Traditional Chinese cuisine from different regions'),
('Mexican', 'Authentic Mexican dishes with traditional flavors'),
('Mediterranean', 'Healthy Mediterranean cuisine featuring olive oil, fresh vegetables and seafood'),
('Japanese', 'Traditional Japanese cuisine including sushi and ramen'),
('Thai', 'Spicy and aromatic Thai dishes'),
('American', 'Classic American comfort food and BBQ'),
('French', 'Elegant French cuisine with rich flavors'),
('Middle Eastern', 'Flavorful Middle Eastern dishes with exotic spices'); 