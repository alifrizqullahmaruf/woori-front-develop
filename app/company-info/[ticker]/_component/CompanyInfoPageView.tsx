"use client";

import { useCallback, useMemo, useState } from "react";
import TabList from "@/app/_common/component/organism/TabList";
import {
  formatCurrency,
  formatPercentage,
  getCurrencySymbol,
} from "@/app/_common/services/api";
import { TabListData } from "@/app/_common/types";
import CompanyDividendView from "@/app/company-info/[ticker]/_component/CompanyDividendView";
import CompanyOverviewView from "@/app/company-info/[ticker]/_component/CompanyOverviewView";
import CompanyPerformanceView from "@/app/company-info/[ticker]/_component/CompanyPerformanceView";
import CompanyShareView from "@/app/company-info/[ticker]/_component/CompanyShareView";
import { useParams, usePathname } from "next/navigation";
import { useCompanyData } from "@/app/_common/assets/hooks/useApi";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";

export default function CompanyInfoPageView() {
  const [view, changeMenu, currentMenu] = useCompanyInfoTab();
  const pathname = usePathname();
  const params = useParams();
  const ticker = params.ticker as string;

  const { data: companyData, isLoading, error } = useCompanyData(ticker);
  const latestPrice = useMemo(() => {
    if (!companyData?.dailyPrices?.items?.length) return null;

    // Jika belum sorted, sort descending by price_date
    const sortedItems = [...companyData.dailyPrices.items].sort(
      (a, b) =>
        new Date(b.price_date).getTime() - new Date(a.price_date).getTime(),
    );

    return sortedItems[0]; // Latest
  }, [companyData]);

  // Tambahan: Format values with null handling
  const percentChange = latestPrice?.percent_change ?? 0; // Default to 0 if null
  const netChange = latestPrice?.net_change ?? 0; // Default to 0 if null
  const formattedPrice =
    latestPrice?.closing_price != null
      ? formatCurrency(latestPrice.closing_price)
      : "N/A";
  const formattedChange =
    latestPrice &&
    latestPrice.percent_change != null &&
    latestPrice.net_change != null
      ? `${percentChange >= 0 ? "+" : ""}${formatPercentage(percentChange / 100)} (${formatCurrency(Math.abs(netChange))})` // Add currency to netChange
      : "N/A";
  const priceColor = percentChange >= 0 ? "text-red-500" : "text-blue-500";
  const companyName =
    companyData?.company?.items[0]?.company_name_kr ||
    companyData?.company?.items[0]?.company_name ||
    " ";
  const currencySymbol = latestPrice?.currency
    ? getCurrencySymbol(latestPrice.currency)
    : "원";
  if (isLoading) {
    return (
      <article className={"flex flex-1 flex-col pb-[52px]"}>
        <header className={"p-6 pt-1"}>
          <LoadingDots />
        </header>
        <nav>
          <TabList tabDataList={menuList} onClickAction={changeMenu} />
        </nav>
        {view}
        {currentMenu === "dividend" && (
          <hr className={"bg-divider mt-1.5 h-6 border-none"} />
        )}
      </article>
    );
  }
  // Error still needs to be implemented on every page
  if (error) {
    return (
      <article className={"flex flex-1 flex-col pb-[52px]"}>
        <h2 className={"typo-micro mb-[18px]"}>최근 배당 기준</h2>
        <div className="flex items-center justify-center py-8 text-red-500">
          <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </article>
    );
  }

  return (
    <article className={"flex flex-1 flex-col pb-[52px]"}>
      <header className={"p-6 pt-1"}>
        <h1 className={"typo-large font-medium"}>
          {companyName}
          {/* TODO: Lato 서브셋에 , 추가 */}
          <div
            className={"typo-num-large flex items-center gap-2.5 font-black"}
          >
            {formattedPrice.replace("원", currencySymbol)}{" "}
            {/* Adjust jika formatCurrency sudah include unit */}
            <span className={`typo-num-base ${priceColor} font-bold`}>
              {formattedChange.replace("원", currencySymbol)}
            </span>
          </div>
        </h1>
      </header>
      <nav>
        <TabList tabDataList={menuList} onClickAction={changeMenu} />
      </nav>
      {view}
      {currentMenu === "dividend" && (
        <hr className={"bg-divider mt-1.5 h-6 border-none"} />
      )}
    </article>
  );
}

const menuList: TabListData[] = [
  { text: "배당", value: "dividend" },
  { text: "실적", value: "performance" },
  { text: "개요", value: "info" },
  { text: "지분", value: "share" },
];

const useCompanyInfoTab = () => {
  const [currentMenu, setCurrentMenu] = useState<TabListData>(menuList[0]);

  const changeMenu = useCallback((value: TabListData["value"]) => {
    setCurrentMenu((prev) => ({
      ...prev,
      ...menuList.find((data) => data.value === value),
    }));
  }, []);

  const view = useMemo(() => {
    switch (currentMenu.value) {
      case "dividend":
        return <CompanyDividendView />;
      case "performance":
        return <CompanyPerformanceView />;
      case "info":
        return <CompanyOverviewView />;
      case "share":
        return <CompanyShareView />;
      default:
        return <div>오류가 발생했습니다.</div>;
    }
  }, [currentMenu]);

  return [view, changeMenu, currentMenu.value] as const;
};
