"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Empty from "@/app/_common/assets/icons/Empty.svg";
import NotFoundSVG from "@/app/_common/assets/icons/NotFound.svg";
import LoadingDots from "@/app/_common/component/atoms/LoadingDots";
import CompanyLogo from "@/app/_common/component/molecules/CompanySearch/CompanyLogo";
import { useDebounce } from "@/app/_common/component/molecules/CompanySearch/useDebounce";
import { useSearchHistory } from "@/app/_common/component/molecules/CompanySearch/useSearchHistory";
import { useAllCompanies } from "@/app/_common/hooks/useCompanies";

export default function CompanySearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: allCompanies, isLoading: isLoadingCompanies } = useAllCompanies();

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const debouncedQuery = useDebounce(query, 300);

  const { history, addHistory, removeFromHistory, clearHistory } =
    useSearchHistory("woori:company:searchHistory", 5);

  // Keep URL `?q=` in sync as user types (no debounce for URL updates)
  const updateQueryParam = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    // Focus the input on mount
    inputRef.current?.focus();
  }, []);

  // Recompute filtered options from debounced query
  const filteredOptions = useMemo(() => {
    const companies = allCompanies?.items || [];
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    return companies
      .filter((c) => {
        const companyName = (
          c.company_name_kr || c.company_name || ""
        ).toLowerCase();
        const tickerCode = (c.ticker || "").toLowerCase();
        return companyName.includes(q) || tickerCode.includes(q);
      })
      .slice(0, 10)
      .map((c) => ({
        company: c.company_name_kr || c.company_name || c.ticker,
        ticker: c.ticker,
        logo: c.logo_url,
      }));
  }, [debouncedQuery, allCompanies]);

  const isHistoryMode = query.trim() === "";

  const displayOptions = useMemo(() => {
    if (isHistoryMode) {
      const companies = allCompanies?.items || [];
      return history.map((h) => {
        const lastSpace = h.label.lastIndexOf(" ");
        const company = lastSpace > -1 ? h.label.slice(0, lastSpace) : h.label;
        const companyData = companies.find((c) => c.ticker === h.ticker);
        return {
          company,
          ticker: h.ticker,
          logo: companyData?.logo_url,
          isHistory: true as const,
        };
      });
    }
    return filteredOptions.map((opt) => ({ ...opt, isHistory: false as const }));
  }, [isHistoryMode, history, filteredOptions, allCompanies]);

  const hasQuery = query.trim().length > 0;

  const handleSelect = useCallback(
    (ticker: string, company: string) => {
      if (!ticker) return;
      // Add to history
      addHistory({ ticker, label: `${company} ${ticker}` });
      // Navigate to company page
      router.push(`/company-info/${ticker}`);
    },
    [addHistory, router]
  );

  // Keyboard navigation for the search input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < displayOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0 && displayOptions[activeIndex]) {
            const selected = displayOptions[activeIndex];
            handleSelect(selected.ticker, selected.company);
          } else if (displayOptions.length > 0) {
            const first = displayOptions[0];
            handleSelect(first.ticker, first.company);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          router.back();
          break;
        }
        default:
          break;
      }
    },
    [displayOptions, activeIndex, handleSelect, router]
  );

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[720px] flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 px-4 py-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            size={18}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setActiveIndex(-1);
              updateQueryParam(val);
            }}
            onKeyDown={handleKeyDown}
            placeholder="종목 검색"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-10 pl-10 text-base transition-all duration-200 outline-none"
            aria-label="íšŒì‚¬ ê²€ìƒ‰"
            style={{ fontSize: "16px" }}
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                inputRef.current?.focus();
                updateQueryParam("");
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="ê²€ìƒ‰ì–´ ì§€ìš°ê¸°"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="shrink-0 text-sm font-medium text-[#86A7CC] transition hover:opacity-70"
        >
          취소
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* History Mode */}
        {isHistoryMode && history.length > 0 && (
          <div className="p-4">
            {/* History Header */}
            <div className="mb-3 flex items-center justify-between px-3">
              <div className="flex items-center">
                <span className="text-sm font-bold text-[#86A7CC]">최근 검색어</span>
              </div>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-[#86A7CC]"
              >
                전체 삭제
              </button>
            </div>

            {/* History List */}
            <div className="space-y-2">
              {displayOptions.map((option, idx) => (
                <div
                  key={`history-${option.ticker}-${idx}`}
                  className={`flex cursor-pointer items-center justify-between rounded-lg bg-white p-3 transition-all hover:bg-gray-50 ${
                    idx === activeIndex ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleSelect(option.ticker, option.company)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CompanyLogo src={option.logo} alt={option.company} size={32} />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {option.company}
                      </span>
                      <span className="shrink-0 text-sm text-gray-500">{option.ticker}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(option.ticker);
                    }}
                    className="ml-2 p-1 text-gray-400 transition hover:text-gray-600"
                    aria-label="ì‚­ì œ"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty History State */}
        {isHistoryMode && history.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4">
              <NotFoundSVG aria-hidden="true" />
              <p className="text-center text-sm text-gray-500">최근 검색 기록이 없습니다.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingCompanies && hasQuery && (
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <LoadingDots />
          </div>
        )}

        {/* Empty Search State */}
        {!isLoadingCompanies && hasQuery && displayOptions.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4">
              <Empty aria-hidden="true" className="text-[#86A7CC]" />
              <p className="text-center text-sm text-gray-500">검색 결과가 없습니다.</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isHistoryMode && displayOptions.length > 0 && (
          <div className="p-4">
            <div className="space-y-1">
              {displayOptions.map((option, idx) => (
                <div
                  key={`search-${option.ticker}-${idx}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                    idx === activeIndex ? "bg-blue-50 ring-2 ring-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(option.ticker, option.company)}
                >
                  <CompanyLogo src={option.logo} alt={option.company} size={32} />
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">{option.company}</span>
                    <span className="shrink-0 text-sm text-gray-500">{option.ticker}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

