import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { MobileTabBar } from '@/components/ui/mobile-tab-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Play, X, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
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

// Cooking-related keywords for better search results
const COOKING_KEYWORDS = [
  'cooking recipe',
  'cooking tutorial',
  'cooking tips',
  'cooking techniques',
  'cooking basics',
  'cooking for beginners',
  'quick cooking',
  'easy cooking',
  'cooking ideas',
  'cooking inspiration'
];

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  isEmbeddable?: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

// Add a list of unique splash images for videos
const SPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
];

// Update mock videos to only include embeddable ones
const MOCK_VIDEOS: Video[] = [
  {
    id: "0qSm029ROn4",
    title: "Smoky Tandoori Style Chicken",
    thumbnail: SPLASH_IMAGES[0],
    channelTitle: "The Art of Indian Cooking",
    duration: "12:45",      // approximate duration
    isEmbeddable: true
  },
  {
    id: "XmO_IvaDKjU",
    title: "7 Indian Recipes Everyone Must Try",
    thumbnail: SPLASH_IMAGES[1],
    channelTitle: "Best Indian Cooking",
    duration: "9:30",       // approximate duration
    isEmbeddable: true
  },
  {
    id: "cbP9JerrH-w",
    title: "Easy Indian Recipes by Nikunj Vasoya",
    thumbnail: SPLASH_IMAGES[2],
    channelTitle: "Indian Cooking | Easy Indian Recipes",
    duration: "8:20",       // approximate duration
    isEmbeddable: true
  }
];


const MOCK_SHORTS: Video[] = [
  {
    id: "PlI3gjkcPz0",
    title: "I Only Made Indian Food for 24 Hours",
    thumbnail: SPLASH_IMAGES[3],
    channelTitle: "BuzzFeed Tasty",
    duration: "1:00",        // typical short duration
    isEmbeddable: true
  },
  {
    id: "OCauH0jCS7E",
    title: "10 Best Indian Dinner Recipes",
    thumbnail: SPLASH_IMAGES[4],
    channelTitle: "Tasty",
    duration: "1:15",
    isEmbeddable: true
  }
];

// Add YouTube API response types
interface YouTubeSearchItem {
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
  };
}

interface YouTubeVideoDetails {
  status: {
    embeddable: boolean;
    privacyStatus: string;
  };
  contentDetails: {
    duration: string;
  };
}

// Enhanced video availability check function
const checkVideoAvailability = async (videoId: string): Promise<{ isAvailable: boolean; duration: string; isEmbeddable: boolean }> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return { isAvailable: false, duration: "0:00", isEmbeddable: false };
    }

    const videoDetails = data.items[0] as YouTubeVideoDetails;
    const isAvailable = videoDetails.status.privacyStatus === 'public';
    const isEmbeddable = videoDetails.status.embeddable;
    const duration = videoDetails.contentDetails.duration;
    
    return { isAvailable, duration, isEmbeddable };
  } catch (error) {
    console.error('Error checking video availability:', error);
    return { isAvailable: false, duration: "0:00", isEmbeddable: false };
  }
};

export const LearnPage = () => {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [shorts, setShorts] = useState<Video[]>(MOCK_SHORTS);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your cooking assistant. I can help you with recipes, cooking techniques, and kitchen tips. What would you like to learn today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [videoError, setVideoError] = useState(false);

  const fetchVideos = async () => {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not found, using mock data');
      setVideos(MOCK_VIDEOS);
      return;
    }

    try {
      setIsLoading(true);
      const keyword = COOKING_KEYWORDS[Math.floor(Math.random() * COOKING_KEYWORDS.length)];
      
      // Fetch popular videos with better parameters
      const popularResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=40&q=${encodeURIComponent(keyword)}&type=video&videoCategoryId=26&order=viewCount&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`
      );
      const popularData = await popularResponse.json();
      
      if (popularData.error) {
        console.error('YouTube API Error:', popularData.error);
        setVideos(MOCK_VIDEOS);
        return;
      }
      
      // Process videos with enhanced availability check
      const processedVideos = await Promise.all(
        (popularData.items || []).map(async (item: YouTubeSearchItem) => {
          const { isAvailable, duration, isEmbeddable } = await checkVideoAvailability(item.id.videoId);
          if (!isAvailable || !isEmbeddable) return null;
          
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            duration,
            isEmbeddable
          };
        })
      );
      
      // Filter out unavailable and non-embeddable videos
      const availableVideos = processedVideos.filter(video => video !== null);
      
      if (availableVideos.length < 30) {
        const mockVideosNeeded = 30 - availableVideos.length;
        const mockVideos = MOCK_VIDEOS.slice(0, mockVideosNeeded);
        setVideos([...availableVideos, ...mockVideos]);
      } else {
        setVideos(availableVideos.slice(0, 30));
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos(MOCK_VIDEOS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShorts = async () => {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not found, using mock data');
      setShorts(MOCK_SHORTS);
      return;
    }

    try {
      setIsLoading(true);
      const keyword = COOKING_KEYWORDS[Math.floor(Math.random() * COOKING_KEYWORDS.length)];
      
      // Fetch shorts with better parameters
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=40&q=${encodeURIComponent(keyword + ' shorts')}&type=video&videoDuration=short&videoCategoryId=26&order=viewCount&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.error) {
        console.error('YouTube API Error:', data.error);
        setShorts(MOCK_SHORTS);
        return;
      }
      
      // Process shorts with enhanced availability check
      const processedShorts = await Promise.all(
        (data.items || []).map(async (item: YouTubeSearchItem) => {
          const { isAvailable, duration, isEmbeddable } = await checkVideoAvailability(item.id.videoId);
          if (!isAvailable || !isEmbeddable) return null;
          
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            duration,
            isEmbeddable
          };
        })
      );
      
      // Filter out unavailable and non-embeddable shorts
      const availableShorts = processedShorts.filter(short => short !== null);
      
      if (availableShorts.length < 20) {
        const mockShortsNeeded = 20 - availableShorts.length;
        const mockShorts = MOCK_SHORTS.slice(0, mockShortsNeeded);
        setShorts([...availableShorts, ...mockShorts]);
      } else {
        setShorts(availableShorts.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching shorts:', error);
      setShorts(MOCK_SHORTS);
    } finally {
      setIsLoading(false);
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
      fetchVideos();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = message.trim();
    setMessage("");

    updateUserInterests(userMessage);
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
      setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update video player to only handle playback errors
  const renderVideoPlayer = (video: Video) => {
    const handleVideoError = () => {
      setVideoError(true);
    };

    const resetAndRetry = () => {
      setVideoError(false);
    };

    if (videoError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-t-lg p-4">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
          <p className="text-muted-foreground text-center mb-4">
            This video is currently unavailable. Please try another video.
          </p>
          <Button onClick={resetAndRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <iframe
        className="absolute inset-0 w-full h-full rounded-t-lg"
        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={handleVideoError}
        onLoad={() => setVideoError(false)}
      />
    );
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setVideoError(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24 min-h-screen w-full bg-background overflow-x-hidden">
        {/* Stories Section */}
        <div className="container mx-auto px-2 sm:px-4 mb-4 sm:mb-8">
          <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide snap-x snap-mandatory min-w-0">
            {shorts.map((short) => (
              <div 
                key={short.id} 
                className="flex flex-col items-center space-y-1 sm:space-y-2 cursor-pointer hover:scale-105 transition-transform flex-shrink-0 snap-start min-w-0"
                onClick={() => handleVideoClick(short)}
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-primary p-1 relative group min-w-0 overflow-hidden">
                  <img
                    src={short.thumbnail || 'https://placehold.co/80x80?text=No+Image'}
                    alt={short.title || 'Short'}
                    className="w-full h-full rounded-full object-cover min-w-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 sm:w-8 sm:h-8 text-white" />
                  </div>
                  {!short.isEmbeddable && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      <ExternalLink className="w-2 h-2" />
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-center line-clamp-1 w-14 sm:w-20 min-w-0">{short.title || 'Untitled'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Shorts Section */}
        <div className="container mx-auto px-2 sm:px-4 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 px-1 sm:px-2">Recommended Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 min-w-0">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="relative rounded-lg overflow-hidden group cursor-pointer shadow-sm min-w-0"
                onClick={() => handleVideoClick(video)}
              >
                <img
                  src={video.thumbnail || 'https://placehold.co/320x180?text=No+Image'}
                  alt={video.title || 'Video'}
                  className="w-full h-32 sm:h-48 object-cover transition-transform group-hover:scale-105 min-w-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                {!video.isEmbeddable && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-yellow-500 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-1">
                    <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">External</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-4 min-w-0">
                  <h3 className="text-white font-semibold line-clamp-2 text-xs sm:text-base min-w-0">{video.title || 'Untitled'}</h3>
                  <div className="flex items-center justify-between text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 min-w-0">
                    <span className="truncate max-w-[60%] text-[10px] sm:text-xs min-w-0">{video.channelTitle || 'Unknown'}</span>
                    <span className="text-[10px] sm:text-xs">{video.duration || '--:--'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-1 sm:p-4 overflow-y-auto max-h-screen">
            <div className="bg-background rounded-lg w-full max-w-4xl relative mx-1 sm:mx-0 max-h-[90vh] flex flex-col">
              <button 
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoError(false);
                }}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-background rounded-full p-1 sm:p-2 shadow-lg z-[10000] hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <div className="relative pt-[56.25%] w-full rounded-t-lg">
                {renderVideoPlayer(selectedVideo)}
              </div>
              <div className="p-2 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{selectedVideo.title}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                  <p className="text-xs sm:text-base text-muted-foreground">{selectedVideo.channelTitle}</p>
                  {!selectedVideo.isEmbeddable && (
                    <span className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-1">
                      <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">External link required</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chatbot Section */}
        <div className="container mx-auto px-2 sm:px-4 pb-24">
          <div className="bg-card rounded-lg shadow-lg p-2 sm:p-4 flex flex-col">
            <div className="flex items-center space-x-2 mb-2 sm:mb-4">
              <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-base sm:text-xl font-bold">Cooking Assistant</h2>
            </div>
            <div className="flex-1 min-h-[180px] max-h-[40vh] sm:max-h-[60vh] overflow-y-auto mb-2 sm:mb-4 space-y-2 sm:space-y-4 px-1 sm:px-0">
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
                      className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 text-xs sm:text-base ${
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
            <div className="flex flex-col xs:flex-row gap-2 w-full">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about cooking..."
                className="flex-1 text-xs sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading} size="icon" className="flex-shrink-0 w-full xs:w-auto">
                <Send className="w-3 h-3 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
};