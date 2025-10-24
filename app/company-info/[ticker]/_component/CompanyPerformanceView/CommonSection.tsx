"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import ChartFallback from "@/app/_common/component/atoms/ChartFallback";
import ComparePeriodButton from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/ComparePeriodButton";
import ContentsTab from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/ContentsTab";
import InfoButton from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/InfoButton";
import LineChart from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/LineChart";
import Selector from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/Selector";
import {
  FundamentalsData,
  DailyFinancialMetricsData,
} from "@/app/_common/services/api";

// ...imports tetap...

const BarChart = dynamic(() => import("./BarChart"), {
  ssr: false,
  loading: () => <ChartFallback />,
});

interface CommonSectionProps {
  title: string;
  tabList: string[];
  fundamentals: FundamentalsData | null;
  dailyMetrics: DailyFinancialMetricsData | null;
  enableCompare?: boolean; // kalau kamu pakai sebelumnya, biarkan saja
}

export default function CommonSectionHybrid({
  title,
  tabList,
  fundamentals,
  dailyMetrics,
  enableCompare = true, // bebas: default true/false sesuai kebutuhanmu
}: CommonSectionProps) {
  const [isComparePeriod, toggleComparePeriod] = useHandlePeriodCompare();
  const [activeItem, changeActiveItem] = useHandleTab(tabList);

  const fieldMap: Record<string, string> = {
    // fundamentals
    "매출": "revenue",
    "영업이익": "operating_income",
    "순이익": "net_income",
    "영업이익률": "operating_margin",
    "순이익률": "net_margin",
    "부채비율": "debt_ratio",
    "유동비율": "current_ratio",
    // daily
    "EPS": "eps",
    "ROE": "roe",
    "ROA": "roa",
    "PER": "per",
    "PBR": "pbr",
  };

  const metricType = useMemo(() => fieldMap[activeItem], [activeItem]);

  const isDailyMetric = useMemo(() => {
    const dailyKeys = ["per", "pbr", "roe", "roa", "eps"];
    return dailyKeys.includes(metricType);
  }, [metricType]);

  const isRatioMetric = useMemo(
    () => activeItem.endsWith("률") || activeItem.endsWith("율"),
    [activeItem],
  );

  const chartData = useMemo(() => {
    const mt = metricType;
    if (!mt) return dummyBarChartDataSet;

    const sourceItems = isDailyMetric
      ? dailyMetrics?.items?.filter((i) => i.metric_type === mt)
      : fundamentals?.items?.filter((i) => i.metric_type === mt);

    if (!sourceItems || !sourceItems.length) {
      return isRatioMetric ? dummyLineChartDataSet : dummyBarChartDataSet;
    }

    const sortedItems = [...sourceItems].sort((a, b) => {
      const dateA = new Date((a as any).report_date || (a as any).metric_date);
      const dateB = new Date((b as any).report_date || (b as any).metric_date);
      return dateA.getTime() - dateB.getTime();
    });

    const recentItems = sortedItems.slice(-6);
    const values = recentItems.map((i: any) => i.metric_value ?? 0);

    const labels = recentItems.map((i: any) => {
      const d = new Date(i.report_date || i.metric_date);
      return `${(d.getFullYear() % 100).toString().padStart(2, "0")}년 ${d.getMonth() + 1}월`;
    });

    const percentages = values.map((v, idx) => {
      if (idx === 0) return "0%";
      const prev = values[idx - 1];
      const change = prev !== 0 ? ((v - prev) / Math.abs(prev)) * 100 : 0;
      return `${change.toFixed(2)}%`;
    });

    return { values, percentages, labels };
  }, [metricType, fundamentals, dailyMetrics, isDailyMetric, isRatioMetric, activeItem]);

  // ⬇️ HANYA untuk BarChart + metrik tertentu → scale /1000 + 1 desimal
  const scaleForBar = useMemo(
    () => ["revenue", "operating_income", "net_income"].includes(metricType),
    [metricType],
  );

  const barValuesScaled = useMemo(() => {
    if (!scaleForBar) return chartData.values;
    // bagi 1000 dan bulatkan ke 1 desimal (angka-nya langsung dibulatkan)
    return chartData.values.map((v) => Number.isFinite(v) ? Number((v / 1000).toFixed(1)) : 0);
  }, [scaleForBar, chartData.values]);
const barValueSuffix = useMemo(() => {
  if (["revenue", "operating_income", "net_income"].includes(metricType)) {
    return "조";               // tetap "조" utk pendapatan
  }
  if (["eps"].includes(metricType)) {
    return "원";               
  }
  if (["roe", "roa"].includes(metricType)) {
    return "%";               
  }
  if (["per", "pbr"].includes(metricType)) {
    return "";               
  }
  return undefined;            
}, [metricType]);
const barValueDecimals = useMemo(() => {
  if (scaleForBar) return 1;   // 1 desimal utk 3 metrik pendapatan (karena sudah /1000)
  return 2;                    // default 2 desimal utk lainnya (EPS/ROE/ROA/PER/PBR -> "원")
}, [scaleForBar]);
  const isUpdateChart = enableCompare ? isComparePeriod : false;

  return (
    <section className={"pt-6"}>
      <div className={"flex items-center justify-between px-6 pb-3"}>
        <div className={"flex items-center gap-[3px]"}>
          <h2 className={"typo-medium font-bold"}>{title}</h2>
          <InfoButton modalDescription={modalContents} />
        </div>

        <div className={"flex items-center gap-[15px]"}>
          {enableCompare && (
            <ComparePeriodButton
              isActive={isComparePeriod}
              toggleActive={toggleComparePeriod}
            />
          )}
          <Selector valueSet={["분기", "연간"]} />
        </div>
      </div>

      <ContentsTab
        itemList={tabList}
        activeItem={activeItem}
        activateItem={changeActiveItem}
      />

      <div className={"m-6 h-[212px] px-3"}>
        {isRatioMetric ? (
          // LineChart TIDAK di-scale
          <LineChart
            rawData={chartData.values}
            labels={chartData.labels}
            additionalLabels={chartData.percentages}
            isUpdateChart={isUpdateChart}
            height={212}
          />
        ) : (
          // BarChart: pakai nilai TER-SCALE hanya untuk 3 metrik itu
          <BarChart
            rawData={barValuesScaled}
            labels={chartData.labels}
            additionalLabels={chartData.percentages}
            isUpdateChart={isUpdateChart}
            height={212}
            // ⬇️ tampilkan 1 desimal hanya saat scaleForBar = true
            valueDecimals={scaleForBar ? 1 : 2}
            valueSuffix={barValueSuffix}
          />
        )}
      </div>

      <hr className={"bg-divider h-2 border-none"} />
    </section>
  );
}

// ...dummy datasets & hooks tetap...


/* ------------------------------------------------- */

const dummyBarChartDataSet = {
  values: [74.0, 79.0, 75.7, 79.1],
  percentages: ["23.44%", "17.35%", "11.82%", "10.05%"],
  labels: ["24년 6월", "24년 9월", "24년 12월", "25년 3월"],
};

const dummyLineChartDataSet = {
  values: [14.1, 11.61, 8.56, 8.44],
  percentages: ["12.98%", "8.00%", "4.40%", "-0.73%"],
  labels: ["24년 6월", "24년 9월", "24년 12월", "25년 3월"],
};

const modalContents = {
  title: "매출과 이익이란?",
  content:
    "주식을 구매를 하더라도 배당받는 권리가 부여되지 않는 날을 의미합니다. 배당락일이 되면 주식의 가치를 지키기 위해 배당금만큼 주식 가격이 낮아집니다.\n",
};

const useHandlePeriodCompare = () => {
  const [isComparePeriod, setIsComparePeriod] = useState(false);
  const toggleComparePeriod = useCallback(() => {
    setIsComparePeriod((prev) => !prev);
  }, []);
  return [isComparePeriod, toggleComparePeriod] as const;
};

const useHandleTab = (tabList: string[]) => {
  const [activeItem, setActiveItem] = useState(tabList[0]);
  const changeActiveItem = useCallback((name: string) => {
    setActiveItem(name);
  }, []);
  return [activeItem, changeActiveItem] as const;
};
