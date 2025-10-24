  // hooks/useApi.ts
  import {
    useQuery,
    UseQueryOptions,
    UseQueryResult,
  } from "@tanstack/react-query";
  import {
    apiService,
    FundamentalsData,
    OwnershipData,
    CompanyDataResponse,
    CompaniesData,
    DividendsTTMData,
    DividendsEventsData,
    DailyPricesData,
    OutstandingSharesData,
    DailyFinancialMetricsData,
  } from "../../services/api";

  // Query Keys
  export const QUERY_KEYS = {
    ALL_FUNDAMENTALS: ["fundamentals", "all"] as const,
    ALL_OWNERSHIP: ["ownership", "all"] as const,
    ALL_COMPANIES: ["companies", "all"] as const,
    ALL_DIVIDENDS_TTM: ["dividendsTTM", "all"] as const,
    ALL_DIVIDENDS_EVENTS: ["dividendsEvents", "all"] as const,
    ALL_DAILY_PRICES: ["dailyPrices", "all"] as const,
    ALL_OUTSTANDING_SHARES: ["outstandingShares", "all"] as const,
    ALL_DAILY_FINANCIAL_METRICS: ["dailyFinancialMetrics", "all"] as const,
    DAILY_PRICES: (ticker: string) => ["dailyPrices", ticker] as const,
    DIVIDENDS_EVENTS: (ticker: string) => ["dividendsEvents", ticker] as const,
    DIVIDENDS_TTM: (ticker: string) => ["dividendsTTM", ticker] as const,
    FUNDAMENTALS: (ticker: string) => ["fundamentals", ticker] as const,
    OWNERSHIP: (ticker: string) => ["ownership", ticker] as const,
    COMPANY_DATA: (ticker: string) => ["company", ticker, "all"] as const,
    COMPANY: (ticker: string) => ["company", ticker] as const,
    OUTSTANDING_SHARES: (ticker: string) => ["outstandingShares", ticker] as const,
    DAILY_FINANCIAL_METRICS: (ticker: string) => ["dailyFinancialMetrics", ticker] as const,
  };

  // Hooks
  export const useAllFundamentals = (
    options?: Omit<UseQueryOptions<FundamentalsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_FUNDAMENTALS,
      queryFn: () => apiService.getAllFundamentals(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useAllOwnership = (
    options?: Omit<UseQueryOptions<OwnershipData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_OWNERSHIP,
      queryFn: () => apiService.getAllOwnership(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useAllCompanies = (
    options?: Omit<UseQueryOptions<CompaniesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_COMPANIES,
      queryFn: () => apiService.getAllCompanies(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };
  export const useAllDividendsTTM = (
    options?: Omit<UseQueryOptions<DividendsTTMData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_DIVIDENDS_TTM,
      queryFn: () => apiService.getAllDividendsTTM(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };
  export const useAllDividendsEvents = (
    options?: Omit<UseQueryOptions<DividendsEventsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_DIVIDENDS_EVENTS,
      queryFn: () => apiService.getAllDividendsEvents(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };
  export const useAllDailyPrices = (
    options?: Omit<UseQueryOptions<DailyPricesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_DAILY_PRICES,
      queryFn: () => apiService.getAllDailyPrices(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useAllOutstandingShares = (
    options?: Omit<UseQueryOptions<OutstandingSharesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_OUTSTANDING_SHARES,
      queryFn: () => apiService.getAllOutstandingShares(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useAllDailyFinancialMetrics = (
    options?: Omit<UseQueryOptions<DailyFinancialMetricsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.ALL_DAILY_FINANCIAL_METRICS,
      queryFn: () => apiService.getAllDailyFinancialMetrics(),
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useDailyPrices = (
    ticker: string,
    options?: Omit<UseQueryOptions<DailyPricesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.DAILY_PRICES(ticker),
      queryFn: () => apiService.getDailyPrices(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };
  export const useDividendsEvents = (
    ticker: string,
    options?: Omit<UseQueryOptions<DividendsEventsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.DIVIDENDS_EVENTS(ticker),
      queryFn: () => apiService.getDividendsEvents(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useDividendsTTM = (
    ticker: string,
    options?: Omit<UseQueryOptions<DividendsTTMData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.DIVIDENDS_TTM(ticker),
      queryFn: () => apiService.getDividendsTTM(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };
  export const useCompany = (
    ticker: string,
    options?: Omit<UseQueryOptions<CompaniesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.COMPANY(ticker),
      queryFn: () => apiService.getCompany(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useFundamentals = (
    ticker: string,
    options?: Omit<UseQueryOptions<FundamentalsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.FUNDAMENTALS(ticker),
      queryFn: () => apiService.getFundamentals(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useOwnership = (
    ticker: string,
    options?: Omit<UseQueryOptions<OwnershipData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.OWNERSHIP(ticker),
      queryFn: () => apiService.getOwnership(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useOutstandingShares = (
    ticker: string,
    options?: Omit<UseQueryOptions<OutstandingSharesData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.OUTSTANDING_SHARES(ticker),
      queryFn: () => apiService.getOutstandingShares(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useDailyFinancialMetrics = (
    ticker: string,
    options?: Omit<UseQueryOptions<DailyFinancialMetricsData>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.DAILY_FINANCIAL_METRICS(ticker),
      queryFn: () => apiService.getDailyFinancialMetrics(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  export const useCompanyData = (
    ticker: string,
    options?: Omit<UseQueryOptions<CompanyDataResponse>, "queryKey" | "queryFn">,
  ) => {
    return useQuery({
      queryKey: QUERY_KEYS.COMPANY_DATA(ticker),
      queryFn: () => apiService.getCompanyData(ticker),
      enabled: !!ticker,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
  };

  // Konversi dari Finnhub (million KRW) -> KRW (won)
export function fromFinnhubMillionToWon(v?: number | null) {
  if (v === null || v === undefined || Number.isNaN(v)) return null;
  return Math.round(v * 1_000_000); // hasil: won (integer)
}

// Format angka won ke tampilan lokal Korea: 123,456원
export function formatWonRaw(won?: number | null) {
  if (won === null || won === undefined || Number.isNaN(won)) return null;
  return `${won.toLocaleString("ko-KR")}원`;
}
    