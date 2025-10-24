import { useParams } from "next/navigation";
import {
  formatWonRaw,
  fromFinnhubMillionToWon,
  useCompanyData,
} from "@/app/_common/assets/hooks/useApi";
import CommonTable from "@/app/_common/component/organism/CommonTable";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";
import { HELP_DESCRIPTIONS_DICTIONARY } from "@/app/_common/const";
import { type DummyTableContents } from "@/app/company-info/[ticker]/_types";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";
import { formatCurrency, formatPercentage } from "@/app/_common/services/api";

export default function CompanyOverviewView() {
  const params = useParams();
  const ticker = params.ticker as string;

  // API fetch menggunakan hook serupa
  const { data, isLoading, error: queryError } = useCompanyData(ticker);

  // Handle loading
  if (isLoading) {
    return (
      <PageViewContainer>
        <div className="flex items-center justify-center py-8">
          <LoadingDots />
        </div>
      </PageViewContainer>
    );
  }

  // Handle error
  if (
    queryError ||
    data?.errors.fundamentals ||
    data?.errors.ownership ||
    data?.errors.company ||
    data?.errors.dailyPrices ||
    data?.errors.outstandingShares
  ) {
    return (
      <PageViewContainer>
        <div className="flex items-center justify-center py-8 text-red-500">
          <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </PageViewContainer>
    );
  }

  const dividerClass =
    "after:bg-border after:my-[18px] after:block after:h-[1px] after:w-full after:content-['']";

  // Ambil data company (assuming items[0] seperti pola API)
  const companyData = data?.company?.items?.[0];

  // Ambil data daily prices terbaru (assuming items[0] adalah terbaru)
  const latestDailyPrice = data?.dailyPrices?.items?.[0];

  // Ambil data outstanding shares terbaru
  const latestOutstandingShares = data?.outstandingShares?.items?.[0];

  // Process fundamentals menjadi map berdasarkan metric_type (assuming all untuk period terbaru)
  const fundamentalsMap: { [key: string]: number } =
    data?.fundamentals?.items?.reduce(
      (acc: { [key: string]: number }, item) => {
        acc[item.metric_type] = item.metric_value;
        return acc;
      },
      {},
    ) || {};

  // Ambil latest report_date dan fiscal info berdasarkan tanggal terbaru
  const fundamentalsItems = data?.fundamentals?.items || [];
  const latestFundamentalByDate = fundamentalsItems.length
    ? fundamentalsItems.reduce((latest, item) => {
        const ld = new Date(latest.report_date);
        const cd = new Date(item.report_date);
        return cd.getTime() > ld.getTime() ? item : latest;
      }, fundamentalsItems[0])
    : undefined;

  const fiscalMonth = latestFundamentalByDate?.report_date
    ? new Date(latestFundamentalByDate.report_date).getMonth() + 1 + "월"
    : "-";

  const recentSettlement = latestFundamentalByDate?.report_date
    ? new Date(latestFundamentalByDate.report_date).toLocaleDateString(
        "ko-KR",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )
    : "-";

  // Build tableContents secara dinamis
  const tableContents1: DummyTableContents[] = [
    {
      category: "기업이름",
      value: {
        companyName:
          companyData?.company_name_kr || companyData?.company_name || "-",
        stockCode: ticker?.toUpperCase() || "-",
      },
    },
    {
      category: "시가총액",
      value:
        typeof latestDailyPrice?.market_cap === "number"
          ? formatCurrency(latestDailyPrice.market_cap)
          : "-",
    },
    {
      category: "업종",
      value: companyData?.industry_kr || companyData?.industry || "-",
    },
    {
      category: "거래소",
      value: companyData?.exchange_kr || companyData?.exchange || "-",
    },
  ];

  const tableContents2: DummyTableContents[] = [
    {
      category: "대표자",
      value: companyData?.ceo_kr || companyData?.ceo || "-",
    },
    {
      category: "설립일",
      value: "-", // Tidak ada di API, fallback
    },
    {
      category: "상장일",
      value: companyData?.ipo_date
        ? new Date(companyData.ipo_date).toLocaleDateString("ko-KR", {
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
      value: latestOutstandingShares?.shares_outstanding
        ? `${latestOutstandingShares.shares_outstanding.toLocaleString()}주`
        : "-",
    },
    {
      category: "유동비율",
      value: fundamentalsMap?.current_ratio
        ? formatPercentage(fundamentalsMap.current_ratio)
        : "-",
    },
  ];

  // 주요매출 관련 표는 제거되었습니다.

  return (
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
        {companyData?.description_kr || companyData?.description || "-"}
      </p>
      {/* 주요매출 표 섹션 제거됨 */}
    </PageViewContainer>
  );
}
