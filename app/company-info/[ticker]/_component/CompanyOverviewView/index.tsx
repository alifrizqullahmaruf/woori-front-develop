"use client";

import { useParams } from "next/navigation";
import { useCompany } from "@/app/_common/hooks/useCompanies";
import { useDailyPrices } from "@/app/_common/hooks/useDailyPrices";
import { useFundamentals } from "@/app/_common/hooks/useFundamentals";
import { useOutstandingShares } from "@/app/_common/hooks/useOutstandingShares";
import CommonTable from "@/app/_common/component/organism/CommonTable";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";
import { HELP_DESCRIPTIONS_DICTIONARY } from "@/app/_common/const";
import { type DummyTableContents } from "@/app/company-info/[ticker]/_types";
import { DataStateHandler } from "@/app/_common/component/molecules/DataStateHandler";
import { useMemo } from "react";
import {
  formatCurrency,
  formatPercentage,
} from "@/app/_common/services/format";
import {
  fromFinnhubMillionToWon,
  formatWonRaw,
} from "@/app/_common/hooks/formatters";

export default function CompanyOverviewView() {
  //Fetch data using custom hooks
  const params = useParams();
  const ticker = params.ticker as string;

  const { data: companyData, isLoading, error } = useCompany(ticker);

  const {
    data: priceData,
    isLoading: isLoadingPrice,
    error: priceError,
  } = useDailyPrices(ticker);

  const {
    data: fundamentalsData,
    isLoading: isLoadingFundamentals,
    error: fundamentalsError,
  } = useFundamentals(ticker);

  const {
    data: outstandingData,
    isLoading: isLoadingOutstanding,
    error: outstandingError,
  } = useOutstandingShares(ticker);

  const dividerClass =
    "after:bg-border after:my-[18px] after:block after:h-[1px] after:w-full after:content-['']";

  //Process data with useMemo for optimization
  const company = useMemo(() => {
    return companyData?.items?.[0];
  }, [companyData]);

  // Get the latest daily price (sorted by price_date desc)
  const latestDailyPrice = useMemo(() => {
    if (!priceData?.items?.length) return null;
    const sorted = [...priceData.items].sort(
      (a, b) =>
        new Date(b.price_date).getTime() - new Date(a.price_date).getTime(),
    );
    return sorted[0];
  }, [priceData]);

  // Map the latest fundamentals by metric_type, and get the latest settlement info
  const { fundamentalsMap, recentSettlement, fiscalMonth } = useMemo(() => {
    const result: Record<string, number> = {};
    if (!fundamentalsData?.items?.length) {
      return {
        fundamentalsMap: result,
        recentSettlement: "-",
        fiscalMonth: "-",
      };
    }

    // For each metric_type, keep the item with the most recent report_date
    const latestByType = new Map<
      string,
      { value: number; report_date: string }
    >();
    let latestReport: string | null = null;

    for (const item of fundamentalsData.items) {
      const prev = latestByType.get(item.metric_type);
      if (!prev || new Date(item.report_date) > new Date(prev.report_date)) {
        latestByType.set(item.metric_type, {
          value: item.metric_value,
          report_date: item.report_date,
        });
      }
      if (
        !latestReport ||
        new Date(item.report_date) > new Date(latestReport)
      ) {
        latestReport = item.report_date;
      }
    }

    latestByType.forEach((v, k) => {
      result[k] = v.value;
    });

    const recentSettlement = latestReport
      ? new Date(latestReport).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    const fiscalMonth = latestReport
      ? `${new Date(latestReport).getMonth() + 1}월`
      : "-";

    return { fundamentalsMap: result, recentSettlement, fiscalMonth };
  }, [fundamentalsData]);

  // Get the latest outstanding shares (sorted by record_date desc)
  const latestOutstandingShares = useMemo(() => {
    if (!outstandingData?.items?.length) return null;
    const sorted = [...outstandingData.items].sort(
      (a, b) =>
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime(),
    );
    return sorted[0];
  }, [outstandingData]);

  //Dynamically build tableContents using useMemo
  const tableContents1: DummyTableContents[] = useMemo(
    () => [
      {
        category: "기업이름",
        value: {
          companyName: company?.company_name_kr || company?.company_name || "-",
          stockCode: ticker?.toUpperCase() || "-",
        },
      },
      {
        category: "시가총액",
        value:
          latestDailyPrice?.market_cap != null
            ? formatCurrency(latestDailyPrice.market_cap)
            : "-",
      },
      {
        category: "업종",
        value: company?.industry_kr || company?.industry || "-",
      },
      {
        category: "거래소",
        value: company?.exchange_kr || company?.exchange || "-",
      },
    ],
    [company, ticker],
  );

  const tableContents2: DummyTableContents[] = useMemo(
    () => [
      {
        category: "대표자",
        value: company?.ceo_kr || company?.ceo || "-",
      },
      {
        category: "설립일",
        value: "-", // Not available in API
      },
      {
        category: "상장일",
        value: company?.ipo_date
          ? new Date(company.ipo_date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
      },
      {
        category: "최근결산",
        value: recentSettlement,
      },
      {
        category: "결산월",
        value: fiscalMonth,
      },
      {
        category: "자본금",
        value:
          fundamentalsMap?.Capital !== undefined
            ? (formatWonRaw(fromFinnhubMillionToWon(fundamentalsMap.Capital)) ??
              "-")
            : "-",
      },
      {
        category: "발행주식",
        value:
          latestOutstandingShares?.shares_outstanding != null
            ? `${latestOutstandingShares.shares_outstanding.toLocaleString()}주`
            : "-",
      },
      {
        category: "유동비율",
        value:
          fundamentalsMap?.["Current ratio"] !== undefined
            ? formatPercentage(fundamentalsMap["Current ratio"])
            : "-",
      },
    ],
    [
      company,
      fundamentalsMap,
      latestOutstandingShares,
      recentSettlement,
      fiscalMonth,
    ],
  );

  return (
    <DataStateHandler
      isLoading={
        isLoading ||
        isLoadingPrice ||
        isLoadingFundamentals ||
        isLoadingOutstanding
      }
      error={error || priceError || fundamentalsError || outstandingError}
      isEmpty={
        !priceData?.items?.length &&
        !fundamentalsData?.items?.length &&
        !outstandingData?.items?.length
      }
    >
      <PageViewContainer>
        {[tableContents1, tableContents2].map((tableContents, index) => (
          <CommonTable
            key={`table_${index}`}
            shouldDisplayDivider
            tableContents={tableContents}
            // helpTexts={HELP_DESCRIPTIONS_DICTIONARY}
          />
        ))}
        <p className={`text-gray-w800 break-keep ${dividerClass}`}>
          {company?.description_kr || company?.description || "-"}
        </p>
      </PageViewContainer>
    </DataStateHandler>
  );
}
