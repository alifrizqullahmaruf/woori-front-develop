import { useCompanyData } from "@/app/_common/assets/hooks/useApi";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";
import CommonSection from "@/app/company-info/[ticker]/_component/CompanyPerformanceView/CommonSection";
import { useParams } from "next/navigation";
import CommonSectionTest from "./CommonSectionHybrid";
import CommonSectionHybrid from "./CommonSectionHybrid";

const dummyTabData1 = ["매출", "영업이익", "순이익", "영업이익률", "순이익률"];

const dummyTabData2 = [
  "부채비율",
  "유동비율",
  "EPS",
  "ROE",
  "ROA",
  "PER",
  "PBR",
];

export default function CompanyPerformanceView() {
  const params = useParams();
  const ticker = params.ticker as string;

  const { data, isLoading, isError } = useCompanyData(ticker);

  if (isLoading) {
    return (
      <PageViewContainer>
        <div className="flex items-center justify-center py-8">
          <LoadingDots />
        </div>
      </PageViewContainer>
    );
  }

  if (isError || data?.errors.fundamentals) {
    return (
      <PageViewContainer>
        <div className="flex items-center justify-center py-8 text-red-500">
          <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </PageViewContainer>
    );
  }

  return (
    <article className={"flex flex-1 flex-col"}>
      {/* <CommonSection title={"매출과 이익"} tabList={dummyTabData1} />
      <CommonSection title={"재무 비율"} tabList={dummyTabData2} /> */}
      <CommonSectionHybrid
        enableCompare={true}
        title={"매출과 이익"}
        tabList={dummyTabData1}
        fundamentals={data?.fundamentals ?? null} // Pass data API
        maxPoints={4}
      />
      <CommonSectionHybrid
        enableCompare={false}
        title={"재무 비율"}
        tabList={dummyTabData2}
        fundamentals={data?.fundamentals ?? null} // Pass data API
        maxPoints={5}
      />
    </article>
  );
}
