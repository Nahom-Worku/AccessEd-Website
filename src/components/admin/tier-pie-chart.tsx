'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { TierBreakdown } from '@/lib/types/admin'

const TIER_COLORS: Record<string, string> = {
  explorer: '#94A3B8',
  member: '#3B82F6',
  pro: '#F97316',
}

interface TierPieChartProps {
  data: TierBreakdown[]
}

export function TierPieChart({ data }: TierPieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tier Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="tier"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.tier}
                    fill={TIER_COLORS[entry.tier] || '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} users`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
