import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  useDividendsEvents,
  useDividendsTTM,
} from "@/app/_common/assets/hooks/useApi";
import { Back } from "@/app/_common/component/atoms/Icon";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";
import CommonTable from "@/app/_common/component/organism/CommonTable";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";
import { HELP_DESCRIPTIONS_DICTIONARY } from "@/app/_common/const";
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

  // API
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

  // Loading still needs to be implemented on every page
  if (isLoadingEvents || isLoadingTTM) {
    return (
      <PageViewContainer>
        <h2 className={"typo-micro mb-[18px]"}>최근 배당 기준</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingDots />
        </div>
      </PageViewContainer>
    );
  }

  // Error still needs to be implemented on every page
  if (errorEvents || errorTTM) {
    return (
      <PageViewContainer>
        <h2 className={"typo-micro mb-[18px]"}>최근 배당 기준</h2>
        <div className="flex items-center justify-center py-8 text-red-500">
          <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </PageViewContainer>
    );
  }

  // latest dividend event index 0 (assuming sorted descending by date)
  const latestEvent = dividendsEventsData?.items?.[0];
  // TTM data (assuming single item)
  const ttm = dividendsTTMData?.items?.[0];

  const frequencyNum = latestEvent?.frequency
    ? getFrequencyNumber(latestEvent.frequency)
    : null;

  const tableContents: DummyTableContents[] = [
    {
      category: "1주당 배당금",
      value: latestEvent?.dividend_amount
        ? `${latestEvent.dividend_amount}원`
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
  ];

  return (
    <PageViewContainer>
      <h2 className={"typo-micro mb-[18px]"}>최근 배당 기준</h2>
      <CommonTable
        tableContents={tableContents}
        helpTexts={HELP_DESCRIPTIONS_DICTIONARY}
      />
      <hr className={"border-border my-6"} />
      <Link
        href={`${pathname}/dividend-detail`}
        className={"text-gray-w600 flex items-center justify-center gap-1.5"}
      >
        <span>최근 배당 내역</span>
        <Back className={"mt-[2px] size-[15px] rotate-180"} />
      </Link>
    </PageViewContainer>
  );
}
