"use client";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import StockItem from "@/app/_common/component/molecules/StockItem";
import SectionHeader from "@/app/_root/component/common/SectionHeader";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";

import {
  useAllDailyPrices2,
  useAllCompanies,
} from "@/app/_common/assets/hooks/useApi";
import type {
  DailyPricesItem,
  CompaniesData,
} from "@/app/_common/services/api";

// ---- Helper: hitung return mingguan per ticker ----
function computeWeeklyReturns(
  prices: DailyPricesItem[],
  weekStart: Date,
  weekEnd: Date,
) {
  // filter data pada rentang minggu ini
  const withinWeek = prices.filter((p) => {
    const d = new Date(p.price_date);
    return d >= weekStart && d <= weekEnd;
  });

  // group by ticker
  const byTicker = new Map<string, DailyPricesItem[]>();
  for (const row of withinWeek) {
    const arr = byTicker.get(row.ticker) ?? [];
    arr.push(row);
    byTicker.set(row.ticker, arr);
  }

  // untuk tiap ticker: sort by date, ambil first & last close, compute return%
  const results: Array<{
    ticker: string;
    weeklyReturnPct: number; // dalam %
    firstDate: string;
    lastDate: string;
  }> = [];

  for (const [ticker, arr] of byTicker) {
    if (arr.length < 2) continue; // butuh minimal 2 titik untuk return mingguan
    arr.sort(
      (a, b) => new Date(a.price_date).getTime() - new Date(b.price_date).getTime(),
    );
    const first = arr[0];
    const last = arr[arr.length - 1];
    if (!first.closing_price || !last.closing_price) continue;
    if (first.closing_price === 0) continue;

    const weeklyReturnPct =
      ((last.closing_price - first.closing_price) / first.closing_price) * 100;

    results.push({
      ticker,
      weeklyReturnPct,
      firstDate: first.price_date,
      lastDate: last.price_date,
    });
  }

  // sort desc dan ambil top 3
  results.sort((a, b) => b.weeklyReturnPct - a.weeklyReturnPct);
  return results.slice(0, 3);
}

// ---- Komponen ----
export default function TopPerformanceStock() {
  const { data: allDailyPrices, isLoading: isLoadingPrices, error: errorPrices } = useAllDailyPrices2();
  const { data: allCompanies, isLoading: isLoadingCompanies, error: errorCompanies } = useAllCompanies();

  // 🧩 Hooks must always be called — even if data isn't ready yet
  const companyIndex = useMemo(() => {
    if (!allCompanies?.items) return new Map();
    const map = new Map();
    for (const c of allCompanies.items) map.set(c.ticker, c);
    return map;
  }, [allCompanies]);

  const performanceData = useMemo(() => {
    if (!allDailyPrices?.items || companyIndex.size === 0) return [];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const top3 = computeWeeklyReturns(allDailyPrices.items, weekStart, now);
    return top3.map((row, idx) => {
      const company = companyIndex.get(row.ticker);
      return {
        index: idx + 1,
        name: company?.company_name_kr || company?.company_name || row.ticker,
        code: row.ticker,
        logo: company?.logo_url ?? null,
        returns: Number(row.weeklyReturnPct.toFixed(2)),
        description: "언급량이 5배나 늘었어요!(YouTube•Reddit 기준)",
        detail: "최근 1주 수익률 기준 상위 종목",
      };
    });
  }, [allDailyPrices, companyIndex]);

  // ✅ Now you can safely use early returns AFTER all hooks
  if (isLoadingPrices || isLoadingCompanies) {
    return (
      <>
        <SectionHeader headingText="뜨자마자 주가도 쑥" subHeadingText="화제성이 실제 주가로 이어진 사례들, 확인해보세요." isDisplayingIcon />
        <LoadingDots />
      </>
    );
  }

  if (errorPrices || errorCompanies) {
    return (
      <>
        <SectionHeader headingText="뜨자마자 주가도 쑥" subHeadingText="화제성이 실제 주가로 이어진 사례들, 확인해보세요." isDisplayingIcon />
        <div>데이터 오류</div>
      </>
    );
  }

  return (
    <section>
      <SectionHeader
        headingText="뜨자마자 주가도 쑥"
        subHeadingText="화제성이 실제 주가로 이어진 사례들, 확인해보세요."
        isDisplayingIcon
      />
      <ul className="mt-[30px] flex flex-col gap-9">
        {performanceData.map((item) => (
          <TopPerformanceStockItem key={`performance_${item.code}`} {...item} />
        ))}
      </ul>
    </section>
  );
}

interface TopPerformanceStockItemProps {
  index: number;
  name: string;
  code: string;
  logo: string | null;
  returns: number; // %
  description: string;
  detail: string;
}

function TopPerformanceStockItem({
  index,
  name,
  code,
  logo,
  returns,
  description,
  detail,
}: TopPerformanceStockItemProps) {
  const isUp = returns > 0;
  return (
    <Link href={`/company-info/${code}`}>
      <div className={"mb-[9px] flex items-center"}>
        <div className={"flex-1"}>
          <StockItem index={index} name={name} logo={logo} isNeedHighlight />
        </div>
        <div
          className={[
            "font-family-numbers typo-micro ml-auto rounded-2xl px-[9px] py-[3px] font-bold",
            isUp
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600",
          ].join(" ")}
        >
          지난 1주일간 {isUp ? "+" : ""}
          {returns}%
        </div>
      </div>
      <div>
        <p className={"typo-small line-clamp-1 font-medium"}>{description}</p>
        <p className={"typo-small text-gray-w600 line-clamp-1"}>{detail}</p>
      </div>
    </Link>
  );
}
