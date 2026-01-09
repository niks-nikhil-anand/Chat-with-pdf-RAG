"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";

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
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const currentMessage = message;
    setMessage("");

    try {
      setLoading(true);

      // Add temporary typing bubble
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      const res = await axios.post<ApiResponse>("http://localhost:8000/chat", {
        query: currentMessage,
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
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Error: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-5xl mx-auto border rounded-xl shadow-xl bg-white overflow-hidden mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">PDF Assistant</h1>
            <p className="text-xs text-slate-500">
              Ask questions from your documents
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 bg-slate-50/50">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400 mt-20">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-600">
              No messages yet
            </h3>
            <p className="max-w-sm text-sm">
              Upload a PDF document and start asking questions to get instant
              answers with citations.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 Shadow-sm ${msg.role === "user" ? "bg-blue-600" : "bg-emerald-600"
                    }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                  >
                    {msg.role === "assistant" && msg.content === "..." ? (
                      <div className="flex gap-1 items-center h-6 px-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Sources Accordion */}
                  {msg.role === "assistant" &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div className="mt-2 w-full max-w-md">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value={`item-${i}`}
                            className="border rounded-lg bg-white px-3 shadow-sm"
                          >
                            <AccordionTrigger className="py-2 text-xs text-slate-500 hover:text-blue-600 hover:no-underline">
                              View {msg.sources.length} Sources
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2 pb-2">
                                {msg.sources.map((src, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100"
                                  >
                                    {src}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto relative flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask something about your document..."
            className="pr-14 py-6 rounded-full border-slate-200 focus-visible:ring-blue-500 shadow-sm text-base pl-6"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full transition-all shadow-sm ${message.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <StopCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <SendHorizonal className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
