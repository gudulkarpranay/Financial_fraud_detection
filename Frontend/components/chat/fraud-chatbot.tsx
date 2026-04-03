"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/api-service"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

interface FraudChatbotProps {
  transaction?: any
  account?: any
}

const QUICK_PROMPTS = [
  "Why is this flagged?",
  "What fraud pattern is this?",
  "What action should I take?",
  "Explain the risk score",
  "Is this money laundering?",
]

export default function FraudChatbot({ transaction, account }: FraudChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hello! I'm GraphSentinel AI. Ask me anything about this transaction or account — I can explain fraud patterns, risk scores, and recommend actions.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          transaction,
          account,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.reply || "I couldn't process that request.",
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Unable to connect to AI engine. Please ensure the backend is running.",
          timestamp: new Date(),
        },
      ])
    }

    setLoading(false)
  }

  return (
    <Card className="flex flex-col h-[520px] border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>GraphSentinel AI</span>
          <Badge variant="outline" className="ml-auto gap-1 text-xs text-success border-success/30 bg-success/10">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                msg.role === "bot" ? "bg-primary/10" : "bg-muted"
              )}
            >
              {msg.role === "bot" ? (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "bot"
                  ? "bg-muted text-card-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              )}
            >
              {msg.content}
              <div
                suppressHydrationWarning
                className={cn(
                  "mt-1 text-[10px]",
                  msg.role === "bot" ? "text-muted-foreground" : "text-primary-foreground/70"
                )}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </CardContent>

      {/* Quick Prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pt-2 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about this transaction..."
            className="flex-1 text-sm"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
