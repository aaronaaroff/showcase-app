# Showcase App - Project Overview

## Vision
A modern web application showcasing different AI-powered tools and interfaces, built with React Router, shadcn/ui components, and Tailwind CSS. The app serves as a portfolio of various web applications demonstrating best practices in modern web development.

## Tech Stack
- **Frontend Framework**: React Router v7 with TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS with custom theme
- **Backend**: PocketBase (self-hosted)
- **AI Integration**: Ollama (development) with flexible provider architecture
- **File Routing**: React Router file-system based routing

## Project Structure
```
showcase-app/
├── app/
│   ├── components/         # Shared UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Layout components (Header, etc.)
│   ├── lib/               # Shared utilities and services
│   │   ├── ai.ts          # Reusable AI service layer
│   │   ├── pocketbase.ts  # PocketBase client and services
│   │   └── utils.ts       # Utility functions
│   ├── routes/            # File-based routing
│   │   ├── _index.tsx     # Home page
│   │   ├── chat.art-critic/    # Art Critic chatbot
│   │   │   ├── route.tsx       # Main component
│   │   │   └── ai-prompts.ts  # AI personality prompts
│   │   └── api.ai.generate.ts # AI generation API route
│   └── hooks/             # Custom React hooks
├── pocketbase-server/     # PocketBase setup and config
└── public/               # Static assets
```

## Route Naming Convention
Routes follow the pattern: `[category].[app-name]/route.tsx`
- **Categories**: chat, dashboard, generator, tool
- **Examples**: 
  - `/chat/art-critic` - AI art critique chatbot
  - `/dashboard/analytics` - Data visualization dashboard
  - `/generator/resume-builder` - Resume generation tool
  - `/tool/json-formatter` - JSON formatting utility

## Current Applications

### 1. Art Critic AI (`/chat/art-critic`)
An AI-powered art critique chatbot featuring:
- Multiple AI personalities (Modernist, Classicist, Expressionist, Minimalist)
- Image upload support with PocketBase file storage
- Chat history persistence
- Real-time AI responses via Ollama
- Session management

## Development Setup

### Prerequisites
1. Node.js 18+ and pnpm
2. PocketBase binary
3. Ollama installed locally

### Installation
```bash
# Install dependencies
pnpm install

# Start PocketBase (in pocketbase-server directory)
./pocketbase serve

# Set up collections (first time only)
node pocketbase-server/setup-collections.js

# Install and run Ollama
# macOS: brew install ollama
# Start Ollama and pull a model
ollama pull llama3.2

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Environment Variables
```env
# PocketBase Configuration
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Ollama AI Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Design Principles
1. **Consistent UI/UX**: All apps share common components and design patterns
2. **Modular Architecture**: Each showcase app is self-contained in its route folder
3. **Reusable Services**: Shared AI and database services for all apps
4. **Progressive Enhancement**: Apps work with fallbacks when services are unavailable
5. **Type Safety**: Full TypeScript coverage with strict types

## Future Roadmap
- [ ] Add more showcase applications:
  - Recipe Assistant (chat)
  - Code Reviewer (chat)
  - Analytics Dashboard (dashboard)
  - Resume Builder (generator)
  - JSON Formatter (tool)
- [ ] Implement production AI providers (OpenAI, Anthropic)
- [ ] Add user authentication system
- [ ] Deploy to production environment
- [ ] Create API documentation
- [ ] Add testing suite

## Contributing
When adding new showcase applications:
1. Follow the established route naming convention
2. Reuse existing UI components and services
3. Maintain consistent design patterns
4. Add appropriate TypeScript types
5. Update this documentation

## Notes
- PocketBase collections are defined in `pocketbase-server/setup-collections.js`
- AI prompts for each app should be co-located with the app's route
- Use the shared Header component for consistent navigation
- Leverage the AI service layer for any AI-powered features