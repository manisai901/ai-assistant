# NVIDIA AI Assistant (Nemotron-3 Super 120B)

A modern, high-performance AI chat interface powered by NVIDIA's state-of-the-art Nemotron-3 Super 120B model via NVIDIA NIM APIs.

## 🚀 Architecture Overview

This application follows a robust Full-Stack SPA (Single Page Application) architecture:

### 1. Frontend (The User Interface)
- **React & TypeScript**: Modern functional components for high-speed interactivity.
- **Tailwind CSS**: Utility-first styling for a sleek, "NVIDIA-inspired" dark aesthetic.
- **Framer Motion**: Smooth, low-overhead UI animations (background drifts, message transitions) designed to be pleasant without impacting performance.
- **Lucide Icons**: Crisp, vector-based iconography.

### 2. Backend (The Secure API Proxy)
- **Node.js & Express**: A lightweight server that serves the static frontend and acts as a gateway.
- **API Proxy Pattern**: Instead of calling NVIDIA directly from the browser (which would expose your API key), the frontend talks to our Express server. The server then securely calls NVIDIA NIM, keeping your credentials safe.
- **Environment Management**: Utilizes secure environment variables for API key injection.

### 3. AI Core
- **NVIDIA NIM (Nemotron-3 Super 120B)**: Leverages the massive 120 billion parameter model optimized for logic, coding, and creative tasks.
- **Grace Hopper Optimized**: Performance-tuned for NVIDIA's latest enterprise architectures.

## ✨ Key Features

- **Pleasant Visual Environment**: A "cool" dark theme with a very slow, CPU-friendly background animation that mimics fluid dynamics.
- **Glassmorphism UI**: High-end glass-effect cards and blur filters for a premium feel.
- **Real-time Interaction**: Non-blocking message streaming simulations for a fluid chat experience.
- **Developer Info**: Integrated sidebar with GitHub and contact details for transparency.
- **Session Management**: Easy "New Session" capabilities to reset context.

## 🛠️ How It Works

1. **User input**: The user types a message in the text area.
2. **Request handling**: The message is sent to the local `/api/chat` endpoint.
3. **Secure relay**: The Express server retrieves the `NVIDIA_API_KEY` from the secure environment and forwards the request to `integrate.api.nvidia.com`.
4. **Processing**: The NVIDIA NIM model processes the history and generates a context-aware response.
5. **UI Update**: The response is relayed back to the React app, which statefully updates the chat history and triggers smooth entrance animations.

## 📦 Deployment

Optimized for **Render.com** using:
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Port**: 3000 (standard entry)
