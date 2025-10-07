import React, { use, useEffect, useMemo } from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
} from "victory";

export interface PerformanceEntry {
  second: number;
  chars: number;
  errors: number;
}

export interface TypingContext {
  difficulty: "normal" | "hard";
  time: number;
  language: "pt-BR" | "en-US";
  data: PerformanceEntry[];
  totalTyped: number;
  currentErrors: number;
  isRunning: boolean;
}

interface Props {
  info: TypingContext;
}

/**
 * PerformanceChart
 * - recebe info.data: PerformanceEntry[]
 * - converte para formato que Victory entende (x, y)
 * - ordena por x
 * - garante que x,y sejam numbers
 * - calcula domain para não "apagar" pontos
 */
const PerformanceChart = ({info} : Props) => {
  const { data } = info;

  // transforma e sanitiza dados para Victory
  const { chartData, errorPoints, xDomain, yDomain } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [] as { x: number; y: number; errors?: number }[],
        errorPoints: [] as { x: number; y: number; errors: number }[],
        xDomain: [0, 1] as [number, number],
        yDomain: [0, 1] as [number, number],
      };
    }

    // map & coerce para number e ordenar por second (x)
    const mapped = data
      .map((d) => ({
        x: Number(d.second), // x = segundos
        y: Number(d.chars),  // y = chars por segundo
        errors: Number(d.errors || 0),
      }))
      .sort((a, b) => a.x - b.x);

    const errorPts = mapped.filter((d) => d.errors > 0);

    // domínio X e Y: deixar um pequeno padding para visual
    const xs = mapped.map((d) => d.x);
    const ys = mapped.map((d) => d.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 1);

    // adicionar padding
    const xPad = Math.max(1, Math.round((maxX - minX) * 0.05));
    const yPad = Math.max(1, Math.round((maxY - minY) * 0.1));

    return {
      chartData: mapped,
      errorPoints: errorPts,
      xDomain: [Math.max(0, minX - xPad), maxX + xPad] as [number, number],
      yDomain: [Math.max(0, minY - yPad), maxY + yPad] as [number, number],
    };
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ padding: 20, color: "#999" }}>
        Sem dados para mostrar — comece um teste para coletar `PerformanceEntry[]`.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1060 }}>
      <VictoryChart
        theme={VictoryTheme.material}
        domain={{ x: xDomain, y: yDomain }}
        padding={{ top: 20, bottom: 50, left: 60, right: 30 }}
        animate={{ duration: 300 }}
      >
        <VictoryAxis
          label="Segundos"
          tickFormat={(t) => `${t}s`}
          style={{
            axisLabel: { padding: 30 },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryAxis
          dependentAxis
          label="Caracteres / s"
          style={{
            axisLabel: { padding: 40 },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryLine
          data={chartData}
          interpolation="monotoneX"
          x="x"
          y="y"
          style={{
            data: { stroke: "#1976d2", strokeWidth: 2 },
          }}
        />

        {/* pontos normais */}
        <VictoryScatter
          data={chartData.filter((d) => !(d as any).errors || (d as any).errors === 0)}
          x="x"
          y="y"
          size={3}
          labels={({ datum }) => `${datum.y} Caracteres`}
          labelComponent={<VictoryTooltip />}
          style={{ data: { fill: "#1976d2" } }}
        />

        {/* pontos com erros em vermelho (maiores) */}
        <VictoryScatter
          data={errorPoints}
          x="x"
          y="y"
          size={5}
          labels={({ datum }) => `Erros: ${datum.errors}\n${datum.y} chars`}
          labelComponent={<VictoryTooltip />}
          style={{ data: { fill: "red" } }}
        />
      </VictoryChart>
    </div>
  );
};

export default PerformanceChart;
