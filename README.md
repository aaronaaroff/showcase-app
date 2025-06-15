# AI Art Critic Showcase App

A modern React Router application featuring an AI-powered art critique chat interface with PocketBase backend integration.

## Features

- 🎨 AI Art Critic Chat Interface with multiple critic personalities
- 💾 PocketBase integration for chat history persistence
- 🎯 shadcn/ui component library (all components installed)
- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS v4 for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Prerequisites

1. **PocketBase Setup**
   
   PocketBase is already included in the project. To start it:
   
   ```bash
   # Start PocketBase (from project root)
   cd pocketbase-server
   ./pocketbase serve
   ```
   
   PocketBase will run at `http://127.0.0.1:8090`
   
   First time setup:
   - Visit `http://127.0.0.1:8090/_/` to create your admin account
   - Use the provided setup link in the terminal output

2. **Configure PocketBase Collections**
   
   After creating your admin account:
   
   a. **Manual Setup**: Follow the instructions by running:
   ```bash
   node pocketbase-server/setup-collections.js
   ```
   
   b. **Or Import Schema**: In PocketBase Admin > Settings > Import Collections, upload:
   ```
   pocketbase-server/pb_schema.json
   ```
   
   The following collections will be created:
   
   **chat_sessions**
   - `title` (text, required)
   - `userId` (text, required)
   - `lastMessage` (text, optional)
   
   **chat_messages**
   - `content` (text, required)
   - `sender` (select: user, critic)
   - `timestamp` (text, required)
   - `sessionId` (text, required)
   - `personalityId` (text, optional)
   - `personalityName` (text, optional)
   - `personalityAvatar` (text, optional)
   - `personalityColor` (text, optional)
   - `imageUrl` (text, optional)

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

### Environment Variables (Optional)

Create a `.env` file to customize the PocketBase URL:

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

Note: Vite requires environment variables to be prefixed with `VITE_` to be accessible in the browser.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm run build`

```
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

**Note:** Remember to also deploy your PocketBase instance for the backend.

## App Features

### AI Art Critic Chat (/chat.art-critic)

An interactive chat interface where users can:
- Upload artwork images for critique
- Select from 4 distinct AI critic personalities:
  - **The Modernist** - Values innovation and contemporary expression
  - **The Classicist** - Focuses on traditional techniques and historical context
  - **The Expressionist** - Emphasizes emotion and personal expression
  - **The Minimalist** - Advocates for simplicity and essential elements
- Chat sessions are automatically saved to PocketBase
- Switch between multiple chat sessions
- Full chat history persistence

## Styling

This app uses:
- [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- Custom gradient backgrounds and glass-morphism effects

---

Built with ❤️ using React Router, shadcn/ui, and PocketBase.
