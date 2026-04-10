'use client';

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PillarId, PillarScore } from '@/types/assessment';

interface RadarChartProps {
  pillarScores: Record<PillarId, PillarScore>;
}

const PILLAR_LABELS: Record<PillarId, string> = {
  dados: 'Dados & Analytics',
  pessoas: 'Pessoas & Governança',
  processos: 'Processos',
  tecnologia: 'Tecnologia',
};

export function RadarChart({ pillarScores }: RadarChartProps) {
  const data = (Object.keys(PILLAR_LABELS) as PillarId[]).map((id) => ({
    pillar: PILLAR_LABELS[id],
    atual: pillarScores[id].percentage,
    bestInClass: 100,
  }));

  return (
    <div className="h-[320px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} outerRadius="70%">
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            stroke="#374151"
          />
          <Radar
            name="Best-in-Class"
            dataKey="bestInClass"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.15}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Radar
            name="Análise Atual"
            dataKey="atual"
            stroke="#7030A0"
            fill="#7030A0"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ color: '#e5e7eb', fontSize: 12, paddingTop: 8 }}
            iconType="circle"
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
