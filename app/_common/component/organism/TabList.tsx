"use client";

import { useState } from "react";
import { TabListData } from "@/app/_common/types";

interface TabListProps {
  tabDataList: TabListData[];
  onClickAction: (value: string) => void;
}

export default function TabList({
  tabDataList,
  onClickAction,
}: Readonly<TabListProps>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index: number, value: string) => () => {
    setActiveIndex(index);
    if (onClickAction != null) {
      onClickAction(value);
    }
  };

  return (
    <ul className={`border-border flex justify-evenly border-b px-6`}>
      {tabDataList.map((data, index) => (
        <li
          key={`${index}_${data.text}_${data.value}`}
          className={`${
            index === activeIndex
              ? "border-gray-w800 text-gray-w800 border-b-2 font-bold"
              : "text-gray-w600 font-medium"
          } flex-1 py-2 text-center`}
        >
          <button onClick={handleClick(index, data.value)}>{data.text}</button>
        </li>
      ))}
    </ul>
  );
}
