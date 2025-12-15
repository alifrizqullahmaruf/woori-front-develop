import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
} from "chart.js";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Context as DataLabelsContext } from "chartjs-plugin-datalabels";
import { useMemo, useRef } from "react";
import { Bar } from "react-chartjs-2";

export interface CommonChartProps {
  isUpdateChart?: boolean;
  rawData: number[];
  originalValues?: number[];
  labels: string[];
  additionalLabels?: string[];
  width?: number;
  height?: number;
  valueDecimals?: number;
  valueSuffix?: string;
  valuePrefix?: string;
  unitLabel?: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels);

export default function BarChart({
  isUpdateChart = false,
  rawData,
  originalValues,
  labels,
  additionalLabels,
  width,
  height,
  valueDecimals = 2,
  valueSuffix,
  valuePrefix,
  unitLabel,
}: CommonChartProps) {
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  // Bar heights use absolute values to avoid inverted bars
  const barHeights = useMemo(
    () => rawData.map((v) => (Number.isFinite(v) ? Math.abs(v) : 0)),
    [rawData],
  );

  // Values shown on labels/tooltips (original values if provided)
  const displayValues = useMemo(
    () => (originalValues?.length ? originalValues : rawData),
    [originalValues, rawData],
  );

  // Percentage labels (YoY / PoP)
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
    (): ChartData<"bar"> => ({
      datasets: [
        {
          data: barHeights,
          barThickness: 42,
          borderRadius: 6,
          backgroundColor: "#B1DAFF",
          minBarLength: 2,
        },
      ],
      labels,
    }),
    [barHeights, labels],
  );

  const chartOptions = useMemo(
    (): ChartOptions<"bar"> => ({
      animation: { duration: 300 },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: (items: TooltipItem<"bar">[]) => labels[items[0].dataIndex],
            label: (item: TooltipItem<"bar">) => {
              const dataIndex = item.dataIndex ?? 0;
              const value = displayValues[dataIndex] ?? 0;
              const formattedValue = Number.isFinite(value)
                ? value.toFixed(valueDecimals)
                : "0";
              const prefix = valuePrefix || "";
              const suffix = valueSuffix || "";
              return `${prefix}${formattedValue}${suffix}`;
            },
          },
        },
        datalabels: {
          anchor: "end",
          align: "top",
          textAlign: "center",
          clip: false,
          labels: {
            pct: {
              display: (ctx: DataLabelsContext) =>
                isUpdateChart && !!percentLabels[ctx.dataIndex ?? 0],
              formatter: (_unused: unknown, ctx: DataLabelsContext) =>
                percentLabels[ctx.dataIndex ?? 0] ?? "",
              color: (ctx: DataLabelsContext) => {
                const numericText = (percentLabels[ctx.dataIndex ?? 0] || "0")
                  .toString()
                  .replace("%", "");
                const percentNumber = parseFloat(numericText);
                if (!Number.isFinite(percentNumber)) return "#3F4150";
                return percentNumber >= 0 ? "#E34850" : "#2962FF";
              },
              font: { size: 12, family: "Lato Numbers", weight: "bold" },
              offset: 14,
            },
            val: {
              formatter: (_computedBarHeight: unknown, ctx: DataLabelsContext) => {
                const dataIndex = ctx.dataIndex ?? 0;
                const value = displayValues[dataIndex] ?? 0;
                const formattedValue = Number.isFinite(value)
                  ? value.toFixed(valueDecimals)
                  : "0";
                const prefix = valuePrefix || "";
                const suffix = valueSuffix || "";
                return `${prefix}${formattedValue}${suffix}`;
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
          ticks: {
            font: { size: 12, family: "Lato Numbers" },
            color: "#3F4150",
          },
        },
        y: {
          display: false,
          grid: { display: false },
          beginAtZero: true,
          suggestedMin: 0,
        },
      },
      layout: { padding: { top: isUpdateChart ? 38 : 26 } },
    }),
    [
      isUpdateChart,
      labels,
      percentLabels,
      displayValues,
      valueDecimals,
      valueSuffix,
      valuePrefix,
    ],
  );

  return (
    <div className="relative">
      {unitLabel && (
        <div className="absolute right-0 top-0 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
          {unitLabel}
        </div>
      )}
      <Bar
        ref={chartRef}
        className="pt-4"
        data={chartData}
        options={chartOptions}
        {...(width && { width })}
        {...(height && { height })}
      />
    </div>
  );
}
