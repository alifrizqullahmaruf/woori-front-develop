import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useMemo, useRef } from "react";
import { Bar } from "react-chartjs-2";

export interface CommonChartProps {
  isUpdateChart?: boolean;
  rawData: number[];              // <- ini AKAN dipakai sbg tinggi batang (kita buat absolut di dalam)
  originalValues?: number[];      // <- nilai ASLI untuk label/tooltip (opsional tapi disarankan)
  labels: string[];
  additionalLabels?: string[];
  width?: number;
  height?: number;

  valueDecimals?: number;         // default 2
  valueSuffix?: string;           // "조" | "원" | dst
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels);

export default function BarChart({
  isUpdateChart = false,
  rawData,
  originalValues,       // <- kalau tak dikirim, fallback ke rawData
  labels,
  additionalLabels,
  width,
  height,
  valueDecimals = 2,
  valueSuffix,
}: CommonChartProps) {
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  // 1) Tinggi batang = nilai ABSOLUT, agar tidak "terbalik"
  const barHeights = useMemo(
    () => rawData.map((v) => (Number.isFinite(v) ? Math.abs(v) : 0)),
    [rawData],
  );

  // Nilai untuk ditampilkan di label/tooltip (tetap bertanda)
  const displayValues = useMemo(
    () => (originalValues?.length ? originalValues : rawData),
    [originalValues, rawData],
  );

  // Persen (YoY/PoP)
  const percentLabels = useMemo(() => {
    if (additionalLabels?.length) return additionalLabels;
    return displayValues.map((v, i, arr) => {
      if (i === 0) return "0%";
      const prev = arr[i - 1] ?? 0;
      const pct = prev !== 0 ? ((v - prev) / Math.abs(prev)) * 100 : 0;
      return `${pct.toFixed(2)}%`;
    });
  }, [additionalLabels, displayValues]);

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          data: barHeights,     // <- gunakan tinggi absolut
          barThickness: 42,
          borderRadius: 6,
          backgroundColor: "#B1DAFF",
          minBarLength: 2,      // agar nilai kecil tetap kelihatan
        },
      ],
      labels,
    }),
    [barHeights, labels],
  );

  const chartOptions = useMemo(
    () => ({
      animation: { duration: 300 },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: (ctx: any) => labels[ctx[0].dataIndex],
            label: (ctx: any) => {
              const idx = ctx.dataIndex ?? 0;
              const val = displayValues[idx] ?? 0; // gunakan nilai asli dg tanda
              const fixed = Number.isFinite(val) ? val.toFixed(valueDecimals) : "0";
              return valueSuffix ? `${fixed}${valueSuffix}` : fixed;
            },
          },
        },

        // Datalabels: persen (berwarna, di atas) + nilai asli (netral, di bawah)
        datalabels: {
          anchor: "end",
          align: "top",
          textAlign: "center",
          clip: false,
          labels: {
            pct: {
              display: (ctx: any) => isUpdateChart && !!percentLabels[ctx.dataIndex ?? 0],
              formatter: (_: number, ctx: any) => percentLabels[ctx.dataIndex ?? 0] ?? "",
              color: (ctx: any) => {
                const s = (percentLabels[ctx.dataIndex ?? 0] || "0").toString().replace("%", "");
                const v = parseFloat(s);
                if (!Number.isFinite(v)) return "#3F4150";
                return v >= 0 ? "#E34850" /* hijau */ : "#2962FF" /* merah */;
              },
              font: { size: 12, family: "Lato Numbers", weight: "bold" },
              offset: 14, // persen DI ATAS nilai
            },
            val: {
              formatter: (_absHeight: number, ctx: any) => {
                const idx = ctx.dataIndex ?? 0;
                const val = displayValues[idx] ?? 0; // nilai asli (bisa minus)
                const fixed = Number.isFinite(val) ? val.toFixed(valueDecimals) : "0";
                return valueSuffix ? `${fixed}${valueSuffix}` : fixed;
              },
              color: "#3F4150",
              font: { size: 12, family: "Lato Numbers", weight: "bold" },
              offset: 0,
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 12, family: "Lato Numbers" }, color: "#3F4150" },
        },
        y: {
          display: false,
          grid: { display: false },
          beginAtZero: true,
          suggestedMin: 0,   // <- mulai dari 0 (hanya area positif)
          // suggestedMax bisa dibiarkan auto
        },
      },
      layout: { padding: { top: isUpdateChart ? 38 : 26 } },
    }),
    [isUpdateChart, labels, percentLabels, displayValues, valueDecimals, valueSuffix],
  );

  return (
    <Bar
      ref={chartRef}
      className="pt-4"
      data={chartData}
      options={chartOptions as any}
      {...(width && { width })}
      {...(height && { height })}
    />
  );
}
