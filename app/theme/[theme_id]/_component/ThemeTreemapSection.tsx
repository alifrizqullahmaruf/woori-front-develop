"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import DisplayMoreButton from "@/app/_common/component/molecules/DisplayMoreButton";
import StockItem from "@/app/_common/component/molecules/StockItem";

const Treemap = dynamic(() => import("./ThemeTreemap"), {
  ssr: false,
  loading: () => <div className={"bg-border aspect-square"} />,
});

export default function ThemeTreemapSection() {
  const [isHideAdditionalList, handleHideAdditionalList] =
    useHideAdditionalList();
  const [selectedTheme, handleSelectTheme] = useSelectTheme();

  return (
    <div>
      <header className={"mb-[21px]"}>
        <h2 className={"typo-large font-bold"}>
          최근 7일간 테마 수익률을 정리했어요
        </h2>
        <p className={"typo-small text-black"}>탭하면 자세히 볼 수 있어요.</p>
      </header>
      <Treemap
        data={DUMMY_THEME_DATA}
        selectedTheme={selectedTheme}
        changeTheme={handleSelectTheme}
      />
      <ul
        className={
          "border-border mt-6 mb-[18px] flex flex-col gap-[21px] border-b pb-[18px]"
        }
      >
        {DUMMY_THEME_ITEMS_DATA.slice(
          0,
          isHideAdditionalList ? 5 : DUMMY_THEME_ITEMS_DATA.length,
        ).map((item, index) => (
          <li key={`theme_treemap_${item.name}`}>
            <Link
              href={`/company-info/${item.code}`}
              className={"flex items-center justify-between"}
            >
              <StockItem index={index + 1} name={item.name} logo={item.logo} />
              <span
                className={`font-family-numbers font-bold ${item.returns > 0 ? "text-accent-red" : "text-primary-900"}`}
              >
                {item.returns > 0 ? "+" : ""}
                {item.returns}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <DisplayMoreButton
        isSpread={!isHideAdditionalList}
        onClick={handleHideAdditionalList}
      />
    </div>
  );
}

const DUMMY_THEME_DATA = [
  { name: "전기차", value: 12.25 },
  { name: "원자력발전", value: 6.44 },
  { name: "전기설비", value: 3.12 },
  { name: "소프트웨어", value: 2.52 },
  { name: "드론", value: 1.61 },
  { name: "동영상", value: -1.77 },
  { name: "인공지능", value: -2.22 },
  { name: "클라우드", value: -4.35 },
  { name: "반도체팹리스", value: -6.8 },
  { name: "암호화폐", value: -8.29 },
];

const DUMMY_THEME_ITEMS_DATA = [
  {
    name: "삼성전자(Test)",
    code: "005930",
    logo: null,
    returns: 23,
  },
  {
    name: "Apple(Test)",
    code: "AAPL",
    logo: null,
    returns: 8,
  },
  {
    name: "Naver(Test)",
    code: "035420",
    logo: null,
    returns: 4,
  },
  {
    name: "팔란티어(Test)",
    code: "005930",
    logo: null,
    returns: 3.2,
  },
  {
    name: "퍼스트에너지(Test)",
    code: "005930",
    logo: null,
    returns: 3.2,
  },
  {
    name: "엑셀론(Test)",
    code: "005930",
    logo: null,
    returns: 2.8,
  },
  {
    name: "포르티스(Test)",
    code: "005930",
    logo: null,
    returns: -2.8,
  },
  {
    name: "컨스텔레이션(Test)",
    code: "005930",
    logo: null,
    returns: -2.5,
  },
];

const useHideAdditionalList = () => {
  const [isHideAdditionalList, setIsHideAdditionalList] = useState(true);

  const handleHideAdditionalList = () => {
    setIsHideAdditionalList(!isHideAdditionalList);
  };

  return [isHideAdditionalList, handleHideAdditionalList] as const;
};

const useSelectTheme = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleSelectTheme = useCallback(
    (theme: string) => {
      if (theme === selectedTheme) {
        setSelectedTheme(null);
      } else {
        setSelectedTheme(theme);
      }
    },
    [selectedTheme],
  );

  return [selectedTheme, handleSelectTheme] as const;
};
