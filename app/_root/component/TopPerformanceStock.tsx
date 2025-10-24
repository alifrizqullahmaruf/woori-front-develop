import Link from "next/link";
import StockItem from "@/app/_common/component/molecules/StockItem";
import SectionHeader from "@/app/_root/component/common/SectionHeader";
import LogoSaham from "@/public/images/logo_saham.png"

export default function TopPerformanceStock() {
  return (
    <section>
      <SectionHeader
        headingText={"뜨자마자 주가도 쑥"}
        subHeadingText={"화제성이 실제 주가로 이어진 사례들, 확인해보세요."}
        isDisplayingIcon
      />
      <ul className={"mt-[30px] flex flex-col gap-9"}>
        {DUMMY_PERFORMANCE_DATA.map((item, index) => (
          <TopPerformanceStockItem
            key={`performance_${index}_${item.code}`}
            {...item}
            index={index + 1}
          />
        ))}
      </ul>
    </section>
  );
}

const DUMMY_PERFORMANCE_DATA = [
{
    name: "삼성전자 (Samsung Electronics)",
    code: "005930",
    logo: LogoSaham.src,
    returns: 15.3,
    description: "최근 AI 반도체 수요 급증으로 언급량이 4배 증가했어요! (YouTube•Naver 기준)",
    detail: "AI 서버용 HBM 메모리 공급 확대 소식으로 투자자 관심 집중",
  },
  {
    name: "LG에너지솔루션 (LG Energy Solution)",
    code: "373220",
    logo: LogoSaham.src,
    returns: 9.7,
    description: "전기차 배터리 납품 확대 소식으로 언급량이 2.5배 늘었어요! (Reddit•Twitter 기준)",
    detail: "테슬라와의 차세대 배터리 계약 체결이 주가 상승을 견인",
  },
  {
    name: "NAVER Corporation",
    code: "035420",
    logo: LogoSaham.src,
    returns: 6.8,
    description: "클라우드 및 AI 사업 호조로 언급량이 3배 증가했어요! (YouTube 기준)",
    detail: "클로바 AI 기반 서비스 매출 급증 및 일본 시장 진출 강화",
  },
];

interface TopPerformanceStockItemProps {
  index: number;
  name: string;
  code: string;
  logo: string | null;
  returns: number;
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
  return (
    <Link href={`/company-info/${code}`}>
      <div className={"mb-[9px] flex items-center"}>
        <div className={"flex-1"}>
          <StockItem index={index} name={name} logo={logo} isNeedHighlight />
        </div>
        <div
          className={
            "bg-accent-cyan/10 font-family-numbers typo-micro text-accent-cyan ml-auto rounded-2xl px-[9px] py-[3px] font-bold"
          }
        >
          지난 1주일간 {returns > 0 ? "+" : ""}
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
