import { PageLayout } from "@/components/layouts/PageLayout";

export function AboutPage() {
  return (
    <PageLayout
      title="About ShefMate"
      description="Learn more about our mission to connect home chefs with food lovers."
    >
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            ShefMate was born from a simple idea: to connect passionate home chefs with food lovers in their community. 
            We believe that great food brings people together, and everyone deserves access to authentic, homemade meals.
          </p>
          <p className="text-muted-foreground">
            Founded in 2025, we've grown from a small local initiative to a platform that empowers home chefs to share 
            their culinary talents while providing food enthusiasts with unique dining experiences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            We're on a mission to revolutionize the way people experience food by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Empowering home chefs to turn their passion into a business</li>
            <li>Creating authentic connections through food</li>
            <li>Supporting local communities and sustainable food practices</li>
            <li>Making homemade meals accessible to everyone</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-muted-foreground">
                We believe in building strong communities through food and shared experiences.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Quality & Safety</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards of food safety and quality for our users.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously innovate to improve the experience for both chefs and food lovers.
              </p>
            </div>
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
              <p className="text-muted-foreground">
                We promote sustainable food practices and support local food systems.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Team</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D03AQHYn3mN5qka3w/profile-displayphoto-shrink_400_400/B4DZYQroy1HIAg-/0/1744036597923?e=1754524800&v=beta&t=39AbDoDIQYtvt7XnFx9OWPg_VkHNN78AGRXcBwoevn4"
                alt="Shreyas Kumar"
                className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-2 border-primary"
              />
              <h3 className="text-xl font-semibold">Shreyas Kumar</h3>
              <p className="text-muted-foreground">Co-Founder & CEO</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Our Chefs"
                className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-2 border-primary"
              />
              <h3 className="text-xl font-semibold">Our Chefs</h3>
              <p className="text-muted-foreground">Talented Home Cooks</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Our Community"
                className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-2 border-primary"
              />
              <h3 className="text-xl font-semibold">Our Community</h3>
              <p className="text-muted-foreground">Food Lovers</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Join Our Journey</h2>
          <p className="text-muted-foreground">
            Whether you're a passionate home chef looking to share your culinary talents or a food lover seeking 
            authentic homemade meals, we invite you to join our growing community. Together, we're creating a 
            world where everyone can experience the joy of homemade food.
          </p>
          <div className="flex gap-4">
            <a 
              href="/chefs" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Become a Chef
            </a>
            <a 
              href="/chefs" 
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Join as Food Lover
            </a>
          </div>
        </section>
      </div>
    </PageLayout>
  );
} 