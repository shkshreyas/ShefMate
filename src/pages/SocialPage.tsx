import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  Camera, 
  Send,
  MoreHorizontal,
  Bookmark,
  Flag,
  Clock,
  MapPin,
  Star,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, getDocs, query, orderBy, limit, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/uploadImage';
import { useClerk } from '@clerk/clerk-react';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  imageUrl?: string;
  recipe?: {
    title: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: number;
    difficulty: string;
    cuisine: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: any;
  location?: string;
  tags: string[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  createdAt: any;
}

export default function SocialPage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recipeMode, setRecipeMode] = useState(false);
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: 30,
    difficulty: 'Easy',
    cuisine: 'Indian'
  });
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  // Load posts in real-time
  useEffect(() => {
    const postsRef = collection(db, 'social_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.trim()) return;

    setIsUploading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, 'social-posts');
      }

      const postData: Omit<Post, 'id'> = {
        userId: user.id,
        userName: user.fullName || user.username || 'Anonymous',
        userImage: user.imageUrl || '',
        content: newPost,
        imageUrl,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        tags: extractTags(newPost),
        ...(recipeMode && recipe.title && {
          recipe: {
            title: recipe.title,
            ingredients: recipe.ingredients.filter(i => i.trim()),
            instructions: recipe.instructions.filter(i => i.trim()),
            cookingTime: recipe.cookingTime,
            difficulty: recipe.difficulty,
            cuisine: recipe.cuisine
          }
        })
      };

      await addDoc(collection(db, 'social_posts'), postData);
      
      // Reset form
      setNewPost('');
      setSelectedImage(null);
      setImagePreview('');
      setRecipeMode(false);
      setRecipe({
        title: '',
        ingredients: [''],
        instructions: [''],
        cookingTime: 30,
        difficulty: 'Easy',
        cuisine: 'Indian'
      });
      setIsCreatingPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const postRef = doc(db, 'social_posts', postId);
    const post = posts.find(p => p.id === postId);
    
    if (post?.likes.includes(user.id)) {
      await updateDoc(postRef, {
        likes: arrayRemove(user.id)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(user.id)
      });
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName || user.username || 'Anonymous',
      userImage: user.imageUrl || '',
      content: commentText[postId],
      createdAt: serverTimestamp()
    };

    const postRef = doc(db, 'social_posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });

    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const extractTags = (text: string): string[] => {
    const hashtags = text.match(/#[\w]+/g);
    return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
  };

  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => i === index ? value : item)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((item, i) => i === index ? value : item)
    }));
  };

  const handleOpenCreatePost = () => {
    if (!user && isLoaded) {
      clerk.openSignIn();
      return;
    }
    setIsCreatingPost(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ShefMate Social
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect with food lovers</p>
            </div>
            <Button 
              onClick={() => navigate('/social/learn')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Learn</span>
            </Button>
          </div>
          <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
            <Button size="icon" onClick={handleOpenCreatePost} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-8 w-8 sm:h-10 sm:w-10">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">Share your culinary journey</p>
                  </div>
                </div>

                <Textarea
                  placeholder="What's cooking today? Share your recipe or cooking experience..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px]"
                />

                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Photo
                      </span>
                    </Button>
                  </label>
                  <Button
                    variant={recipeMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecipeMode(!recipeMode)}
                  >
                    Recipe Mode
                  </Button>
                </div>

                {recipeMode && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <Input
                      placeholder="Recipe Title"
                      value={recipe.title}
                      onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ingredients</label>
                      {recipe.ingredients.map((ingredient, index) => (
                        <Input
                          key={index}
                          placeholder={`Ingredient ${index + 1}`}
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                        />
                      ))}
                      <Button variant="outline" size="sm" onClick={addIngredient}>
                        + Add Ingredient
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instructions</label>
                      {recipe.instructions.map((instruction, index) => (
                        <Textarea
                          key={index}
                          placeholder={`Step ${index + 1}`}
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                        />
                      ))}
                      <Button variant="outline" size="sm" onClick={addInstruction}>
                        + Add Step
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Cooking time (min)"
                        value={recipe.cookingTime}
                        onChange={(e) => setRecipe(prev => ({ ...prev, cookingTime: parseInt(e.target.value) || 0 }))}
                      />
                      <select
                        value={recipe.difficulty}
                        onChange={(e) => setRecipe(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <Input
                        placeholder="Cuisine"
                        value={recipe.cuisine}
                        onChange={(e) => setRecipe(prev => ({ ...prev, cuisine: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreatePost}
                  disabled={isUploading || !newPost.trim()}
                  className="w-full"
                >
                  {isUploading ? 'Posting...' : 'Share Post'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-md mx-auto pb-20 bg-white rounded-t-xl shadow-lg">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="mb-3 sm:mb-4 border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={post.userImage} />
                        <AvatarFallback className="text-xs sm:text-sm">{post.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{post.userName}</p>
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{formatTimeAgo(post.createdAt)}</span>
                          {post.location && (
                            <>
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{post.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-3 sm:px-4">
                  <p className="text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-48 sm:h-64 object-cover rounded-lg mb-2 sm:mb-3"
                    />
                  )}

                  {post.recipe && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-4 w-4 text-orange-500" />
                        <h3 className="font-medium text-orange-900 text-sm">{post.recipe.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-orange-700 mb-2">
                        <span className="flex items-center gap-1">
                          <span className="text-orange-500">⏱️</span>
                          <span>{post.recipe.cookingTime} min</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-orange-500">📊</span>
                          <span>{post.recipe.difficulty}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-orange-500">🌍</span>
                          <span>{post.recipe.cuisine}</span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-orange-800 mb-1">Ingredients:</p>
                        <p className="text-xs text-orange-700 line-clamp-2">
                          {post.recipe.ingredients.slice(0, 3).join(', ')}
                          {post.recipe.ingredients.length > 3 && '...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 px-3 sm:px-4">
                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 h-8 px-2 ${
                            post.likes.includes(user?.id || '') ? 'text-red-500' : ''
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${
                            post.likes.includes(user?.id || '') ? 'fill-current' : ''
                          }`} />
                          <span className="text-xs">{post.likes.length}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="flex items-center space-x-1 h-8 px-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">{post.comments.length}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 px-2">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>

                    {showComments[post.id] && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-2">
                              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                                <AvatarImage src={comment.userImage} />
                                <AvatarFallback className="text-xs">{comment.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-gray-50 rounded-lg p-2 min-w-0">
                                <p className="text-xs font-medium truncate">{comment.userName}</p>
                                <p className="text-xs break-words">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Add a comment..."
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="flex-1 text-xs h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            className="h-8 w-8 p-0"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share your culinary journey!</p>
          </div>
        )}
      </div>
    </div>
  );
} 