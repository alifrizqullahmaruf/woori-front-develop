// app/_common/hooks/queryKeys.ts
export const QUERY_KEYS = {
  ALL_FUNDAMENTALS: ["fundamentals", "all"] as const,
  ALL_OWNERSHIP: ["ownership", "all"] as const,
  ALL_COMPANIES: ["companies", "all"] as const,
  ALL_DIVIDENDS_TTM: ["dividendsTTM", "all"] as const,
  ALL_DIVIDENDS_EVENTS: ["dividendsEvents", "all"] as const,
  ALL_DAILY_PRICES: ["dailyPrices", "all"] as const,
  ALL_OUTSTANDING_SHARES: ["outstandingShares", "all"] as const,
  ALL_DAILY_FINANCIAL_METRICS: ["dailyFinancialMetrics", "all"] as const,

  FUNDAMENTALS: (ticker: string) => ["fundamentals", ticker] as const,
  OWNERSHIP: (ticker: string) => ["ownership", ticker] as const,
  COMPANY: (ticker: string) => ["company", ticker] as const,
  DIVIDENDS_TTM: (ticker: string) => ["dividendsTTM", ticker] as const,
  DIVIDENDS_EVENTS: (ticker: string) => ["dividendsEvents", ticker] as const,
  DAILY_PRICES: (ticker: string) => ["dailyPrices", ticker] as const,
  OUTSTANDING_SHARES: (ticker: string) => ["outstandingShares", ticker] as const,
  DAILY_FINANCIAL_METRICS: (ticker: string) => ["dailyFinancialMetrics", ticker] as const,
};
