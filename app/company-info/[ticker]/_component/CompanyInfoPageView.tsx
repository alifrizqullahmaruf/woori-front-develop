"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataStateHandler } from "@/app/_common/component/molecules/DataStateHandler";
import TabList from "@/app/_common/component/organism/TabList";
import { CompanySearch } from "@/app/_common/component/molecules/CompanySearch";
import { useAllCompanies, useCompany } from "@/app/_common/hooks/useCompanies";
import { useDailyPricesLatest } from "@/app/_common/hooks/useDailyPrices";
import {
  formatCurrency,
  formatPercentage,
  getCurrencySymbol,
} from "@/app/_common/services/format";
import { TabListData } from "@/app/_common/types";
import CompanyDividendView from "@/app/company-info/[ticker]/_component/CompanyDividendView";
import CompanyOverviewView from "@/app/company-info/[ticker]/_component/CompanyOverviewView";
import CompanyPerformanceView from "@/app/company-info/[ticker]/_component/CompanyPerformanceView";
import CompanyShareView from "@/app/company-info/[ticker]/_component/CompanyShareView";

export default function CompanyInfoPageView() {
  const router = useRouter();
  const [view, changeMenu, currentMenu] = useCompanyInfoTab();
  
  // Read URL params with explicit typing and runtime-safe normalization.
  const { ticker: paramTicker } = useParams<{ ticker?: string | string[] }>();
  const ticker = useMemo(() => {
    if (typeof paramTicker === "string") return paramTicker;
    if (Array.isArray(paramTicker) && typeof paramTicker[0] === "string") return paramTicker[0];
    return "";
  }, [paramTicker]);

  // If ticker is missing or invalid, surface a clear error via DataStateHandler.
  const paramsError = useMemo(() => {
    return ticker ? null : new Error("Invalid or missing ticker URL parameter.");
  }, [ticker]);

  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useCompany(ticker);
  const { data: priceData, isLoading: isLoadingPrice, error: priceError } = useDailyPricesLatest(ticker);
  const { data: allCompanies, isLoading: isLoadingCompanies } = useAllCompanies();

  const isLoading = isLoadingCompany || isLoadingPrice;
  const error = paramsError || companyError || priceError;

  const { formattedPrice, formattedChange, priceColor, companyName, currencySymbol } = useMemo(() => {
    if (!priceData?.items?.length) {
      return {
        latestPrice: null,
        formattedPrice: "N/A",
        formattedChange: "N/A",
        priceColor: "text-gray-500",
        companyName: " ",
        currencySymbol: "원",
      };
    }

    const sortedItems = [...priceData.items].sort(
      (a, b) => new Date(b.price_date).getTime() - new Date(a.price_date).getTime()
    );
    const latest = sortedItems[0];

    const percentChange = latest?.percent_change ?? 0;
    const netChange = latest?.net_change ?? 0;
    const price = latest?.closing_price != null ? formatCurrency(latest.closing_price) : "N/A";
    const change =
      latest && latest.percent_change != null && latest.net_change != null
        ? `${percentChange >= 0 ? "+" : ""}${formatPercentage(percentChange / 100)} (${formatCurrency(Math.abs(netChange))})`
        : "N/A";
    const color = percentChange >= 0 ? "text-red-500" : "text-blue-500";
    const name = companyData?.items?.[0]?.company_name_kr || companyData?.items?.[0]?.company_name || " ";
    const currency = latest?.currency ? getCurrencySymbol(latest.currency) : "원";

    return {
      latestPrice: latest,
      formattedPrice: price,
      formattedChange: change,
      priceColor: color,
      companyName: name,
      currencySymbol: currency,
    };
  }, [priceData, companyData]);

  return (
    <DataStateHandler isLoading={isLoading} error={error}>
      <article className="flex flex-1 flex-col pb-[52px]">
        {/* Full-width search at top */}
        <div className="px-6 pt-4">
          <CompanySearch
            companies={allCompanies?.items || []}
            isLoading={isLoadingCompanies}
            onSelect={(selectedTicker) => {
              router.push(`/company-info/${selectedTicker}`);
            }}
            placeholder="종목 검색"
          />
        </div>
        
        <header className="relative p-6 pt-3">
          <h1 className="typo-large font-medium">
            {companyName}
            <div className="typo-num-large flex items-center gap-2.5 font-black">
              {formattedPrice.replace("원", currencySymbol)}
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
        {currentMenu === "dividend" && <hr className="bg-divider mt-1.5 h-6 border-none" />}
      </article>
    </DataStateHandler>
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