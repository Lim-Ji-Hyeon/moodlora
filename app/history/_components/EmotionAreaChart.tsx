'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'

// 감정별 차트 색상 (EMOTION_STYLES dot 기반)
const EMOTION_COLORS: Record<EmotionType, string> = {
  JOY:        '#f59e0b', // amber-400
  EXCITEMENT: '#ec4899', // pink-400
  CALM:       '#38bdf8', // sky-400
  SADNESS:    '#60a5fa', // blue-400
  ANGER:      '#f87171', // red-400
  LETHARGY:   '#94a3b8', // slate-400
  ANXIETY:    '#c084fc', // purple-400
  LONELINESS: '#818cf8', // indigo-400
}

type ChartDataPoint = { date: string } & Partial<Record<EmotionType, number>>

type Props = {
  data:          ChartDataPoint[]
  onDateClick:   (date: string) => void
  selectedDate:  string | null
}

export default function EmotionAreaChart({ data, onDateClick, selectedDate }: Props) {
  const emotions = Object.keys(EMOTIONS) as EmotionType[]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        onClick={(payload) => {
          if (payload?.activeLabel) {
            onDateClick(payload.activeLabel as string)
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <defs>
          {emotions.map((emotion) => (
            <linearGradient key={emotion} id={`grad-${emotion}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={EMOTION_COLORS[emotion]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={EMOTION_COLORS[emotion]} stopOpacity={0}   />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border:          '1px solid hsl(var(--border))',
            borderRadius:    '8px',
            fontSize:        '12px',
          }}
          formatter={(value, name) => {
            const emotion = name as EmotionType
            return [`${value}회`, `${EMOTIONS[emotion]?.emoji ?? ''} ${EMOTIONS[emotion]?.label ?? String(emotion)}`]
          }}
          labelFormatter={(label) => String(label)}
        />

        {emotions.map((emotion) => (
          <Area
            key={emotion}
            type="monotone"
            dataKey={emotion}
            stroke={EMOTION_COLORS[emotion]}
            strokeWidth={selectedDate ? 1.5 : 2}
            fill={`url(#grad-${emotion})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
