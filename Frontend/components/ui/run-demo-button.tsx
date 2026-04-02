"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2, CheckCircle2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-service"

export function RunDemoButton() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle")

  const runDemo = async () => {
    setStatus("running")
    try {
      await fetch(`${API_BASE_URL}/api/demo/run`, { method: "POST" })
      setStatus("done")
      setTimeout(() => setStatus("idle"), 4000)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <Button
      onClick={runDemo}
      disabled={status === "running"}
      variant={status === "done" ? "outline" : "destructive"}
      className="gap-2 font-bold"
      size="lg"
    >
      {status === "idle" && (
        <>
          <Play className="h-4 w-4" />
          Run Fraud Demo
        </>
      )}
      {status === "running" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Simulating Fraud...
        </>
      )}
      {status === "done" && (
        <>
          <CheckCircle2 className="h-4 w-4 text-success" />
          Demo Complete!
        </>
      )}
    </Button>
  )
}
