import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function BlogsTestimonials() {
  const blogs = [
    {
      title: "The Rise of Home Chefs in Urban India",
      description: "Discover how professional chefs are revolutionizing home dining experiences across major Indian cities.",
      image: "https://c.ndtvimg.com/2023-08/r5mifhb_home-chef_625x300_03_August_23.jpg?im=FeatureCrop,algorithm=cascade,width=620,height=350",
      date: "March 15, 2024",
      readTime: "5 min read"
    },
    {
      title: "Traditional Recipes Meet Modern Cooking",
      description: "Exploring the fusion of traditional Indian cooking techniques with contemporary culinary trends.",
      image: "https://images.stockcake.com/public/2/0/0/200d7fbe-14e7-442b-bc7f-36f7d448f44b_large/traditional-indian-cooking-stockcake.jpg",
      date: "March 10, 2024",
      readTime: "4 min read"
    },
    {
      title: "The Art of Indian Home Dining",
      description: "How professional chefs are bringing restaurant-quality experiences to Indian homes.",
      image: "https://m.media-amazon.com/images/I/51-w8mhrRsL._SY445_SX342_.jpg",
      date: "March 5, 2024",
      readTime: "6 min read"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      avatar: "/testimonial1.jpg",
      content: "Having a professional chef cook authentic Maharashtrian food in my home was an amazing experience. The attention to detail and personalized service was outstanding!",
      rating: 5
    },
    {
      name: "Rahul Patel",
      location: "Delhi",
      avatar: "/testimonial2.jpg",
      content: "As a busy professional, ShefMate has been a game-changer. The chefs are incredibly talented and bring restaurant-quality food right to my doorstep.",
      rating: 5
    },
    {
      name: "Ananya Reddy",
      location: "Bangalore",
      avatar: "/testimonial3.jpg",
      content: "The variety of cuisines and the professionalism of the chefs is impressive. It's like having a personal chef without the hassle of hiring one full-time.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-background relative z-20">
      <div className="container mx-auto px-4">
        {/* Blogs Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Latest from Our Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{blog.date}</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <CardTitle className="text-xl">{blog.title}</CardTitle>
                  <CardDescription>{blog.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* Testimonials Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{testimonial.content}</p>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 