import { Header } from "@/components/ui/header";
import { MobileTabBar } from "@/components/ui/mobile-tab-bar";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20"></div>
      
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground mb-8">
              {description}
            </p>
          )}
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </main>
      
      <MobileTabBar />
      <div className="h-16 md:h-0"></div>
    </div>
  );
} 