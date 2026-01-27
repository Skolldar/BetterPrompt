# BetterPrompt 🚀

A simple web application that helps you improve your AI prompts. Instead of struggling with unclear or ineffective prompts, BetterPrompt takes your rough idea and transforms it into a clear, detailed, and effective prompt for AI interactions.
[![Screenshot-from-2026-01-27-11-44-25.png](https://i.postimg.cc/T3JjLPtn/Screenshot-from-2026-01-27-11-44-25.png)](https://postimg.cc/213LgCR5)

## What It Does

BetterPrompt is a prompt enhancement tool that:
- Takes your basic prompt or idea as input
- Uses AI to refine and improve it into a clear, detailed prompt
- Provides real-time streaming of the improved prompt
- Includes built-in guardrails to ensure it's only used for prompt improvement (not for answering questions or other tasks)



## Features

- ✨ **AI-Powered Enhancement**: Uses OpenRouter's LFM model to improve your prompts
- 🔒 **Safety Guardrails**: Validates input to prevent misuse and prompt injection attempts
- 📋 **One-Click Copy**: Easily copy the improved prompt to your clipboard
- ⚡ **Real-Time Streaming**: See the improved prompt generate in real-time
- 🎨 **Clean UI**: Simple, intuitive interface built with React and Tailwind CSS
- 🔔 **Toast Notifications**: User-friendly feedback for actions and errors

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **AI Integration**: OpenRouter AI SDK with streaming support
- **Routing**: React Router v7
- **Notifications**: React Toastify
- **Markdown Rendering**: React Markdown

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- An OpenRouter API key (set as an environment variable)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd BetterPrompt
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory and add your OpenRouter API key:
```
VITE_OPENROUTER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
BetterPrompt/
├── src/
│   ├── components/          # React components (currently empty)
│   ├── lib/
│   │   └── ai.ts           # OpenRouter configuration
│   ├── services/
│   │   └── AIService.ts    # AI prompt generation service
│   ├── stores/
│   │   └── aiState.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── router.tsx          # React Router configuration
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## How It Works

1. **User Input**: Users enter their rough prompt or idea (10-500 characters)
2. **Validation**: The app validates the input to ensure it's appropriate for prompt improvement
3. **AI Processing**: The prompt is sent to OpenRouter's LFM model with specific instructions
4. **Streaming Response**: The improved prompt streams back in real-time
5. **Copy & Use**: Users can copy the improved prompt to use with other AI tools

## Safety Features

BetterPrompt includes several guardrails to prevent misuse:
- Rejects direct questions that aren't about prompt improvement
- Blocks prompt injection attempts
- Validates input length and content
- System prompts enforce prompt-improvement-only behavior
