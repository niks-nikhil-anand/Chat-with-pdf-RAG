"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  SendHorizonal,
  User,
  Bot,
  Sparkles,
  StopCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface ApiResponse {
  aiContent?: {
    kwargs?: {
      content?: string;
    };
  };
  similaritySearchResults?: {
    pageContent: string;
    metadata: {
      source: string;
      loc?: {
        pageNumber?: number;
      };
    };
  }[];
  error?: string;
}

const ChatArea: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMsg = message;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setMessage("");

    try {
      setLoading(true);

      // Add temporary typing bubble
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      const res = await axios.post<ApiResponse>("http://localhost:8000/chat", {
        query: userMsg,
      });

      const aiResponse =
        res.data.aiContent?.kwargs?.content || "No response from AI.";
      const sources =
        res.data.similaritySearchResults?.map((doc) => {
          const pdfName = doc.metadata.source.split("/").pop();
          const pageNum = doc.metadata.loc?.pageNumber || "N/A";
          return `📄 ${pdfName} (Page ${pageNum}) → ${doc.pageContent}`;
        }) || [];

      // Replace typing bubble with actual response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: aiResponse,
          sources,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Error: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-5xl mx-auto border border-white/20 rounded-xl shadow-2xl bg-white/40 backdrop-blur-xl overflow-hidden mt-8 ring-1 ring-white/10 dark:bg-black/40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-black/50 border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              PDF Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by RAG
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6 bg-transparent">
        {messages.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 text-muted-foreground"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              Welcome Back!
            </h3>
            <p className="max-w-sm text-base">
              Upload a PDF document and start asking questions to get instant
              answers with citations.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto pb-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                        : "bg-white dark:bg-zinc-800 border border-border text-primary"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"
                      }`}
                  >
                    <div
                      className={cn(
                        "px-6 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group transition-all",
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-sm hover:shadow-md"
                      )}
                    >
                      {msg.role === "assistant" && msg.content === "..." ? (
                        <div className="flex gap-1.5 items-center h-6 px-2">
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => handleCopy(msg.content)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Sources Accordion */}
                    {msg.role === "assistant" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 w-full max-w-lg"
                        >
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                              value={`item-${i}`}
                              className="border border-border/60 rounded-xl bg-white/50 dark:bg-zinc-900/30 px-4 shadow-sm overflow-hidden"
                            >
                              <AccordionTrigger className="py-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>View {msg.sources.length} Sources</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2 mt-1 pb-3">
                                  {msg.sources.map((src, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border/50 leading-relaxed"
                                    >
                                      {src}
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </motion.div>
                      )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-white/60 dark:bg-black/60 border-t border-border/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask something about your document..."
            className="pr-16 py-7 rounded-full border-border/60 bg-white/50 dark:bg-zinc-900/50 focus-visible:ring-2 focus-visible:ring-ring shadow-sm text-base pl-8 backdrop-blur-sm transition-all hover:bg-white/80 dark:hover:bg-zinc-900/80"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full transition-all shadow-md active:scale-95",
              message.trim()
                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            {loading ? (
              <StopCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <SendHorizonal className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium opacity-70">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
