import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ExpertType = "docker" | "terraform" | "kubernetes" | "github-actions" | "cicd";

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
    id: "docker",
    name: "Docker Expert",
    icon: Box,
    color: "#0db7ed",
    description: "Expert in containerization, Dockerfiles, and multi-stage builds.",
    prompt: "You are a Senior Docker Specialist. Your goal is to provide production-grade Dockerfiles, docker-compose.yml files, and containerization strategies. Always follow best practices: use small base images (alpine/distroless), optimize layer caching, avoid running as root, and use multi-stage builds. Provide code that is ready for production.",
    templates: [
      { label: "Node.js Multi-stage", prompt: "Create a production-ready multi-stage Dockerfile for a Node.js Express application." },
      { label: "Docker Compose Stack", prompt: "Generate a docker-compose.yml for a MERN stack with Nginx as a reverse proxy." },
      { label: "Python Alpine", prompt: "Create a minimized Python Dockerfile using Alpine for a FastAPI app." }
    ]
  },
  {
    id: "terraform",
    name: "Terraform Expert",
    icon: Cloud,
    color: "#844FBA",
    description: "IaC specialist for AWS, Azure, GCP, and reusable modules.",
    prompt: "You are a Principal Cloud Architect specializing in Terraform. Your code should be modular, secure, and follow the principle of least privilege. Always include variables.tf, main.tf, and outputs.tf structures. Focus on AWS/Azure/GCP best practices and state management.",
    templates: [
      { label: "AWS VPC & Subnets", prompt: "Generate Terraform code for a highly available AWS VPC with public and private subnets." },
      { label: "S3 Bucket Policy", prompt: "Create a secure S3 bucket with versioning and encryption enabled." },
      { label: "GCP Cloud Run", prompt: "Generate Terraform files to deploy a container to GCP Cloud Run." }
    ]
  },
  {
    id: "kubernetes",
    name: "K8s Expert",
    icon: Layers,
    color: "#326ce5",
    description: "Master of orchestrating containers with K8s manifests and Helm.",
    prompt: "You are a Kubernetes Engineer. Provide well-structured YAML manifests (Deployments, Services, ConfigMaps, Secrets, Ingress). Follow security standards: use resource limits/requests, liveness/readiness probes, and NetworkPolicies. Explain why certain configurations are used.",
    templates: [
      { label: "HA Deployment", prompt: "Create a Kubernetes Deployment manifest with 3 replicas, HPA, and resource limits." },
      { label: "Ingress Controller", prompt: "Generate an Nginx Ingress resource with TLS configuration." },
      { label: "Helm Chart Shell", prompt: "Show me the folder structure and main templates for a standard Helm chart." }
    ]
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    icon: Github,
    color: "#2088ff",
    description: "Automate your workflows with efficient CI/CD pipelines.",
    prompt: "You are a GitHub Actions Automation Specialist. Design efficient YAML workflows for CI/CD. Use official actions, implement caching, environment secrets, and matrix builds. Ensure workflows are fast and secure.",
    templates: [
      { label: "CI for Node.js", prompt: "Generate a GitHub Action workflow that runs tests and lints on every push." },
      { label: "Docker Build & Push", prompt: "Create a workflow to build a Docker image and push it to GHCR on tags." },
      { label: "CD to AWS/Azure", prompt: "Show a deployment workflow using OIDC for secure cloud access." }
    ]
  },
  {
    id: "cicd",
    name: "CI/CD Visionary",
    icon: Repeat,
    color: "#76b900",
    description: "Holistic CI/CD design, SLSA, and automated testing strategies.",
    prompt: "You are a DevOps Strategist. focus on the big picture of CI/CD. provide strategies for canary deployments, blue-green releases, and semantic versioning. Your advice should cover security, speed, and reliability of the entire lifecycle.",
    templates: [
      { label: "Canary Deployment", prompt: "Explain and provide a strategy for Canary Deployments using Argo Rollouts." },
      { label: "GitOps Workflow", prompt: "Design a GitOps architectural flow using Flux or ArgoCD." },
      { label: "Security Scanning", prompt: "Integrate Trivy and Snyk scanning into a standard CI pipeline." }
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with expert welcome
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `**Welcome to the NVIDIA AI DevOps Platform.**\n\nI am currently operating in **${currentExpert.name}** mode. ${currentExpert.description}\n\nHow can I build your infrastructure today?`
      }
    ]);
  }, [currentExpert]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
        
        // Keep the potentially incomplete last line in the buffer
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
              console.warn("Failed to parse SSE chunk:", trimmedLine, e);
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
          content: `Error: ${error.message}. Please verify your NVIDIA_API_KEY.`,
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
      
      // We need a stable ID for the copy button, but we don't have blockId here easily
      // So we'll use the code hash or content as a key for isCopied check
      // For simplicity, we just pass down to CodeBlockInternal
      
      return !inline ? (
        <CodeBlockInternal 
          language={language} 
          code={code} 
          onCopy={handleCopy} 
          onDownload={handleDownload}
          isCopied={copiedId !== null && copiedId.length > 0} // Simplification: any copy shows as copied briefly
        />
      ) : (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#76b900]" {...props}>
          {children}
        </code>
      );
    }, [copiedId, handleCopy, handleDownload]);

  return (
    <div className="flex h-screen bg-[#0b0c10] font-sans text-gray-100 overflow-hidden relative selection:bg-[#76b900]/30 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px] animate-slow-drift" 
          style={{ backgroundColor: currentExpert.color }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} 
        />
      </div>

      {/* Sidebar Tool Selection */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden lg:flex flex-col z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#76b900] flex items-center justify-center shadow-[0_0_30px_rgba(118,185,0,0.3)]">
              <Cpu className="text-black w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">DevOps NIM</h1>
              <p className="text-[10px] text-[#76b900] font-mono mt-1 font-bold uppercase tracking-wider">NVIDIA AI PLATFORM</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div>
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Engineering Experts</p>
            <div className="space-y-1.5">
              {EXPERTS.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => setCurrentExpert(expert)}
                  className={cn(
                    "w-full group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300",
                    currentExpert.id === expert.id 
                      ? "bg-white/10 border border-white/10 shadow-lg" 
                      : "hover:bg-white/5 border border-transparent hover:border-white/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                    currentExpert.id === expert.id ? "bg-white/10" : "bg-white/5"
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
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Quick Templates</p>
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

        <div className="p-6 mt-auto space-y-4">
          <div className="glass-card p-4 space-y-3 bg-[#76b900]/5 border-[#76b900]/10">
            <div className="flex items-center gap-2 text-[10px] text-[#76b900] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
               Enterprise Ready
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Generating production-style templates with NVIDIA NIM performance.
            </p>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-4">
              <a href="https://github.com/manisai901" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="mailto:manikantasaivootla@gmail.com" className="text-gray-500 hover:text-white transition-colors">
                <Mail size={18} />
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-gray-500">LIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Studio Area */}
      <main className="flex-1 flex flex-col z-20 bg-black/10">
        {/* Top Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="lg:hidden w-10 h-10 rounded-xl bg-[#76b900] flex items-center justify-center">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <currentExpert.icon className="w-5 h-5" style={{ color: currentExpert.color }} />
                <h2 className="text-xl font-bold tracking-tight">{currentExpert.name}</h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">MODE: PROD_GENERATOR</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>NEMOTRON-120B-A12B</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
               onClick={() => {
                 setMessages([{
                   id: "welcome",
                   role: "assistant",
                   content: `Expert mode reset. How can I assist with your **${currentExpert.name}** tasks?`
                 }]);
               }}
               className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"
               title="Clear Console"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#76b900] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#76b900]/20">
              <FileCode className="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        {/* Console / Chat Output */}
        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-10">
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-3",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-3 text-[10px] font-mono tracking-widest font-bold mb-1 uppercase",
                    m.role === "user" ? "flex-row-reverse text-blue-400" : "text-[#76b900]"
                  )}>
                    {m.role === "user" ? (
                      <>
                        <User className="w-3 h-3" />
                        ENGINEER_CMD
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        AI_OUTPUT :: {currentExpert.id.replace('-', '_')}
                      </>
                    )}
                  </div>

                  <div className={cn(
                    "max-w-[90%] p-6 rounded-2xl leading-relaxed text-sm md:text-base selection:bg-[#76b900]/60",
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
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-6 mt-8 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-4 mt-6 text-white border-b border-white/5 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-3 mt-4 text-white text-[#76b900]/80">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-[#76b900] bg-white/5 px-4 py-2 italic text-gray-400 my-4 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && !messages[messages.length-1].content && (
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest font-bold text-[#76b900] uppercase">
                  <Bot className="w-3 h-3 animate-pulse" />
                  EXECUTING_REQUEST...
                </div>
                <div className="w-full max-w-[400px] h-32 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              </div>
            )}
            <div ref={messagesEndRef} className="h-20" />
          </div>
        </div>

        {/* Input Control Center */}
        <div className="p-8 md:p-12 pt-0">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
              className="relative group lg:shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#76b900]/0 via-[#76b900]/20 to-[#76b900]/0 rounded-3xl blur-xl transition-all duration-1000 group-focus-within:opacity-100 opacity-0" />
              
              <div className="relative glass-card flex flex-col p-2 transition-all duration-300 focus-within:ring-1 focus-within:ring-[#76b900]/30 bg-black/60 border-white/10 overflow-hidden">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={`Describe the ${currentExpert.name.split(' ')[0]} configuration you need...`}
                  className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 resize-none h-24 md:h-28 text-sm md:text-base outline-none scrollbar-hide text-white placeholder-gray-600"
                />
                
                <div className="flex items-center justify-between px-3 pb-2">
                  <div className="flex items-center gap-2 px-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-500 font-mono">
                      <Terminal size={12} />
                      SHIFT+ENTER FOR NEW LINE
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 font-bold text-sm",
                      input.trim() && !isLoading
                        ? "bg-[#76b900] text-black shadow-lg shadow-[#76b900]/30 scale-100 hover:scale-105 active:scale-95"
                        : "bg-white/5 text-gray-500 cursor-not-allowed scale-100"
                    )}
                  >
                    <Send className="w-4 h-4" />
                    GENERATE
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-4 flex justify-center">
              <p className="text-[10px] text-gray-600 font-medium tracking-[0.1em] uppercase">
                Powered by NVIDIA NIM Cloud Acceleration & Grace Hopper GPUs
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Expert Selector Modal Placeholder */}
      {/* (In a real pro app we'd add a floating button for mobile screens to open the sidebar) */}
    </div>
  );
}
