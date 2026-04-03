"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useDashboardData } from "@/contexts/dashboard-data-context"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  Panel,
  MarkerType,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { AccountNode } from "./account-node"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle } from "lucide-react"

import { io } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api-service"

const nodeTypes = {
  accountNode: AccountNode,
} as NodeTypes

export function FundFlowGraph() {
  const reactFlowInstance = useReactFlow()
  const { loading: bootstrapLoading, error: bootstrapError, data } = useDashboardData()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [highlightSuspicious, setHighlightSuspicious] = useState(true)
  const [loading, setLoading] = useState(true)
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])

  const [alertNodes, setAlertNodes] = useState<string[]>([])
  const [alertEdges, setAlertEdges] = useState<any[]>([])

  useEffect(() => {
    const graphNodes = data?.graphNodes ?? []
    const graphEdges = data?.graphEdges ?? []

    if (bootstrapLoading && !data) {
      setLoading(true)
      return
    }

    if (!graphNodes.length && !bootstrapError) {
      setNodes([])
      setEdges([])
      setLoading(false)
      return
    }

    const safeNodes = graphNodes.map((node: any, index: number) => ({
      id: node.id || `node-${index}`,
      type: node.type || "accountNode",
      position: {
        x: node.position?.x ?? (index % 3) * 220,
        y: node.position?.y ?? Math.floor(index / 3) * 160,
      },
      data: {
        account: {
          id: node.data?.account?.id || node.id,
          riskScore: node.data?.account?.riskScore ?? 0,
          isSuspicious: node.data?.account?.isSuspicious ?? false,
          reasons: node.data?.account?.reasons || [],
          balance: node.data?.account?.balance ?? 0,
          type: node.data?.account?.type || "User",
          country: node.data?.account?.country || "Unknown",
        },
      },
    }))

    const safeEdges = graphEdges.map((edge: any, index: number) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || "",
      animated: edge.animated || false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || "#999",
      },
      style: {
        ...edge.style,
        strokeWidth: 2,
      },
    }))

    setNodes(safeNodes)
    setEdges(safeEdges)
    setLoading(false)

    setTimeout(() => {
      try {
        reactFlowInstance.fitView({ padding: 0.3 })
      } catch {
        // no-op
      }
    }, 200)
  }, [bootstrapLoading, data, bootstrapError, reactFlowInstance, setNodes, setEdges])

  useEffect(() => {
    const socket = io(API_BASE_URL)

    socket.on("fraud-alert", (alert: any) => {
      const nodes = alert.path?.map((p: any) => p.from) || []
      const edgesFromAlert = alert.path || []

      setAlertNodes(nodes)
      setAlertEdges(edgesFromAlert)

      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.4 })
        } catch {}
      }, 300)
    })

    return () => {
      socket.off("fraud-alert")
      socket.disconnect()
    }
  }, [reactFlowInstance])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const getConnectedPath = (nodeId: string) => {
    const path: string[] = []

    edges.forEach((edge: any) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        path.push(edge.source)
        path.push(edge.target)
      }
    })

    return [...new Set(path)]
  }

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      setSelectedAccount(node.data?.account)
      const path = getConnectedPath(node.id)
      setHighlightedPath(path)
    },
    [edges]
  )

  const filteredNodes = useMemo(() => {
    return nodes.map((node: any) => {
      const isPath = highlightedPath.includes(node.id)
      const isAlert = alertNodes.includes(node.id)

      return {
        ...node,
        style: {
          opacity:
            highlightedPath.length === 0
              ? 1
              : isPath
                ? 1
                : 0.2,

          border: isAlert ? "2px solid red" : "1px solid #ccc",
          boxShadow: isAlert ? "0 0 15px red" : "none",
        },
      }
    })
  }, [nodes, highlightedPath, alertNodes])

  const filteredEdges = useMemo(() => {
    const mappedAlertEdges = alertEdges
      .filter((e: any) => e?.from && e?.to)
      .map((e: any, idx: number) => ({
        id: `alert-${idx}-${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        animated: true,
        style: { stroke: "red", strokeWidth: 3 },
      }))

    const existingPairs = new Set(edges.map((e: any) => `${e.source}->${e.target}`))
    const extraAlertEdges = mappedAlertEdges.filter(
      (e: any) => !existingPairs.has(`${e.source}->${e.target}`)
    )

    const combinedEdges = [...edges, ...extraAlertEdges]

    return combinedEdges.map((edge: any) => {
      const isPath =
        highlightedPath.includes(edge.source) &&
        highlightedPath.includes(edge.target)

      const isAlert = alertEdges.some(
        (e: any) => e.from === edge.source && e.to === edge.target
      )

      return {
        ...edge,
        animated: isPath || isAlert,
        style: {
          stroke: isAlert
            ? "red"
            : isPath
              ? "orange"
              : edge.style?.stroke || "#999",

          strokeWidth: isAlert ? 3 : isPath ? 2 : 1,

          opacity:
            highlightedPath.length === 0
              ? 1
              : isPath || isAlert
                ? 1
                : 0.2,
        },
      }
    })
  }, [edges, highlightedPath, alertEdges])

  if (bootstrapError && !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        {bootstrapError}
      </div>
    )
  }

  if (loading) {
    return <div className="p-4">Loading graph...</div>
  }

  const suspiciousCount = nodes.filter(
    (n: any) => n.data?.account?.isSuspicious
  ).length

  return (
    <div className="relative h-[calc(100vh-12rem)] w-full rounded-lg border border-border bg-card">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={20} />
        <Controls />

        <MiniMap
          nodeColor={(node: any) => {
            const acc = node.data?.account
            if (!acc) return "#999"
            if (acc.riskScore >= 75) return "red"
            if (acc.riskScore >= 50) return "orange"
            return "green"
          }}
        />

        <Panel position="top-left" className="!m-4">
          <Card className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Graph Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Suspicious Nodes</span>
                <Badge variant="destructive">{suspiciousCount}</Badge>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => setHighlightSuspicious(!highlightSuspicious)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {highlightSuspicious ? "Showing Suspicious" : "Show All"}
              </Button>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>

      {selectedAccount && (
        <div className="absolute right-4 top-4 z-10 w-80">
          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle>Account Details</CardTitle>
              <Button onClick={() => setSelectedAccount(null)}>
                <X />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              <p>ID: {selectedAccount.id}</p>
              <p>Risk: {selectedAccount.riskScore}%</p>
              <p>Balance: ₹{selectedAccount.balance}</p>

              <Badge
                variant={
                  selectedAccount.isSuspicious ? "destructive" : "default"
                }
              >
                {selectedAccount.isSuspicious ? "Suspicious" : "Normal"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
