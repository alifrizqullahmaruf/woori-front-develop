import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";
import { Back } from "@/app/_common/component/atoms/Icon";
import { DataStateHandler } from "@/app/_common/component/molecules/DataStateHandler";
import CommonTable from "@/app/_common/component/organism/CommonTable";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";
import { HELP_DESCRIPTIONS_DICTIONARY } from "@/app/_common/const";
import {
  useDividendsEvents,
  useDividendsTTM,
} from "@/app/_common/hooks/useDividends";
import { type DummyTableContents } from "@/app/company-info/[ticker]/_types";

function getFrequencyNumber(frequency: string): number | null {
  switch (frequency.toUpperCase()) {
    case "MONTHLY":
      return 12;
    case "QUARTERLY":
      return 4;
    case "SEMI_ANNUAL":
    case "SEMI-ANNUAL":
      return 2;
    case "ANNUAL":
      return 1;
    default:
      return null;
  }
}

export default function CompanyDividendView() {
  const pathname = usePathname();
  const params = useParams();
  const ticker = params.ticker as string;

  const {
    data: dividendsEventsData,
    isLoading: isLoadingEvents,
    error: errorEvents,
  } = useDividendsEvents(ticker);

  const {
    data: dividendsTTMData,
    isLoading: isLoadingTTM,
    error: errorTTM,
  } = useDividendsTTM(ticker);

  const isLoading = isLoadingEvents || isLoadingTTM;
  const error = errorEvents || errorTTM;

  // Memoized table contents
  const tableContents = useMemo(() => {
    const latestEvent = dividendsEventsData?.items?.[0];
    const ttm = dividendsTTMData?.items?.[0];
    const frequencyNum = latestEvent?.frequency
      ? getFrequencyNumber(latestEvent.frequency)
      : null;

    return [
      {
        category: "1주당 배당금",
        value: latestEvent?.dividend_amount
          ? latestEvent.currency === "USD"
            ? `$${latestEvent.dividend_amount.toFixed(2)}`
            : `${latestEvent.dividend_amount}원`
          : "-",
      },
      {
        category: "배당 횟수",
        value: frequencyNum !== null ? `1년에 ${frequencyNum}회` : "-",
      },
      {
        category: "배당 수익률",
        value: ttm?.dividend_yield_ttm
          ? `연 ${ttm.dividend_yield_ttm.toFixed(2)}%`
          : "-",
      },
      {
        category: "배당성향",
        value: ttm?.payout_ratio_ttm
          ? `연 ${(ttm.payout_ratio_ttm * 100).toFixed(2)}%`
          : "-",
      },
      {
        category: "배당락일",
        value: latestEvent?.ex_dividend_date
          ? new Date(latestEvent.ex_dividend_date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
      },
    ] as DummyTableContents[];
  }, [dividendsEventsData, dividendsTTMData]);

  return (
    <DataStateHandler
      isLoading={isLoading}
      error={error}
      title="최근 배당 기준"
      isEmpty={
        !dividendsEventsData?.items?.length && !dividendsTTMData?.items?.length
      }
    >
      <PageViewContainer>
        <h2 className="typo-micro mb-[18px]">최근 배당 기준</h2>
        <CommonTable
          tableContents={tableContents}
          helpTexts={HELP_DESCRIPTIONS_DICTIONARY}
        />
        <hr className="border-border my-6" />
        <Link
          href={`${pathname}/dividend-detail`}
          className="text-gray-w600 flex items-center justify-center gap-1.5"
        >
          <span>최근 배당 내역</span>
          <Back className="mt-[2px] size-[15px] rotate-180" />
        </Link>
      </PageViewContainer>
    </DataStateHandler>
  );
}
