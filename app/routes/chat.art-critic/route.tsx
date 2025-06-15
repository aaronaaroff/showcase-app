import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Palette, Upload, Send, Sparkles, Brain, Zap, MessageSquare, History, Plus, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { chatService, pb, type ChatMessage, type ChatSession } from "~/lib/pocketbase";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/header";
import { generateArtCritique, type PersonalityType } from "./ai-prompts";

type Personality = {
  id: PersonalityType;
  name: string;
  description: string;
  avatar: string;
  color: string;
  traits: string[];
};

type Message = {
  id: string;
  content: string;
  sender: "user" | "critic";
  timestamp: Date;
  personality?: Personality;
  imageUrl?: string;
};

const personalities: Personality[] = [
  {
    id: "modernist",
    name: "The Modernist",
    description: "Sharp, contemporary, values innovation and breaking boundaries",
    avatar: "🎨",
    color: "bg-violet-500",
    traits: ["Avant-garde", "Progressive", "Conceptual"]
  },
  {
    id: "classicist",
    name: "The Classicist",
    description: "Traditional, values technique and historical context",
    avatar: "🏛️",
    color: "bg-amber-500",
    traits: ["Technical", "Historical", "Refined"]
  },
  {
    id: "expressionist",
    name: "The Expressionist",
    description: "Emotional, values feeling and personal expression",
    avatar: "🎭",
    color: "bg-rose-500",
    traits: ["Emotional", "Intuitive", "Raw"]
  },
  {
    id: "minimalist",
    name: "The Minimalist",
    description: "Less is more, values simplicity and essence",
    avatar: "⬜",
    color: "bg-slate-500",
    traits: ["Simple", "Essential", "Clean"]
  }
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Art Critic AI - Get Expert Feedback on Your Artwork" },
    { name: "description", content: "Upload your artwork and receive constructive criticism from AI art critics with different personalities and perspectives." },
  ];
}

export default function ArtCriticChat() {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>(personalities[0]);
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
      setSessions(loadedSessions);
      if (loadedSessions.length > 0 && !currentSession) {
        // Load the most recent session
        await loadSession(loadedSessions[0]);
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
      const convertedMessages: Message[] = sessionMessages.map(msg => ({
        id: msg.id!,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
        imageUrl: msg.image ? pb.files.getURL(msg, msg.image) : msg.imageUrl,
        personality: msg.personalityId ? personalities.find(p => p.id === msg.personalityId) : undefined
      }));
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Failed to load session messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await chatService.createSession('Art Critique - ' + new Date().toLocaleDateString());
      setCurrentSession(newSession);
      setSessions([newSession, ...sessions]);
      setMessages([
        {
          id: "welcome-" + newSession.id,
          content: "Welcome to the Art Critic Studio! Upload your artwork and I'll provide thoughtful critique from various perspectives.",
          sender: "critic",
          timestamp: new Date(),
          personality: personalities[0]
        }
      ]);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      content: inputMessage || "Here's my artwork for critique",
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
      const aiCritique = await generateArtCritique(
        userMessage.content,
        selectedPersonality.id,
        !!uploadedImage
      );

      const criticResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiCritique,
        sender: "critic",
        timestamp: new Date(),
        personality: selectedPersonality
      };

      // Update UI with critic response
      setMessages([...messages, userMessage, criticResponse]);
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
        // Update the message in the UI with the real URL
        setMessages(msgs => msgs.map(msg => 
          msg.id === userMessage.id ? { ...msg, imageUrl: userMessage.imageUrl } : msg
        ));
      }

      // Save critic response
      await chatService.saveMessage({
        content: criticResponse.content,
        sender: criticResponse.sender,
        timestamp: criticResponse.timestamp.toISOString(),
        sessionId: currentSession.id!,
        personalityId: criticResponse.personality?.id,
        personalityName: criticResponse.personality?.name,
        personalityAvatar: criticResponse.personality?.avatar,
        personalityColor: criticResponse.personality?.color
      });

      // Update session's last message
      await chatService.updateSessionLastMessage(currentSession.id!, criticResponse.content);
    } catch (saveError) {
      console.error('Failed to save messages:', saveError);
      toast({
        title: "Warning", 
        description: "Messages sent but failed to save to history",
        variant: "destructive"
      });
    }
    } catch (error) {
      console.error('Failed to generate critique:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate AI critique. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Store the file for upload
      setUploadedImageFile(file);
      
      // Create preview URL
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


  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6 mt-6">
        <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Art Critic Studio
                </CardTitle>
                <CardDescription className="text-lg">
                  Get expert critique from diverse artistic perspectives
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Brain className="h-3 w-3" />
                  Multi-Perspective
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Critique Session
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createNewSession}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Session
                    </Button>
                    <Select
                      value={currentSession?.id || ""}
                      onValueChange={(sessionId) => {
                        const session = sessions.find(s => s.id === sessionId);
                        if (session) loadSession(session);
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id!}>
                            {session.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                        {message.sender === "critic" && (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={cn(message.personality?.color, "text-white text-lg")}>
                              {message.personality?.avatar}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-4",
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.imageUrl && (
                            <img
                              src={message.imageUrl}
                              alt="Uploaded artwork"
                              className="rounded-md mb-3 max-h-64 object-contain"
                            />
                          )}
                          <p className="text-sm">{message.content}</p>
                          {message.sender === "critic" && message.personality && (
                            <p className="text-xs opacity-70 mt-2">
                              — {message.personality.name}
                            </p>
                          )}
                        </div>
                        {message.sender === "user" && (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {/* Typing indicator when AI is generating */}
                    {isGenerating && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(selectedPersonality.color, "text-white text-lg")}>
                            {selectedPersonality.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-xs opacity-70 mt-2">— {selectedPersonality.name} is thinking...</p>
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
                        className="max-h-32 rounded-md border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={() => setUploadedImage(null)}
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Describe your artwork or ask for specific feedback..."
                      className="min-h-[80px] resize-none"
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
                      className="gap-2"
                    >
                      {isSaving || isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isGenerating ? "Generating..." : "Send"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Select Critic Personality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPersonality.id} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-2 h-auto">
                    {personalities.map((personality) => (
                      <TabsTrigger
                        key={personality.id}
                        value={personality.id}
                        onClick={() => setSelectedPersonality(personality)}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-3"
                      >
                        <span className="text-2xl mr-2">{personality.avatar}</span>
                        <span className="hidden sm:inline">{personality.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {personalities.map((personality) => (
                    <TabsContent key={personality.id} value={personality.id} className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className={cn(personality.color, "text-white text-2xl")}>
                              {personality.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{personality.name}</h3>
                            <p className="text-sm text-muted-foreground">Art Critic</p>
                          </div>
                        </div>
                        <p className="text-sm">{personality.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {personality.traits.map((trait) => (
                            <Badge key={trait} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950 dark:to-pink-950 border-violet-200 dark:border-violet-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    Upload high-quality images for better critique
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    Try different personalities for diverse perspectives
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    Be specific about what feedback you're seeking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    Include context about your artistic intent
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
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