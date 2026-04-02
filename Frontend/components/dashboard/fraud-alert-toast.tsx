"use client"

import { useEffect } from "react"
import { io } from "socket.io-client"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api-service"

const socket = io(API_BASE_URL, { autoConnect: false })

export function FraudAlertToast() {
  useEffect(() => {
    socket.connect()

    socket.on("fraud-alert", (alert: any) => {
      const score = alert.riskScore || alert.score || 0
      const account = alert.fromAccount || alert.accountId || "Unknown"
      const reasons = (alert.reasons || []).slice(0, 2).join(", ")

      if (score > 80) {
        toast.error(`BLOCK — ${account}`, {
          description: `Risk Score: ${score}/100 | ${reasons}`,
          duration: 6000,
        })
      } else if (score > 60) {
        toast.warning(`INVESTIGATE — ${account}`, {
          description: `Risk Score: ${score}/100 | ${reasons}`,
          duration: 5000,
        })
      } else {
        toast.success(`SAFE — ${account}`, {
          description: `Risk Score: ${score}/100 — Normal activity`,
          duration: 3000,
        })
      }
    })

    socket.on("connect", () => {
      console.log("🔌 Alert socket connected")
    })

    return () => {
      socket.off("fraud-alert")
      socket.disconnect()
    }
  }, [])

  return null
}
