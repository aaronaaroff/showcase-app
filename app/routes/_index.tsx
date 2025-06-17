import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Sparkles, 
  Wrench,
  ArrowRight,
  Github,
  Palette,
  Brain,
  ChefHat,
  Code,
  BarChart3,
  FileJson,
  FileText,
  Music
} from "lucide-react";

export function meta() {
  return [
    { title: "Showcase App - Modern Web Development Examples" },
    { name: "description", content: "A collection of modern web applications built with React Router, shadcn/ui, and AI integration" },
  ];
}

type ShowcaseItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "chat" | "dashboard" | "generator" | "tool";
  status: "live" | "coming-soon";
  tags: string[];
};

const showcaseItems: ShowcaseItem[] = [
  {
    title: "Art Critic AI",
    description: "Get constructive feedback on your artwork from various AI personalities with different artistic perspectives.",
    href: "/chat/art-critic",
    icon: Palette,
    category: "chat",
    status: "live",
    tags: ["AI", "Chat", "Image Upload", "PocketBase"]
  },
  {
    title: "Recipe Assistant",
    description: "An AI chef that helps you create recipes based on ingredients you have and dietary preferences.",
    href: "/chat/recipe-assistant",
    icon: ChefHat,
    category: "chat",
    status: "live",
    tags: ["AI", "Chat", "Cooking", "Image Upload"]
  },
  {
    title: "Code Reviewer",
    description: "Get instant code reviews with suggestions for improvements, security issues, and best practices.",
    href: "/chat/code-reviewer",
    icon: Code,
    category: "chat",
    status: "coming-soon",
    tags: ["AI", "Chat", "Development"]
  },
  {
    title: "Analytics Dashboard",
    description: "Interactive data visualization dashboard showcasing charts, graphs, and real-time metrics.",
    href: "/dashboard/analytics",
    icon: BarChart3,
    category: "dashboard",
    status: "coming-soon",
    tags: ["Charts", "Data", "Real-time"]
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with AI-powered content suggestions and multiple templates.",
    href: "/generator/resume-builder",
    icon: FileText,
    category: "generator",
    status: "live",
    tags: ["AI", "Templates", "ATS-Optimized"]
  },
  {
    title: "Song Masher",
    description: "Blend audio tracks into groovy mashups or create seamless playlists with funky controls and visualizations.",
    href: "/tool/song-masher",
    icon: Music,
    category: "tool",
    status: "live",
    tags: ["Audio", "Mixing", "Visualizer", "Music"]
  },
  {
    title: "JSON Formatter",
    description: "Format, validate, and transform JSON data with syntax highlighting and error detection.",
    href: "/tool/json-formatter",
    icon: FileJson,
    category: "tool",
    status: "coming-soon",
    tags: ["Utility", "Developer", "Formatter"]
  }
];

const categoryConfig = {
  chat: { 
    label: "Chatbots", 
    icon: MessageSquare,
    color: "bg-blue-500"
  },
  dashboard: { 
    label: "Dashboards", 
    icon: LayoutDashboard,
    color: "bg-green-500"
  },
  generator: { 
    label: "Generators", 
    icon: Sparkles,
    color: "bg-purple-500"
  },
  tool: { 
    label: "Tools", 
    icon: Wrench,
    color: "bg-orange-500"
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Showcase App</h1>
                <p className="text-sm text-muted-foreground">Modern Web Development Examples</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Explore Modern Web Applications
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A curated collection of web applications showcasing React Router, shadcn/ui components, 
            AI integration, and modern development practices. Each example is production-ready and 
            built with best practices in mind.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">React Router v7</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">PocketBase</Badge>
            <Badge variant="secondary">AI Integration</Badge>
          </div>
        </div>
      </section>

      {/* Showcase Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showcaseItems.map((item) => {
            const CategoryIcon = categoryConfig[item.category].icon;
            const ItemIcon = item.icon;
            
            return (
              <Card 
                key={item.href}
                className={`group relative overflow-hidden transition-all hover:shadow-lg ${
                  item.status === "coming-soon" ? "opacity-75" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <ItemIcon className="h-8 w-8 text-primary" />
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${categoryConfig[item.category].color} text-white`}
                      >
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {categoryConfig[item.category].label}
                      </Badge>
                      {item.status === "coming-soon" && (
                        <Badge variant="outline">Coming Soon</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {item.status === "live" ? (
                    <Button asChild className="w-full group">
                      <Link to={item.href}>
                        View Demo
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using React Router, shadcn/ui, and modern web technologies
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Documentation</a>
              <span>•</span>
              <a href="#" className="hover:text-primary">Contributing</a>
              <span>•</span>
              <a href="#" className="hover:text-primary">License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}