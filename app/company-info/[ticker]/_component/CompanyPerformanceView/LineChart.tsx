import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";

export interface CommonChartProps {
  isUpdateChart?: boolean;
  rawData: number[];
  labels: string[];
  additionalLabels?: string[]; // optional YoY (%)
  width?: number;
  height?: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  ChartDataLabels,
);

function fmtNumber(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function computePercentsFromRaw(raw: number[]) {
  return raw.map((v, i) => {
    if (i === 0) return "0%";
    const prev = raw[i - 1] ?? 0;
    const pct = prev !== 0 ? ((v - prev) / Math.abs(prev)) * 100 : 0;
    return `${pct.toFixed(2)}%`;
  });
}

export default function LineChart({
  isUpdateChart = false,
  rawData,
  labels,
  additionalLabels,
  width,
  height,
}: CommonChartProps) {
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const percentLabels = useMemo(
    () =>
      additionalLabels?.length
        ? additionalLabels
        : computePercentsFromRaw(rawData),
    [additionalLabels, rawData],
  );

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          data: rawData,
          borderWidth: rawData.length > 30 ? 3 : 1,
          borderColor: rawData.length > 30 ? "#2962ff" : "#DDDDDD",
          pointBackgroundColor: "#002D9C",
          pointRadius: rawData.length > 30 ? 1 : 8,
          pointHoverRadius: rawData.length > 30 ? 3 : 8,
          fill: false,
          tension: 0.25,
        },
      ],
      labels,
    }),
    [labels, rawData],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: rawData.length > 30 ? true : false,
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#dddddd",
          borderWidth: 1,
          cornerRadius: 4,
          displayColors: false,
          callbacks: {
            title: (ctx: any) => labels[ctx[0].dataIndex],
            label: (ctx: any) => `${fmtNumber(ctx.parsed.y)}조`,
          },
        },

        // ── Multi-labels: persentase (berwarna) + nilai (netral)
        datalabels: {
          anchor: "end",
          align: "top",
          textAlign: "center",
          labels: {
            // PERSEN (di ATAS)
            pct: {
              display: (ctx: any) =>
                isUpdateChart && !!percentLabels[ctx.dataIndex ?? 0],
              formatter: (_: number, ctx: any) =>
                percentLabels[ctx.dataIndex ?? 0] ?? "",
              color: (ctx: any) => {
                const v = parseFloat(
                  String(percentLabels[ctx.dataIndex ?? 0] || "0").replace(
                    "%",
                    "",
                  ),
                );
                if (!Number.isFinite(v)) return "#3F4150";
                return v >= 0 ? "#E34850" : "#2962FF";
              },
              font: { size: 12, family: "Lato Numbers", weight: "bold" },
              // ↓ PENTING: persen lebih JAUH dari titik → tampil LEBIH ATAS
              offset: 14,
            },

            // NILAI + "조" (di BAWAH persen, dekat titik)
            val: {
              formatter: (value: number) => `${fmtNumber(value)}%`,
              color: "#3F4150",
              font: { size: 12, family: "Lato Numbers", weight: "bold" },
              // ↓ dekat elemen → tampil DI BAWAH persen
              offset: 0,
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { size: 12, family: "Lato Numbers" },
            color: "#3F4150",
          },
        },
        y: {
          display: false,
          beginAtZero: true,
          grace: "20%",
        },
      },
      // ruang ekstra untuk 2 baris label saat compare
      layout: { padding: { top: isUpdateChart ? 60 : 40 } },
      maintainAspectRatio: rawData.length > 30 ? true : false,
    }),
    [isUpdateChart, labels, rawData.length, percentLabels],
  );

  useEffect(() => {
    // chartRef.current?.update();
  }, [isUpdateChart, percentLabels]);

  return (
    <Line
      ref={chartRef}
      data={chartData}
      options={chartOptions as any}
      className={"max-h-[346px]"}
      {...(width && { width })}
      {...(height && { height })}
    />
  );
}
