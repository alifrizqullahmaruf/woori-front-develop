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
    <div className="flex items-center">
      {/* Index number */}
      <div
        className={`typo-small mr-3 font-bold ${
          isNeedHighlight ? "text-primary-850" : ""
        }`}
      >
        {index}
      </div>

      {/* Logo or fallback initial */}
      <div className="relative mr-[9px] min-h-9 min-w-9 rounded-md bg-border typo-tiny">
        {typeof logo === "string" && logo.length > 0 ? (
          <Image
            src={logo}
            alt={`${name}_logo`}
            width={36}
            height={36}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
            unoptimized
          />
        ) : (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {name?.[0] ?? "?"}
          </span>
        )}
      </div>

      {/* Stock name */}
      <h3 className="typo-small line-clamp-1 font-medium">{name}</h3>
    </div>
  );
}
