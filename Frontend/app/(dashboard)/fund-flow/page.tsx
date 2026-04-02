"use client"

import { ReactFlowProvider } from "@xyflow/react"
import { FundFlowGraph } from "@/components/graph/fund-flow-graph"

export default function FundFlowPage() {
  return (
    <ReactFlowProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fund Flow Graph
          </h1>
          <p className="text-muted-foreground">
            Interactive visualization of money flows between accounts.
            Suspicious nodes are highlighted in red.
          </p>
        </div>

        <FundFlowGraph />
      </div>
    </ReactFlowProvider>
  )
}