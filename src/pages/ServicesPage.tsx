import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";

export function ServicesPage() {
  return (
    <PageLayout
      title="Our Services"
      description="Discover the range of services we offer to connect home chefs with food lovers."
    >
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">For Food Lovers</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Home-Cooked Meals</h3>
              <p className="text-muted-foreground">
                Enjoy authentic, home-cooked meals delivered to your doorstep. Choose from a variety of cuisines 
                and dishes prepared by talented home chefs in your area.
              </p>
              <Button asChild>
                <a href="/chefs">Browse Meals</a>
              </Button>
            </div>
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Custom Orders</h3>
              <p className="text-muted-foreground">
                Request custom meals or special dietary requirements. Our chefs can accommodate various dietary 
                needs and preferences.
              </p>
              <Button asChild variant="outline">
                <a href="/contact">Request Custom Order</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">For Home Chefs</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Chef Platform</h3>
              <p className="text-muted-foreground">
                Join our platform to showcase your culinary skills and earn by preparing meals for food lovers 
                in your community.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Set your own schedule and prices</li>
                <li>Manage orders and deliveries</li>
                <li>Build your customer base</li>
                <li>Receive secure payments</li>
              </ul>
              <Button asChild>
                <a href="/chefs">Become a Chef</a>
              </Button>
            </div>
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Chef Support</h3>
              <p className="text-muted-foreground">
                We provide comprehensive support to help you succeed as a home chef on our platform.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Marketing and promotion</li>
                <li>Customer service support</li>
                <li>Business guidance</li>
                <li>Community events</li>
              </ul>
              <Button asChild variant="outline">
                <a href="/chef-support">Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Additional Services</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Cooking Classes</h3>
              <p className="text-muted-foreground">
                Learn cooking techniques and recipes from our experienced home chefs through virtual or in-person classes.
              </p>
              <Button asChild variant="outline">
                <a href="/classes">View Classes</a>
              </Button>
            </div>
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Catering</h3>
              <p className="text-muted-foreground">
                Book our home chefs for special events, parties, or corporate gatherings.
              </p>
              <Button asChild variant="outline">
                <a href="/catering">Book Catering</a>
              </Button>
            </div>
            <div className="p-6 bg-secondary rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">Food Delivery</h3>
              <p className="text-muted-foreground">
                Reliable and timely delivery of your favorite home-cooked meals.
              </p>
              <Button asChild variant="outline">
                <a href="/delivery">Order Now</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Why Choose ShefMate?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-muted-foreground">
                All our chefs undergo a thorough verification process to ensure the highest standards of food 
                safety and quality.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
              <p className="text-muted-foreground">
                We foster a strong community of food lovers and home chefs, creating meaningful connections 
                through food.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Our platform ensures secure payments and protects both chefs and customers throughout the 
                ordering process.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Our customer support team is available round the clock to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
} 