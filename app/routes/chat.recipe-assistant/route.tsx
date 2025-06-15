import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { 
  ChefHat, 
  Upload, 
  Send, 
  Camera,
  Heart,
  Clock,
  Users,
  Utensils,
  Share2,
  Copy,
  Download,
  MessageCircle,
  Sparkles,
  Loader2,
  ShoppingCart,
  CookingPot
} from "lucide-react";
import { cn } from "~/lib/utils";
import { chatService, pb, type ChatMessage, type ChatSession } from "~/lib/pocketbase";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/header";
import { generateRecipeResponse } from "./ai-prompts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recipe Assistant - Your AI Kitchen Companion" },
    { name: "description", content: "Upload ingredients or describe what you have, and get personalized recipe suggestions from your AI chef assistant." },
  ];
}

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  imageUrl?: string;
  recipe?: Recipe;
};

type Recipe = {
  title: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  tips?: string;
};

export default function RecipeAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Create new session on first load if no current session
  useEffect(() => {
    if (!currentSession && sessions.length === 0 && !isLoading) {
      createNewSession();
    }
  }, [sessions]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const loadedSessions = await chatService.getSessions();
      // Filter for recipe assistant sessions
      const recipeSessions = loadedSessions.filter(s => s.title?.includes('Recipe'));
      setSessions(recipeSessions);
      if (recipeSessions.length > 0 && !currentSession) {
        await loadSession(recipeSessions[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (session: ChatSession) => {
    setIsLoading(true);
    try {
      setCurrentSession(session);
      const sessionMessages = await chatService.getMessages(session.id!);
      const convertedMessages: Message[] = sessionMessages.map(msg => {
        let recipe: Recipe | undefined;
        let displayContent = msg.content;
        
        // Try to parse recipe from content
        if (msg.content.includes('```json')) {
          const jsonMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            try {
              recipe = JSON.parse(jsonMatch[1]);
              displayContent = msg.content.replace(/```json\n[\s\S]*?\n```/, '').trim();
            } catch (e) {
              console.error('Failed to parse recipe from history:', e);
            }
          }
        }
        
        return {
          id: msg.id!,
          content: displayContent,
          sender: msg.sender === 'critic' ? 'assistant' : msg.sender as 'user' | 'assistant',
          timestamp: new Date(msg.timestamp),
          imageUrl: msg.image ? pb.files.getURL(msg, msg.image) : msg.imageUrl,
          recipe: recipe
        };
      });
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Failed to load session messages:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const session = await chatService.createSession('Recipe Session ' + new Date().toLocaleDateString());
      setCurrentSession(session);
      setSessions([session, ...sessions]);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Error", 
        description: "Failed to create new recipe session",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;
    if (!currentSession) {
      await createNewSession();
      return;
    }

    setIsSaving(true);
    setIsGenerating(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage || "Here are my ingredients",
      sender: "user",
      timestamp: new Date(),
      imageUrl: uploadedImage || undefined
    };

    // Update UI with user message immediately
    setMessages([...messages, userMessage]);
    setInputMessage("");
    setUploadedImage(null);
    setUploadedImageFile(null);

    try {
      // Generate AI response
      const aiResponse = await generateRecipeResponse(
        userMessage.content,
        !!uploadedImage
      );

      // Parse recipe if the response contains JSON
      let recipe: Recipe | undefined;
      let displayContent = aiResponse;
      
      if (aiResponse.includes('```json')) {
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            recipe = JSON.parse(jsonMatch[1]);
            // Remove the JSON block from the display content
            displayContent = aiResponse.replace(/```json\n[\s\S]*?\n```/, '').trim();
          } catch (e) {
            console.error('Failed to parse recipe JSON:', e);
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: displayContent,
        sender: "assistant",
        timestamp: new Date(),
        recipe: recipe
      };

      // Update UI with assistant response
      setMessages([...messages, userMessage, assistantMessage]);
      setIsGenerating(false);

      // Save to PocketBase in the background
      try {
        // Save user message with image if present
        const savedUserMessage = await chatService.saveMessage({
          content: userMessage.content,
          sender: userMessage.sender,
          timestamp: userMessage.timestamp.toISOString(),
          sessionId: currentSession.id!,
        }, uploadedImageFile || undefined);

        // If an image was uploaded, get its URL from the saved message
        if (uploadedImageFile && savedUserMessage.image) {
          userMessage.imageUrl = pb.files.getURL(savedUserMessage, savedUserMessage.image);
          setMessages(msgs => msgs.map(msg => 
            msg.id === userMessage.id ? { ...msg, imageUrl: userMessage.imageUrl } : msg
          ));
        }

        // Save assistant response (save full response including JSON for history)
        await chatService.saveMessage({
          content: aiResponse, // Save the full response with JSON
          sender: 'critic', // Using 'critic' to match existing schema
          timestamp: assistantMessage.timestamp.toISOString(),
          sessionId: currentSession.id!,
        });

        // Update session's last message
        await chatService.updateSessionLastMessage(currentSession.id!, 
          recipe ? `Recipe: ${recipe.title}` : assistantMessage.content.substring(0, 100)
        );
      } catch (saveError) {
        console.error('Failed to save messages:', saveError);
        toast({
          title: "Warning",
          description: "Recipe created but failed to save to history",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    const recipeText = `${recipe.title}\n\nServings: ${recipe.servings}\nPrep: ${recipe.prepTime} | Cook: ${recipe.cookTime}\n\nIngredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\nInstructions:\n${recipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}${recipe.tips ? `\n\nTips: ${recipe.tips}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipeText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(recipeText);
      toast({
        title: "Copied!",
        description: "Recipe copied to clipboard",
      });
    }
  };

  const downloadRecipe = (recipe: Recipe) => {
    const recipeText = `${recipe.title}\n\nServings: ${recipe.servings}\nPrep: ${recipe.prepTime} | Cook: ${recipe.cookTime}\n\nIngredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\nInstructions:\n${recipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}${recipe.tips ? `\n\nTips: ${recipe.tips}` : ''}`;
    
    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card className="mt-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">{recipe.title}</CardTitle>
            <div className="flex gap-4 mt-2 text-sm text-orange-700 dark:text-orange-300">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings} servings
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Prep: {recipe.prepTime}
              </div>
              <div className="flex items-center gap-1">
                <CookingPot className="h-4 w-4" />
                Cook: {recipe.cookTime}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => shareRecipe(recipe)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to clipboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadRecipe(recipe)}>
                <Download className="mr-2 h-4 w-4" />
                Download recipe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ingredients
          </h4>
          <ul className="space-y-1">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator className="bg-orange-200 dark:bg-orange-800" />
        
        <div>
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Instructions
          </h4>
          <ol className="space-y-2">
            {recipe.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="font-semibold text-orange-600 dark:text-orange-400 min-w-[24px]">{idx + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
        
        {recipe.tips && (
          <>
            <Separator className="bg-orange-200 dark:bg-orange-800" />
            <div className="bg-orange-100/50 dark:bg-orange-900/20 rounded-lg p-3">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <span className="italic">{recipe.tips}</span>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-4">
      <div className="max-w-6xl mx-auto space-y-6 mt-6">
        <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Recipe Assistant
                </CardTitle>
                <CardDescription className="text-lg">
                  Your AI kitchen companion - share ingredients, get delicious recipes!
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1 bg-orange-100 dark:bg-orange-900/30 border-orange-300">
                  <ChefHat className="h-3 w-3" />
                  AI Chef
                </Badge>
                <Badge variant="outline" className="gap-1 bg-amber-100 dark:bg-amber-900/30 border-amber-300">
                  <Heart className="h-3 w-3" />
                  Personalized
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-xl bg-white/95 dark:bg-slate-900/95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <MessageCircle className="h-5 w-5" />
                Kitchen Chat
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewSession}
                className="gap-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
              >
                <CookingPot className="h-4 w-4" />
                New Recipe Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ChefHat className="h-16 w-16 text-orange-300 dark:text-orange-700" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-orange-900 dark:text-orange-100">
                      Welcome to your kitchen assistant!
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Share a photo of your ingredients or describe what you have in your pantry, 
                      and I'll suggest delicious recipes you can make!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === "assistant" && (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                            <ChefHat className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-4",
                          message.sender === "user"
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        )}
                      >
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="Ingredients"
                            className="rounded-md mb-3 max-h-64 object-contain"
                          />
                        )}
                        {message.recipe ? (
                          <>
                            {message.content && (
                              <p className="text-sm whitespace-pre-wrap mb-4">{message.content}</p>
                            )}
                            <RecipeCard recipe={message.recipe} />
                          </>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      {message.sender === "user" && (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isGenerating && (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                          <ChefHat className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 max-w-[80%]">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">Chef is cooking up something special...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              {uploadedImage && (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="max-h-32 rounded-md border border-orange-200"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedImageFile(null);
                    }}
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe your ingredients or dietary preferences..."
                  className="min-h-[80px] resize-none bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 focus:border-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={(!inputMessage.trim() && !uploadedImage) || isSaving || isGenerating}
                  className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  {isSaving || isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isGenerating ? "Cooking..." : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <Sparkles className="h-5 w-5" />
              Cooking Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                Share clear photos of your ingredients for better recipe suggestions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                Mention dietary restrictions or preferences (vegetarian, gluten-free, etc.)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                Ask for specific cuisine types or cooking methods
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                Save and share your favorite recipes with friends and family
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    <Toaster />
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
    />
    </>
  );
}