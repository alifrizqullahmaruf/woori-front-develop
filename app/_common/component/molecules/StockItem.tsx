import Image from "next/image";

interface StockItemProps {
  index: number;
  name: string;
  logo: string | null;
  isNeedHighlight?: boolean;
}

export default function StockItem({
  index,
  name,
  logo,
  isNeedHighlight = false,
}: StockItemProps) {
  return (
    <div className={"flex items-center"}>
      <div
        className={`typo-small ${isNeedHighlight ? "text-primary-850" : ""} mr-3 font-bold`}
      >
        {index}
      </div>
      <div
        className={
          "bg-border typo-tiny relative mr-[9px] min-h-9 min-w-9 rounded-md font-bold"
        }
      >
        <Image
          className={
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }
          src={logo}
          // alt={`${name}_logo`}
          width={76}
          height={76}
        >
          {/* {logo ?? name[0]} */}
        </Image>
        {/* <span
          className={
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }
        >
          {logo ?? name[0]}
        </span> */}
      </div>
      <h3 className={"typo-small line-clamp-1 font-medium"}>{name}</h3>
    </div>
  );
}
