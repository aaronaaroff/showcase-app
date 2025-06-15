# Showcase App - Modern Web Development Examples

A collection of AI-powered web applications built with React Router v7, shadcn/ui, and PocketBase. This showcase demonstrates modern web development practices with real-world applications.

## 🚀 Live Applications

### [Art Critic AI](/chat/art-critic)
Get constructive feedback on your artwork from various AI personalities with different artistic perspectives.

### More apps coming soon!
- Recipe Assistant - AI chef for cooking help
- Code Reviewer - Instant code reviews
- Analytics Dashboard - Data visualization
- Resume Builder - AI-powered resume creation
- JSON Formatter - Developer tools

## 🛠 Tech Stack

- **React Router v7** - Modern React framework with SSR
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **PocketBase** - Self-hosted backend as a service
- **Ollama** - Local AI for development
- **TypeScript** - Type-safe development

## 📦 Prerequisites

- Node.js 18+ and pnpm
- Git
- [Ollama](https://ollama.ai) (for AI features)

## 🚀 Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone [your-repo-url]
   cd showcase-app
   pnpm install
   ```

2. **Set up PocketBase**
   ```bash
   # Start PocketBase server
   cd pocketbase-server
   ./pocketbase serve
   
   # In a new terminal, set up collections
   node setup-collections.js
   ```
   
   Visit http://127.0.0.1:8090/_/ to create an admin account when prompted.

3. **Set up Ollama (for AI features)**
   ```bash
   # Install Ollama (macOS)
   brew install ollama
   
   # Start Ollama and download a model
   ollama pull llama3.2
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Open http://localhost:5173 to see the showcase app.

## 📁 Project Structure

```
showcase-app/
├── app/
│   ├── components/         # Shared UI components
│   ├── lib/               # Utilities and services
│   ├── routes/            # File-based routing
│   │   ├── _index.tsx     # Home page
│   │   └── chat.art-critic/    # Art Critic app
│   └── hooks/             # Custom React hooks
├── pocketbase-server/     # Backend setup
└── public/               # Static assets
```

## 🔧 Development

### Adding a New Showcase App

1. Create a new route following the naming convention:
   ```
   app/routes/[category].[app-name]/route.tsx
   ```

2. Use the shared components and services:
   - `Header` component for navigation
   - `aiService` for AI integration
   - `pb` client for database operations

3. Follow the established patterns from existing apps

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production build
- `pnpm typecheck` - Run TypeScript checks
- `pnpm lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please:
1. Follow the existing code style
2. Add TypeScript types
3. Update documentation
4. Test your changes

## 📄 License

MIT License - feel free to use this showcase for learning or as a starting point for your projects.

## 🔗 Resources

- [React Router Documentation](https://reactrouter.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Ollama Documentation](https://github.com/ollama/ollama)

---

For detailed project documentation, see [CLAUDE.md](./CLAUDE.md)