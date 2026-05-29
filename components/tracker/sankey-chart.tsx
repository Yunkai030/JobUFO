'use client'

import { useMemo } from 'react'
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  type SankeyNode,
  type SankeyLink,
} from 'd3-sankey'
import type { Application } from '@/lib/types/application'

interface Props {
  applications: Application[]
}

const STAGE_ORDER = [
  'applied',
  'screening',
  'phone',
  'interview',
  'final',
  'offer',
  'rejected',
  'withdrawn',
]

const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  phone: 'Phone Screen',
  interview: 'Interview',
  final: 'Final Round',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const NODE_COLORS: Record<string, string> = {
  applied: '#3b82f6',
  screening: '#8b5cf6',
  phone: '#6366f1',
  interview: '#f59e0b',
  final: '#f97316',
  offer: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#9ca3af',
}

type NodeExtra = { id: string; label: string; color: string }
type SNode = SankeyNode<NodeExtra, Record<string, never>>
type SLink = SankeyLink<NodeExtra, Record<string, never>>

export function SankeyChart({ applications }: Props) {
  const { nodes, links, empty, height } = useMemo(() => {
    if (applications.length === 0) return { nodes: [], links: [], empty: true, height: 0 }

    // Count how many apps are at each status right now
    const counts: Record<string, number> = {}
    for (const app of applications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1
    }

    // Only include stages that actually have apps
    const activeStatuses = STAGE_ORDER.filter((s) => (counts[s] ?? 0) > 0)

    if (activeStatuses.length === 0) return { nodes: [], links: [], empty: true, height: 0 }

    // If only one status, no links to draw — show a simple bar instead
    if (activeStatuses.length === 1) return { nodes: [], links: [], empty: true, height: 0 }

    // Create "Total" as the root source node
    const total = applications.length
    const nodeList: NodeExtra[] = [
      { id: 'total', label: `Total (${total})`, color: '#64748b' },
      ...activeStatuses.map((s) => ({
        id: s,
        label: `${STAGE_LABELS[s]} (${counts[s]})`,
        color: NODE_COLORS[s] ?? '#888',
      })),
    ]

    // Links: Total → each status (simple fan-out from total)
    const linkDefs = activeStatuses.map((s) => ({
      source: 'total',
      target: s,
      value: counts[s],
    }))

    try {
      const width = 700
      const h = Math.max(250, activeStatuses.length * 45)
      const generator = d3Sankey<NodeExtra, Record<string, never>>()
        .nodeId((d) => d.id)
        .nodeWidth(16)
        .nodePadding(16)
        .nodeSort((a, b) => STAGE_ORDER.indexOf(a.id) - STAGE_ORDER.indexOf(b.id))
        .extent([
          [0, 10],
          [width, h - 10],
        ])

      const graphInput = {
        nodes: nodeList.map((d) => ({ ...d })),
        links: linkDefs.map((d) => ({ ...d })),
      }
      const { nodes: sNodes, links: sLinks } = generator(
        graphInput as unknown as Parameters<typeof generator>[0]
      )

      return {
        nodes: sNodes as SNode[],
        links: sLinks as SLink[],
        empty: false,
        height: h,
      }
    } catch {
      return { nodes: [], links: [], empty: true, height: 0 }
    }
  }, [applications])

  if (empty) {
    // Simple status distribution bar
    const counts: Record<string, number> = {}
    for (const app of applications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1
    }
    const total = applications.length
    if (total === 0) {
      return (
        <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Add applications to see your funnel chart.
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {STAGE_ORDER.filter((s) => (counts[s] ?? 0) > 0).map((s, i) => (
          <div key={s} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="w-28 text-sm">{STAGE_LABELS[s]}</span>
            <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
              <div
                className="h-full rounded animate-bar-grow"
                style={{
                  width: `${((counts[s] ?? 0) / total) * 100}%`,
                  backgroundColor: NODE_COLORS[s],
                  animationDelay: `${i * 60 + 200}ms`,
                }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums w-8">{counts[s]}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 700 ${height}`} className="w-full animate-fade-in">
      {links.map((link, i) => {
        const targetNode = link.target as SNode
        return (
          <path
            key={i}
            d={sankeyLinkHorizontal()(link as never) ?? ''}
            fill="none"
            stroke={targetNode.color ?? '#888'}
            strokeOpacity={0.35}
            strokeWidth={Math.max(2, link.width ?? 1)}
          />
        )
      })}
      {nodes.map((node) => {
        const h = (node.y1 ?? 0) - (node.y0 ?? 0)
        return (
          <g key={node.id}>
            <rect
              x={node.x0}
              y={node.y0}
              width={(node.x1 ?? 0) - (node.x0 ?? 0)}
              height={h}
              fill={node.color}
              rx={3}
            />
            <text
              x={(node.x1 ?? 0) + 8}
              y={((node.y0 ?? 0) + (node.y1 ?? 0)) / 2}
              dy="0.35em"
              fontSize={12}
              fontWeight={500}
              fill="currentColor"
              className="text-foreground"
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
