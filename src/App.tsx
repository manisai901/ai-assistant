import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  Trash2, 
  Terminal,
  Cpu,
  ShieldCheck,
  Github,
  Mail,
  ExternalLink,
  Code2,
  Box,
  Layers,
  Repeat,
  Cloud,
  FileCode,
  Copy,
  Download,
  Check,
  Zap,
  Menu,
  X,
  MessageSquare,
  FileDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ExpertType = "docker" | "terraform" | "kubernetes" | "github-actions" | "cicd" | "general";

interface Expert {
  id: ExpertType;
  name: string;
  icon: any;
  prompt: string;
  description: string;
  color: string;
  templates: { label: string; prompt: string }[];
}

const EXPERTS: Expert[] = [
  {
    id: "general",
    name: "General Assistant",
    icon: MessageSquare,
    color: "#ffffff",
    description: "Your all-purpose assistant for questions, thoughts, and brainstorming.",
    prompt: "You are a highly capable AI assistant. You can help with general questions, brainstorming, writing, and any personal thoughts. Be helpful, concise, and clear.",
    templates: [
      { label: "Brainstorm Ideas", prompt: "Help me brainstorm 5 creative ideas for a new web application." },
      { label: "Explain a Concept", prompt: "Can you explain quantum computing in simple terms?" },
      { label: "Draft an Email", prompt: "Help me draft a professional email to my manager about a project update." }
    ]
  },
  {
    id: "docker",
    name: "Docker Expert",
    icon: Box,
    color: "#0db7ed",
    description: "Expert in containerization, Dockerfiles, and multi-stage builds.",
    prompt: "You are a Senior Docker Specialist. Your goal is to provide production-grade Dockerfiles, docker-compose.yml files, and containerization strategies. Always follow best practices: use small base images (alpine/distroless), optimize layer caching, avoid running as root, and use multi-stage builds.",
    templates: [
      { label: "Node.js Multi-stage", prompt: "Create a production-ready multi-stage Dockerfile for a Node.js Express application." },
      { label: "Docker Compose Stack", prompt: "Generate a docker-compose.yml for a MERN stack with Nginx as a reverse proxy." }
    ]
  },
  {
    id: "terraform",
    name: "Terraform Expert",
    icon: Cloud,
    color: "#844FBA",
    description: "IaC specialist for AWS, Azure, GCP, and reusable modules.",
    prompt: "You are a Principal Cloud Architect specializing in Terraform. Your code should be modular, secure, and follow the principle of least privilege. Always include variables.tf, main.tf, and outputs.tf structures.",
    templates: [
      { label: "AWS VPC & Subnets", prompt: "Generate Terraform code for a highly available AWS VPC with public and private subnets." },
      { label: "S3 Bucket Policy", prompt: "Create a secure S3 bucket with versioning and encryption enabled." }
    ]
  },
  {
    id: "kubernetes",
    name: "K8s Expert",
    icon: Layers,
    color: "#326ce5",
    description: "Master of orchestrating containers with K8s manifests and Helm.",
    prompt: "You are a Kubernetes Engineer. Provide well-structured YAML manifests (Deployments, Services, ConfigMaps, Secrets, Ingress). Follow security standards: use resource limits/requests.",
    templates: [
      { label: "HA Deployment", prompt: "Create a Kubernetes Deployment manifest with 3 replicas, HPA, and resource limits." },
      { label: "Ingress Controller", prompt: "Generate an Nginx Ingress resource with TLS configuration." }
    ]
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    icon: Github,
    color: "#2088ff",
    description: "Automate your workflows with efficient CI/CD pipelines.",
    prompt: "You are a GitHub Actions Automation Specialist. Design efficient YAML workflows for CI/CD. Use official actions, implement caching, and environment secrets.",
    templates: [
      { label: "CI for Node.js", prompt: "Generate a GitHub Action workflow that runs tests and lints on every push." },
      { label: "Docker Build & Push", prompt: "Create a workflow to build a Docker image and push it to GHCR on tags." }
    ]
  }
];

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
  onCopy: (text: string, id: string) => void;
  onDownload: (text: string, filename: string) => void;
  isCopied: boolean;
}

const CodeBlockInternal = ({ language, code, onCopy, onDownload, isCopied }: CodeBlockProps) => {
  const blockId = useRef(Math.random().toString(36).substring(2, 11)).current;

  return (
    <div className="relative my-6 group rounded-xl overflow-hidden border border-white/10 bg-black/40">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 font-mono">
          {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(code, blockId)}
            className="p-1 px-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-medium"
          >
            {isCopied ? <Check className="w-3 h-3 text-[#76b900]" /> : <Copy className="w-3 h-3" />}
            {isCopied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => onDownload(code, `generated-${language}-config`)}
            className="p-1 px-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-medium"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="!bg-transparent !m-0 !p-4 !text-sm scrollbar-hide"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default function App() {
  const [currentExpert, setCurrentExpert] = useState<Expert>(EXPERTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with expert welcome
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `**Welcome to the NVIDIA AI Assistant.**\n\nI am currently operating in **${currentExpert.name}** mode. ${currentExpert.description}\n\nHow can I build your infrastructure today?`
      }
    ]);
  }, [currentExpert]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleDownload = useCallback((text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, []);

  const handleExport = useCallback(async () => {
    const chatContainer = document.getElementById("chat-container");
    if (!chatContainer) return;

    try {
      setIsLoading(true);
      const canvas = await html2canvas(chatContainer, {
        backgroundColor: "#0b0c10",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`devops-studio-chat-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      // Fallback to basic PDF if canvas fails
      const doc = new jsPDF();
      doc.text("Export failed, please try again.", 20, 20);
      doc.save(`export-error-${Date.now()}.pdf`);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSubmit = async (userPrompt?: string) => {
    const textToSubmit = userPrompt || input;
    if (!textToSubmit.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSubmit,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    if (isSidebarOpen) setIsSidebarOpen(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: currentExpert.prompt },
            ...messages.filter(m => m.id !== "welcome").map(m => ({
              role: m.role === "error" ? "assistant" : m.role,
              content: m.content
            })),
            { role: "user", content: textToSubmit }
          ],
          stream: true
        }),
      });

      if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to communicate with NVIDIA API");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();
      let buffer = "";

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === "data: [DONE]") continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = trimmedLine.slice(6);
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0].delta?.content || "";
              if (delta) {
                assistantContent += delta;
                setMessages((prev) => prev.map(m => 
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                ));
              }
            } catch (e) {
              console.warn("SSE parse error", e);
            }
          }
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: `Error: ${error.message}. Please check your NVIDIA_API_KEY.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const CodeBlock = useCallback(({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";
    const code = String(children).replace(/\n$/, "");
    
    return !inline ? (
      <CodeBlockInternal 
        language={language} 
        code={code} 
        onCopy={handleCopy} 
        onDownload={handleDownload}
        isCopied={copiedId !== null} 
      />
    ) : (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#76b900]" {...props}>
        {children}
      </code>
    );
  }, [copiedId, handleCopy, handleDownload]);

  return (
    <div className="flex h-screen bg-[#050505] font-sans text-gray-100 overflow-hidden relative selection:bg-red-600/30 selection:text-white carbon-fiber">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 webbing-pattern opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 suit-mesh opacity-20" />
        <div className="lightning-flash animate-lightning" />
        
        {/* Subtle Pulse Glow over the background logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 blur-[120px] rounded-full animate-pulse-glow" />
        
        {/* Cinematic Atmospheric Lighting */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/5 via-transparent to-blue-600/5" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-soft-light" />
      </div>

      {/* Floating Lightning Bolts */}
      <div className="fixed top-20 left-10 text-yellow-400 opacity-20 animate-pulse text-4xl blur-sm">⚡</div>
      <div className="fixed bottom-20 right-10 text-blue-400 opacity-20 animate-pulse delay-700 text-4xl blur-sm">⚡</div>
      <div className="fixed top-1/2 right-20 text-red-500 opacity-10 animate-float text-6xl blur-md">⚡</div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-80 border-r border-white/5 bg-black/60 backdrop-blur-3xl z-40 lg:relative lg:translate-x-0 transition-transform duration-300 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#76b900] flex items-center justify-center">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white leading-none">DevOps Studio</h1>
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-[#76b900] font-mono mt-1 uppercase tracking-wider">Fast-Gen Enabled</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Select Mode</p>
            <div className="space-y-1.5">
              {EXPERTS.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => {
                    setCurrentExpert(expert);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300",
                    currentExpert.id === expert.id 
                      ? "bg-white/10 border border-white/10" 
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-white/5",
                    currentExpert.id === expert.id && "bg-white/10"
                  )}>
                    <expert.icon 
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                      style={{ color: currentExpert.id === expert.id ? expert.color : '#6b7280' }} 
                    />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "text-sm font-semibold transition-colors",
                      currentExpert.id === expert.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                    )}>{expert.name}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{expert.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Quick Starts</p>
            <div className="grid grid-cols-1 gap-2 px-2">
              {currentExpert.templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(template.prompt)}
                  className="text-left px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-400 hover:text-white transition-all flex items-center gap-2 group"
                >
                  <Zap className="w-3 h-3 text-[#76b900] opacity-50 group-hover:opacity-100" />
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <a href="https://github.com/manisai901" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white"><Github size={18} /></a>
              <a href="mailto:manikantasaivootla@gmail.com" className="text-gray-500 hover:text-white"><Mail size={18} /></a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-gray-500">LIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 z-20">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center">
                <currentExpert.icon className="w-4 h-4" style={{ color: currentExpert.color }} />
              </div>
              <h2 className="text-lg font-bold tracking-tight truncate">{currentExpert.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
               onClick={() => setMessages([{ id: "msg-123", role: "assistant", content: `Expert console reset. Operating in **${currentExpert.name}** mode.` }])}
               className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"
               title="Clear"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-[#76b900] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#76b900]/20"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        <div id="chat-container" className="flex-1 overflow-y-auto px-4 md:px-12 py-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col gap-3", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "flex items-center gap-3 text-[10px] font-mono tracking-widest font-bold mb-1 uppercase",
                    m.role === "user" ? "flex-row-reverse text-blue-400" : "text-[#76b900]"
                  )}>
                    {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                    {m.role === "user" ? "Engineer" : "NVIDIA_AI"}
                  </div>

                  <div className={cn(
                    "max-w-[95%] sm:max-w-[90%] p-5 md:p-6 rounded-2xl text-sm md:text-base leading-relaxed",
                    m.role === "assistant" 
                      ? "bg-white/5 border border-white/5 text-gray-200" 
                      : m.role === "error"
                        ? "bg-red-500/10 border border-red-500/20 text-red-200"
                        : "bg-blue-500/10 border border-blue-500/20 text-white font-medium"
                  )}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock,
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-4 mt-6 text-white border-b border-white/5 pb-2">{children}</h2>,
                        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(isLoading || (messages.length > 0 && messages[messages.length-1].content === "")) && (
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest font-bold text-[#76b900] uppercase">
                  <Bot className="w-3 h-3 animate-spin" />
                  Generating...
                </div>
                <div className="w-full max-w-[400px] h-32 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              </div>
            )}
            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        <div className="p-4 md:p-10 pt-0">
          <div className="max-w-4xl mx-auto relative group">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
              className="relative p-2 glass-card transition-all duration-300 focus-within:ring-1 focus-within:ring-[#76b900]/30 bg-black/60 border-white/10 overflow-hidden"
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
                placeholder={isLoading ? "AI is typing..." : "Message your specialized assistant..."}
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 resize-none h-20 md:h-24 text-sm md:text-base outline-none scrollbar-hide text-white placeholder-gray-600"
              />
              
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="hidden sm:flex items-center gap-2 px-3 text-[10px] text-gray-500 font-mono">
                  <Terminal size={12} />
                  ENTER TO SEND
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm",
                    input.trim() && !isLoading
                      ? "bg-[#76b900] text-black shadow-lg shadow-[#76b900]/20 hover:scale-105 active:scale-95"
                      : "bg-white/5 text-gray-600"
                  )}
                >
                  <Send className="w-4 h-4" />
                  GENERATE
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
