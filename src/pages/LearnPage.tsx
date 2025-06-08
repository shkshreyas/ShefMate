import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { MobileTabBar } from '@/components/ui/mobile-tab-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Format message to handle bold text
const formatMessage = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// YouTube API configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const COOKING_CHANNELS = [
  'UCJFp8uSYCjXOMnkUyb3CQ3Q', // Tasty
  'UCwVQIkAtyZzQSA-OY1rsGig', // Binging with Babish
  'UCY1kMZp36IQSyNx_9h4mpCg', // Joshua Weissman
  'UCJ5v_MCY6GNUBTO8-D3XoAg', // Gordon Ramsay
  'UCqZ8IpRdoyQJR5uC_qLrqjw', // Jamie Oliver
];

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  viewCount: string;
  publishedAt: string;
}

interface YouTubeResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

// Predefined cooking context for better AI responses
const cookingContext = {
  expertise: [
    "Basic cooking techniques",
    "Recipe development",
    "Kitchen safety",
    "Ingredient selection",
    "Cooking equipment",
    "Food presentation",
    "Meal planning",
    "Nutrition basics"
  ],
  cuisines: [
    "Italian",
    "Indian",
    "Chinese",
    "Mexican",
    "Mediterranean",
    "Japanese",
    "Thai",
    "American"
  ],
  dietaryPreferences: [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Keto",
    "Paleo",
    "Low-carb",
    "Dairy-free"
  ],
  cookingLevels: [
    "Beginner",
    "Intermediate",
    "Advanced"
  ]
};

export const LearnPage = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi! I'm your cooking assistant. I can help you with recipes, cooking techniques, and kitchen tips. What would you like to learn today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos from YouTube
  const fetchVideos = async () => {
    try {
      const channelId = COOKING_CHANNELS[Math.floor(Math.random() * COOKING_CHANNELS.length)];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=6&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data: YouTubeResponse = await response.json();

      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const videoDetails = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      const detailsData: YouTubeDetailsResponse = await videoDetails.json();

      const formattedVideos = data.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        duration: detailsData.items[index].contentDetails.duration,
        channelTitle: item.snippet.channelTitle,
        viewCount: detailsData.items[index].statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      }));

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Fetch shorts from YouTube
  const fetchShorts = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=cooking shorts&type=video&videoDuration=short&maxResults=4&key=${YOUTUBE_API_KEY}`
      );
      const data: YouTubeResponse = await response.json();

      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const videoDetails = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      const detailsData: YouTubeDetailsResponse = await videoDetails.json();

      const formattedShorts = data.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        duration: detailsData.items[index].contentDetails.duration,
        channelTitle: item.snippet.channelTitle,
        viewCount: detailsData.items[index].statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      }));

      setShorts(formattedShorts);
    } catch (error) {
      console.error('Error fetching shorts:', error);
    }
  };

  // Fetch initial videos and shorts
  useEffect(() => {
    fetchVideos();
    fetchShorts();
  }, []);

  // Update user interests based on chat
  const updateUserInterests = (message: string) => {
    const cookingTerms = [
      'baking', 'grilling', 'pasta', 'dessert', 'vegetarian', 'vegan',
      'italian', 'indian', 'chinese', 'mexican', 'mediterranean', 'japanese',
      'thai', 'american', 'breakfast', 'lunch', 'dinner', 'snack'
    ];

    const newInterests = cookingTerms.filter(term => 
      message.toLowerCase().includes(term) && !userInterests.includes(term)
    );

    if (newInterests.length > 0) {
      setUserInterests(prev => [...prev, ...newInterests]);
      // Fetch new videos based on interests
      fetchVideos();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = message.trim();
    setMessage("");

    // Update user interests
    updateUserInterests(userMessage);

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "ShefMate",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "system",
              "content": `You are a professional cooking assistant with expertise in ${cookingContext.expertise.join(", ")}. 
              You specialize in ${cookingContext.cuisines.join(", ")} cuisines and can accommodate ${cookingContext.dietaryPreferences.join(", ")} dietary preferences.
              You provide clear, practical advice suitable for ${cookingContext.cookingLevels.join(", ")} cooks.
              
              Important formatting rules:
              - Do not use any markdown formatting (no **, *, _, #, etc.)
              - Do not use any special characters for emphasis
              - Write all text in plain format
              - Use simple line breaks for structure
              - Use numbers or bullet points with regular text
              - Do not use any HTML tags
              
              Response guidelines:
              - Keep responses concise and friendly
              - Focus on practical cooking advice
              - For recipes, provide clear step-by-step instructions
              - For techniques, explain them in simple terms
              - Always prioritize food safety and proper cooking methods
              - Use clear headings without special formatting
              - Separate sections with line breaks
              - Recommend related cooking videos when appropriate
              - Suggest next steps or related topics to explore`
            },
            ...chatMessages,
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration from ISO 8601
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20">
        {/* Stories Section */}
        <div className="container mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
          <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {shorts.map((short) => (
              <div 
                key={short.id} 
                className="flex flex-col items-center space-y-1 sm:space-y-2 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                onClick={() => setSelectedVideo(short)}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary p-1 relative">
                  <img
                    src={short.thumbnail}
                    alt={short.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-center line-clamp-2 w-16 sm:w-20">{short.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Shorts Section */}
        <div className="container mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">Recommended Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="relative rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 sm:h-48 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                  <h3 className="text-white font-semibold line-clamp-2 text-sm sm:text-base">{video.title}</h3>
                  <div className="flex items-center justify-between text-white/80 text-xs sm:text-sm mt-1">
                    <span className="truncate max-w-[60%]">{video.channelTitle}</span>
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl relative">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-background rounded-full p-1.5 sm:p-2 shadow-lg z-[10000] hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full rounded-t-lg"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{selectedVideo.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{selectedVideo.channelTitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Chatbot Section */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="bg-card rounded-lg shadow-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Cooking Assistant</h2>
            </div>
            
            <div className="h-72 sm:h-96 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4">
              <AnimatePresence>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 text-sm sm:text-base ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {formatMessage(msg.content)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about cooking tips, recipes, or techniques..."
                className="flex-1 text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading} size="icon" className="flex-shrink-0">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
}; 