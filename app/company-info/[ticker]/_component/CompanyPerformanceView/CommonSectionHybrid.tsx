"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import ChartFallback from "@/app/_common/component/atoms/ChartFallback";
import ComparePeriodButton from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/ComparePeriodButton";
import ContentsTab from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/ContentsTab";
import InfoButton from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/InfoButton";
import LineChart from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/LineChart";
import Selector from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/Selector";
import { FundamentalsData } from "@/app/_common/services/api";

const BarChart = dynamic(() => import("./BarChart"), {
  ssr: false,
  loading: () => <ChartFallback />,
});

interface CommonSectionProps {
  title: string;
  tabList: string[];
  fundamentals: FundamentalsData | null;
  enableCompare?: boolean; // kalau kamu pakai sebelumnya, biarkan saja
  maxPoints?: number; // how many data points to display
}

export default function CommonSectionHybrid({
  title,
  tabList,
  fundamentals,
  enableCompare = true, // bebas: default true/false sesuai kebutuhanmu
  maxPoints = 6,
}: CommonSectionProps) {
  const [isComparePeriod, toggleComparePeriod] = useHandlePeriodCompare();
  const [activeItem, changeActiveItem] = useHandleTab(tabList);
  const [periodMode, setPeriodMode] = useState<"Quarterly" | "Annual">(
    "Quarterly",
  );
  const handlePeriodChange = useCallback((label: string) => {
    // Selector emits labels: "분기" (Quarterly), "연간" (Annual)
    setPeriodMode(label === "연간" ? "Annual" : "Quarterly");
  }, []);

  const fieldMap: Record<string, string> = {
    // fundamentals (sesuai metric_type di API)
    매출: "Revenue",
    영업이익: "Operating income",
    순이익: "Net income",
    영업이익률: "Operating income margin",
    순이익률: "Net income margin",
    부채비율: "Debt ratio",
    유동비율: "Current ratio",
    EPS: "EPS",
    ROE: "ROE",
    ROA: "ROA",
    // PER di data kamu muncul sebagai "PER Quarterly"
    PER: "PER Quarterly",
    PBR: "PBR",
  };

  const metricType = useMemo(() => fieldMap[activeItem], [activeItem]);

  const isRatioMetric = useMemo(
    () => activeItem.endsWith("률") || activeItem.endsWith("율"),
    [activeItem],
  );

  const chartData = useMemo(() => {
    const mt = metricType;
    if (!mt) return dummyBarChartDataSet;

    // Only use Fundamentals API data
    const allowedPeriods =
      periodMode === "Annual" ? ["FY"] : ["Q1", "Q2", "Q3", "Q4"];
    const sourceItems = fundamentals?.items?.filter(
      (i) => i.metric_type === mt && allowedPeriods.includes(i.fiscal_period),
    );

    if (!sourceItems || !sourceItems.length) {
      return isRatioMetric ? dummyLineChartDataSet : dummyBarChartDataSet;
    }

    const sortedItems = [...sourceItems].sort((a, b) => {
      const dateA = new Date((a as any).report_date || (a as any).metric_date);
      const dateB = new Date((b as any).report_date || (b as any).metric_date);
      return dateA.getTime() - dateB.getTime();
    });

    // Hitung persentase SEBELUM slice
    const allValues = sortedItems.map((i: any) => i.metric_value ?? 0);
    const allPercentages = allValues.map((v, idx) => {
      let compareIdx;

      if (isComparePeriod) {
        // YoY comparison: bandingkan dengan periode yang sama tahun lalu
        compareIdx = periodMode === "Quarterly" ? idx - 4 : idx - 1;
      } else {
        // Sequential comparison: bandingkan dengan periode sebelumnya
        compareIdx = idx - 1;
      }

      // Tidak ada data pembanding
      if (compareIdx < 0) return "-";

      const compareValue = allValues[compareIdx];
      if (compareValue === 0) return "0%";

      const change = ((v - compareValue) / Math.abs(compareValue)) * 100;
      return `${change.toFixed(2)}%`;
    });

    // BARU slice setelah perhitungan persentase
    const recentItems = sortedItems.slice(-maxPoints);
    const values = allValues.slice(-maxPoints);
    const percentages = allPercentages.slice(-maxPoints);

    const labels = recentItems.map((i: any) => {
      const d = new Date(i.report_date || i.metric_date);
      return `${(d.getFullYear() % 100).toString().padStart(2, "0")}년 ${d.getMonth() + 1}월`;
    });

    return { values, percentages, labels };
  }, [
    metricType,
    fundamentals,
    isRatioMetric,
    activeItem,
    periodMode,
    maxPoints,
    isComparePeriod,
  ]);

  // ⬇️ GANTI blok scaleForBar lama
  const scaleForBar = useMemo(
    () => ["Revenue", "Operating income", "Net income"].includes(metricType),
    [metricType],
  );

  // ⬇️ GANTI blok barValuesScaled lama
  const barValuesScaled = useMemo(() => {
    if (!scaleForBar) return chartData.values;
    // 억 → 조 : bagi 10,000
    return chartData.values.map((v) =>
      Number.isFinite(v) ? Number((v / 1000000).toFixed(1)) : 0,
    );
  }, [scaleForBar, chartData.values]);
  const barValueSuffix = useMemo(() => {
    if (["Revenue", "Operating income", "Net income"].includes(metricType)) {
      return "조"; // tetap "조" utk pendapatan
    }
    if (["EPS"].includes(metricType)) {
      return "원";
    }
    if (["ROE", "ROA"].includes(metricType)) {
      return "%";
    }
    if (["PER Quarterly", "PBR"].includes(metricType)) {
      return "";
    }
    return undefined;
  }, [metricType]);
  const barValueDecimals = useMemo(() => {
    if (scaleForBar) return 1; // 1 desimal utk 3 metrik pendapatan (karena sudah /1000)
    return 2; // default 2 desimal utk lainnya (EPS/ROE/ROA/PER/PBR -> "원")
  }, [scaleForBar]);
  const isUpdateChart = enableCompare ? isComparePeriod : false;

  const modalMap: Record<string, typeof modalContents> = {
    "매출과 이익": modalContents,
    "재무 비율": modalContents2,
  };
  const selectedModal = modalMap[title] ?? modalContents;
  return (
    <section className={"pt-6"}>
      <div className={"flex items-center justify-between px-6 pb-3"}>
        <div className={"flex items-center gap-[3px]"}>
          <h2 className={"typo-medium font-bold"}>{title}</h2>
          <InfoButton
            className="bg-black text-white"
            modalDescription={selectedModal}
          />
        </div>

        <div className={"flex items-center gap-[15px]"}>
          {enableCompare && (
            <ComparePeriodButton
              isActive={isComparePeriod}
              toggleActive={toggleComparePeriod}
            />
          )}
          <Selector
            valueSet={["분기", "연간"]}
            value={periodMode === "Annual" ? "연간" : "분기"}
            onChange={handlePeriodChange}
          />
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

const modalContents2 = {
  title: "재무 비율이란?",
  content:
    "부채비율은 총 부채를 자기자본으로 나눈 비율로, 기업의 재무 안정성을 보여줍니다. 높을수록 빚이 많아 위험할 수 있지만, 일정 수준에서는 수익을 키우는 데도 활용됩니다.\n" +
    "유동비율은 유동자산을 유동부채로 나눈 비율로, 기업이 단기 빚을 갚을 수 있는 능력을 나타냅니다. 높을수록 안정적이지만, 너무 높으면 자산을 덜 효율적으로 활용할 수 있습니다.\n" +
    "EPS(Earning Per Share)는 기업이 주식 1주당 얼마나 이익을 냈는지를 나타냅니다. EPS가 높을수록 실적이 좋고 투자 가치도 높은 것으로 평가됩니다.\n" +
    "ROE(Return on Equity)는 자기자본 대비 얼마의 이익을 냈는지를 보여주는 수익성 지표입니다. 높을수록 자본을 효율적으로 운용하고 있다는 뜻입니다.\n" +
    "ROA(Return on Assets)는 총자산을 얼마나 효율적으로 활용해 이익을 냈는지를 나타냅니다. 특히 금융회사에서는 자산 운용 성과를 보여주는 핵심 지표로 사용됩니다.\n" +
    "PER(Price to Earnings Ratio)은 주가가 주당순이익(EPS)의 몇 배인지 보여주는 지표로, 낮을수록 상대적으로 저평가된 주식일 수 있습니다. 업종 내 비교를 통해 해석하는 것이 일반적입니다.\n" +
    "PBR(Price to Book Ratio)는 주가가 주당순자산가치(청산 시 주주의 몫)의 몇 배인지를 나타냅니다. 1보다 낮으면 시장에서 자산가치보다 낮게 평가된 상태로 볼 수 있습니다.\n",
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
