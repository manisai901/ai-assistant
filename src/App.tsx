import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  Settings, 
  Trash2, 
  Sparkles,
  Terminal,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Info,
  Github,
  Mail,
  ExternalLink
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your NVIDIA AI Assistant powered by Nemotron-3 Super 120B. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role === "error" ? "assistant" : m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with NVIDIA API");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: `Error: ${error.message}. Please ensure NVIDIA_API_KEY is configured.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat cleared. I am ready for your next question."
      }
    ]);
  };

  return (
    <div className="flex h-screen bg-[#0b0c10] font-sans text-gray-100 overflow-hidden relative">
      {/* Background Decorative Element - Pleasant & Cool Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#76b900]/5 blur-[120px] animate-slow-drift" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px] animate-slow-drift" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[130px] animate-slow-drift" style={{ animationDuration: '45s' }} />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/20 backdrop-blur-md hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#76b900] flex items-center justify-center">
            <Cpu className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white">NVIDIA NIM</h1>
            <p className="text-xs text-gray-400">Nemotron-3 Super</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button 
            onClick={clearChat}
            className="w-full h-12 flex items-center gap-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
          >
            <Plus className="w-4 h-4 text-[#76b900] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">New Session</span>
          </button>
          
          <div className="pt-6">
            <p className="px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Model Capabilities</p>
            <div className="space-y-1">
              {[
                { icon: Terminal, label: "Code Analysis" },
                { icon: Sparkles, label: "Creative Writing" },
                { icon: ShieldCheck, label: "Precise Logic" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400">
                  <item.icon className="w-4 h-4 text-[#76b900]/60" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#76b900]">
              <User className="w-3 h-3" />
              <span className="font-bold italic uppercase tracking-tighter">Developer info</span>
            </div>
            <div className="space-y-2">
              <a 
                href="https://github.com/manisai901" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group"
              >
                <Github className="w-3.5 h-3.5 group-hover:text-[#76b900]" />
                <span className="truncate">manisai901</span>
                <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100" />
              </a>
              <a 
                href="mailto:manikantasaivootla@gmail.com" 
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 group-hover:text-[#76b900]" />
                <span className="truncate">manikantasaivootla@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#76b900]">
              <Info className="w-3 h-3" />
              <span className="font-bold italic uppercase tracking-tighter">System Status</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Compute Node</span>
              <span className="text-white font-mono uppercase tracking-tighter">H100-Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-black/10 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 rounded bg-[#76b900] flex items-center justify-center">
              <Cpu className="text-black w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-gray-400">Chat with</span>
              <span className="text-[#76b900] underline underline-offset-4 decoration-2 decoration-[#76b900]/30">Nemotron-120B</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={clearChat}
              className="p-2.5 rounded-full hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
              title="Clear Chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 md:gap-6 ${m.role === "assistant" ? "flex-row" : "flex-row-reverse text-right"}`}
                  id={m.id}
                >
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    m.role === "assistant" 
                      ? "bg-[#76b900] shadow-[0_0_20px_rgba(118,185,0,0.2)]" 
                      : m.role === "error"
                        ? "bg-red-500"
                        : "bg-white/10"
                  }`}>
                    {m.role === "assistant" ? (
                      <Bot className="text-black w-6 h-6" />
                    ) : m.role === "error" ? (
                      <Info className="text-white w-6 h-6" />
                    ) : (
                      <User className="text-white w-6 h-6" />
                    )}
                  </div>
                  
                  <div className={`flex-1 space-y-2 max-w-[85%]`}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 mix-blend-plus-lighter">
                      {m.role === "assistant" ? "Nemotron-3" : "Operator"}
                    </div>
                    <div className={`p-5 rounded-2xl shadow-xl text-sm md:text-base leading-relaxed ${
                      m.role === "assistant" 
                        ? "bg-white/5 border border-white/5 text-gray-100" 
                        : m.role === "error"
                          ? "bg-red-500/10 border border-red-500/20 text-red-200"
                          : "bg-[#76b900]/10 border border-[#76b900]/20 text-white"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[#76b900] flex items-center justify-center animate-pulse">
                  <Bot className="text-black w-6 h-6" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-10 px-2 opacity-50">
                  <div className="w-1.5 h-1.5 bg-[#76b900] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-[#76b900] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#76b900] rounded-full animate-bounce" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 md:pt-4">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-[#76b900]/20 blur-2xl group-focus-within:bg-[#76b900]/30 transition-all opacity-0 group-focus-within:opacity-100 pointer-events-none" />
            
            <form 
              onSubmit={handleSubmit}
              className="relative glass-card overflow-hidden flex items-center transition-all focus-within:ring-2 focus-within:ring-[#76b900]/50"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Message Nemotron-120B..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 resize-none h-14 md:h-16 text-sm md:text-base outline-none scrollbar-hide"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`mr-4 p-2.5 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? "bg-[#76b900] text-black hover:scale-105 active:scale-95 shadow-lg shadow-[#76b900]/20"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2 px-1">
                  <Send className="w-5 h-5" />
                </div>
              </button>
            </form>
            
            <div className="mt-3 flex justify-between items-center px-2">
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  NVIDIA CLOUD ENGINE ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-gray-600 font-medium">
                Optimized for NVIDIA Grace Hopper Architecture
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
