import { useState, useRef } from "react";
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
import { Palette, Upload, Send, Sparkles, Brain, Zap, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";

type Personality = {
  id: string;
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

export default function ArtCriticChat() {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>(personalities[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to the Art Critic Studio! Upload your artwork and I'll provide thoughtful critique from various perspectives.",
      sender: "critic",
      timestamp: new Date(),
      personality: personalities[0]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sendMessage = () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage || "Here's my artwork for critique",
      sender: "user",
      timestamp: new Date(),
      imageUrl: uploadedImage || undefined
    };

    const criticResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: getCriticResponse(selectedPersonality),
      sender: "critic",
      timestamp: new Date(),
      personality: selectedPersonality
    };

    setMessages([...messages, userMessage, criticResponse]);
    setInputMessage("");
    setUploadedImage(null);
  };

  const getCriticResponse = (personality: Personality) => {
    const responses = {
      modernist: "This piece challenges conventional boundaries with its bold approach. The composition speaks to contemporary anxieties while pushing the medium forward. Consider how the negative space might further amplify your conceptual framework.",
      classicist: "The technical execution shows promise, though I notice some areas where traditional principles could strengthen the work. The color harmony references the masters, yet your unique voice emerges. Study the golden ratio to enhance compositional balance.",
      expressionist: "Raw emotion pulses through every brushstroke! This work screams authenticity and vulnerability. The chaos speaks volumes, but don't lose sight of the viewer's emotional journey. Push harder into the darkness - that's where truth lives.",
      minimalist: "Less truly becomes more here. The restraint is admirable, though one questions if further reduction might crystallize your intent. Each element must justify its existence. Consider: what remains when everything unnecessary falls away?"
    };
    return responses[personality.id as keyof typeof responses] || "Interesting work!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Critique Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
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
                  </div>
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
                      disabled={!inputMessage.trim() && !uploadedImage}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
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
  );
}