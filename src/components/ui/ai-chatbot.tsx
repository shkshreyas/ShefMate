import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/clerk-react';
import { X, Send, MessageCircle, ChevronDown, ChevronUp, Bot, User, Package, Clock, Star } from 'lucide-react';
import { getOrdersByUserId, getChefByUserId, getAllChefs } from '@/lib/firebase-utils';

// OpenRouter API key from environment variables
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  isChef: boolean;
  orderHistory: any[];
  chefProfile?: any;
  preferences?: string[];
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your ShefMate AI assistant. I can help you with booking chefs, answering questions about our services, and providing personalized recommendations. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show chatbot after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // Listen for custom events to open the chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    
    window.addEventListener('open-ai-chatbot', handleOpenChatbot);
    
    return () => {
      window.removeEventListener('open-ai-chatbot', handleOpenChatbot);
    };
  }, []);

  // Load user data when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !isLoaded) return;
      
      setIsLoadingUserData(true);
      try {
        // Get user's order history
        const orders = await getOrdersByUserId(user.id);
        
        // Check if user is a chef
        const chefProfile = await getChefByUserId(user.id);
        
        // Extract preferences from order history
        const preferences = extractPreferences(orders);
        
        setUserData({
          id: user.id,
          name: user.fullName || user.username || 'User',
          email: user.primaryEmailAddress?.emailAddress || '',
          isChef: !!chefProfile,
          orderHistory: orders,
          chefProfile: chefProfile,
          preferences: preferences
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set basic user data even if there's an error
        setUserData({
          id: user.id,
          name: user.fullName || user.username || 'User',
          email: user.primaryEmailAddress?.emailAddress || '',
          isChef: false,
          orderHistory: [],
          preferences: []
        });
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user, isLoaded]);

  // Extract user preferences from order history
  const extractPreferences = (orders: any[]): string[] => {
    const preferences: string[] = [];
    const cuisineTypes = new Set<string>();
    const dietaryPreferences = new Set<string>();
    
    orders.forEach(order => {
      if (order.cuisineType) cuisineTypes.add(order.cuisineType);
      if (order.dietaryRequirements) {
        order.dietaryRequirements.forEach((req: string) => dietaryPreferences.add(req));
      }
    });
    
    return [...cuisineTypes, ...dietaryPreferences];
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get current URL path to provide context
      const currentPath = window.location.pathname;
      
      // Prepare user context
      let userContext = "";
      if (userData) {
        userContext = `
User Information:
- Name: ${userData.name}
- Email: ${userData.email}
- Is Chef: ${userData.isChef}
- Total Orders: ${userData.orderHistory.length}
- Preferences: ${userData.preferences?.join(', ') || 'None'}
- Current Page: ${currentPath}
`;
      }

      // Prepare system message with comprehensive context
      const systemMessage = `You are a helpful AI assistant for ShefMate, a platform that connects customers with professional chefs for home cooking services.

${userContext}

You have access to the following information:
- User's order history and preferences
- Current page context
- Chef profiles and services
- Platform policies and procedures

Response Guidelines:
- Be friendly, professional, and helpful
- Provide personalized recommendations based on user history
- For booking questions, guide users to the /chefs page
- For chef-related questions, provide relevant information
- For technical issues, offer clear solutions
- Keep responses concise but informative
- Use the user's name when appropriate
- Suggest relevant chefs based on preferences
- Help with dietary requirements and cuisine preferences

Current Page Context: ${currentPath.includes('/chefs') ? 'User is browsing chef listings' : 'User is on main page'}

Important: Always prioritize user experience and provide actionable advice.`;

      // Prepare messages for API call
      const apiMessages = [
        { role: "system", content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: input }
      ];

      // Make API call to OpenRouter
      if (OPENROUTER_API_KEY) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "ShefMate",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "deepseek/deepseek-r1:free",
            "messages": apiMessages,
            "max_tokens": 300,
            "temperature": 0.7
          })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]?.message) {
          const aiResponse = data.choices[0].message.content;
          const cleanResponse = stripMarkdown(aiResponse);
          setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
        } else {
          throw new Error('Invalid API response');
        }
      } else {
        // Fallback responses when API key is not available
        const fallbackResponse = generateFallbackResponse(input, userData, currentPath);
        const cleanResponse = stripMarkdown(fallbackResponse);
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      }
      
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorResponse = generateFallbackResponse(input, userData, window.location.pathname);
      const cleanResponse = stripMarkdown(errorResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to strip markdown formatting from text
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold (**text**)
      .replace(/\*(.*?)\*/g, '$1') // Remove italic (*text*)
      .replace(/`(.*?)`/g, '$1') // Remove inline code (`text`)
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim();
  };

  // Generate fallback responses when API is not available
  const generateFallbackResponse = (userInput: string, userData: UserData | null, currentPath: string): string => {
    const input = userInput.toLowerCase();
    
    // Personalized responses based on user data
    if (userData) {
      if (input.includes('order') || input.includes('history')) {
        if (userData.orderHistory.length > 0) {
          const recentOrder = userData.orderHistory[0];
          return `I can see you have ${userData.orderHistory.length} orders in your history. Your most recent order was for ${recentOrder.cuisineType || 'a meal'} on ${new Date(recentOrder.createdAt?.toDate()).toLocaleDateString()}. Would you like to book another chef or check your order status?`;
        } else {
          return `I don't see any orders in your history yet. Would you like to browse our chefs and make your first booking? You can find great chefs on our /chefs page!`;
        }
      }
      
      if (input.includes('preference') || input.includes('like')) {
        if (userData.preferences && userData.preferences.length > 0) {
          return `Based on your preferences, I can see you enjoy ${userData.preferences.join(', ')}. I'd recommend checking out chefs who specialize in these cuisines on our /chefs page!`;
        } else {
          return `I'd love to help you discover your culinary preferences! What types of cuisine are you interested in trying?`;
        }
      }
    }
    
    // General responses based on input
    if (input.includes('book') || input.includes('reservation')) {
      return `Great! To book a chef, simply browse our selection at /chefs and click on the chef's profile you're interested in. From there, you can view their availability and book directly. Would you like me to help you find a specific type of chef?`;
    }
    
    if (input.includes('price') || input.includes('cost')) {
      return `Our chefs set their own prices based on their experience, cuisine specialty, and the complexity of your event. Prices typically range from $150-$500 for a dinner for 4-6 people. You can see each chef's pricing details on their profile page.`;
    }
    
    if (input.includes('recommend') || input.includes('suggestion')) {
      return `I'd be happy to recommend some chefs! Based on our top-rated professionals, you might like chefs who specialize in Italian, Asian fusion, or Mediterranean cuisine. You can view their full profiles and book directly through our platform at /chefs.`;
    }
    
    if (input.includes('dietary') || input.includes('allergy')) {
      return `We have chefs who specialize in various dietary requirements including vegetarian, vegan, gluten-free, and other dietary needs. When browsing chefs, you can filter by dietary preferences to find the perfect match for your needs.`;
    }
    
    if (input.includes('help') || input.includes('support')) {
      return `I'm here to help! I can assist with booking chefs, answering questions about our services, providing recommendations, and helping with any issues you might have. What specific help do you need?`;
    }
    
    // Default response
    return `I'd be happy to help you with ShefMate! I can assist with booking chefs, answering questions about our services, and providing personalized recommendations. What would you like to know?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 z-50 flex flex-col">
      {!isMinimized ? (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72 sm:w-80 md:w-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 sm:p-3 flex justify-between items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <Bot size={16} className="sm:w-5 sm:h-5" />
              <h3 className="font-medium text-sm sm:text-base">ShefMate Assistant</h3>
              {userData && (
                <div className="flex items-center gap-1 text-xs bg-white/20 px-1 sm:px-2 py-1 rounded-full">
                  <User size={10} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{userData.name.split(' ')[0]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={16} className="sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
          {/* User Info Banner */}
          {userData && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1 sm:p-2 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Package size={10} className="sm:w-3 sm:h-3" />
                  <span className="text-xs">{userData.orderHistory.length} orders</span>
                </div>
                {userData.preferences && userData.preferences.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={10} className="sm:w-3 sm:h-3" />
                    <span className="text-xs hidden sm:inline">{userData.preferences.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 p-2 sm:p-3 overflow-y-auto max-h-64 sm:max-h-80 bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-2 sm:mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-2 sm:px-3 py-2 rounded-lg max-w-[85%] sm:max-w-[80%] text-xs sm:text-sm ${
                    message.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-2 sm:mb-3">
                <div className="bg-gray-200 text-gray-800 px-2 sm:px-3 py-2 rounded-lg rounded-tl-none max-w-[85%] sm:max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoadingUserData ? "Loading..." : "Ask me anything..."}
                className="flex-1 text-xs sm:text-sm"
                disabled={isLoading || isLoadingUserData}
              />
              <Button 
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || isLoadingUserData}
                className="bg-primary hover:bg-primary/90 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Send size={16} className="sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-lg p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center"
        >
          <MessageCircle size={20} className="sm:w-5 sm:h-5" />
        </Button>
      )}
    </div>
  );
} 