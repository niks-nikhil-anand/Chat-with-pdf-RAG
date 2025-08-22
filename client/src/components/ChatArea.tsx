"use client";

import React, { useState } from "react";
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
import { FileText, SendHorizonal } from "lucide-react";
import { User, Bot } from "lucide-react";

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

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    try {
      setLoading(true);

      // Add temporary typing bubble
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      const res = await axios.post<ApiResponse>("http://localhost:8000/chat", {
        query: message,
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
    <div className="mx-auto p-2 space-y-6">
      {/* Chat Messags */}
      <ScrollArea className="h-[80vh] border rounded-lg p-3 bg-gray-50">
        <div className="space-y-6 ">
          {/* Title & Description */}
          <div className="text-center space-y-2 bg-gray-200 py-5 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <FileText className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Chat with PDF (RAG)</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              Upload your PDF and ask questions. Our AI assistant will extract
              answers from the document and provide references.
            </p>
          </div>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI Icon (left side) */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] whitespace-pre-wrap p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {/* Message Content */}
                {msg.content === "..." && msg.role === "assistant" ? (
                  <span className="animate-pulse">Assistant is typing...</span>
                ) : (
                  msg.content
                )}

                {/* Accordion only for assistant messages */}
                {msg.role === "assistant" &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="mt-2">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`item-${i}`}>
                          <AccordionTrigger>Sources</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {msg.sources.map((src, idx) => (
                                <li key={idx}>{src}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
              </div>

              {/* User Icon (right side) */}
              {msg.role === "user" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input & Send Button */}
      <div className="flex items-center gap-2 rounded-full border bg-white shadow-sm px-3 py-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={loading}
          className="rounded-full"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatArea;
