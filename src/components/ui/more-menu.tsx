import { useState } from 'react';
import { X, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  
  const handleOpenChefRegistration = () => {
    window.dispatchEvent(new CustomEvent('open-chef-registration'));
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-16">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-primary">More Options</h2>
          <button onClick={onClose} className="p-2">
            <X size={24} />
          </button>
        </div>
        
        {/* Register as Shef */}
        {user && (
          <div className="mb-8">
            <Button 
              onClick={handleOpenChefRegistration}
              className="w-full py-3 text-base"
            >
              Register as Shef
            </Button>
          </div>
        )}
        
        {/* Quick Links Section */}
        <div className="mb-8">
          <h4 className="text-lg font-bold mb-3">Quick Links</h4>
          <ul className="space-y-3">
            <li><a href="#" className="block py-2 border-b border-border">Home</a></li>
            <li><a href="#" className="block py-2 border-b border-border">About Us</a></li>
            <li><a href="#" className="block py-2 border-b border-border">Our Chefs</a></li>
            <li><a href="#" className="block py-2 border-b border-border">Services</a></li>
          </ul>
        </div>
        
        {/* Support Section */}
        <div className="mb-8">
          <h4 className="text-lg font-bold mb-3">Support</h4>
          <ul className="space-y-3">
            <li><a href="#" className="block py-2 border-b border-border">Help Center</a></li>
            <li><a href="#" className="block py-2 border-b border-border">Contact Us</a></li>
            <li><a href="#" className="block py-2 border-b border-border">Privacy Policy</a></li>
            <li><a href="#" className="block py-2 border-b border-border">Terms of Service</a></li>
          </ul>
        </div>
        
        {/* Social Media */}
        <div className="mb-8">
          <h4 className="text-lg font-bold mb-3">Stay Connected</h4>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="p-2 bg-secondary rounded-full">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-secondary rounded-full">
              <Twitter size={20} />
            </a>
            <a href="#" className="p-2 bg-secondary rounded-full">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-secondary rounded-full">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        
        {/* Newsletter */}
        <div className="mb-8">
          <h4 className="text-lg font-bold mb-3">Subscribe to our newsletter</h4>
          <div className="flex flex-col space-y-2">
            <Input 
              type="email" 
              placeholder="Your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button className="w-full">Subscribe</Button>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-8 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-4">&copy; 2025 ShefMate Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}