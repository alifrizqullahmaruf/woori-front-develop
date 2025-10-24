// services/api.ts
const API_CONFIG = {
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};


// Type definitions based on actual API response
export interface ApiResponse<T> {
  page: number;
  page_size: number;
  total: number;
  items: T[];
}

export interface DailyPricesItem {
  id: number;
  stock_id: number;
  ticker: string;
  price_date: string;
  closing_price: number;
  source: string;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  adjusted_close: number | null;
  percent_change: number | null;
  net_change: number | null;
  volume: number;
  market_cap: number;
  currency: string;
  source_timestamp: string;
  data_quality: string;
}
export type DailyPricesData = ApiResponse<DailyPricesItem>;

export interface DividendsTTMItem {
  id: number;
  stock_id: number;
  ticker: string;
  metric_date: string;
  dividend_yield_ttm: number | null;
  dividend_yield_forward: number | null;
  payout_ratio_ttm: number | null;
  annual_dividend_ttm: number | null;
  dividend_growth_rate_1y: number | null;
  dividend_growth_rate_3y: number | null;
  dividend_growth_rate_5y: number | null;
  consecutive_years_paid: number;
  consecutive_years_increased: number;
  currency: string;
  source: string;
  calculation_method: string;
}
export type DividendsTTMData = ApiResponse<DividendsTTMItem>;

export interface DividendsEventsItem {
  id: number;
  stock_id: number;
  ticker: string;
  announcement_date: string;
  ex_dividend_date: string;
  record_date: string;
  payment_date: string;
  dividend_amount: number;
  dividend_type: string;
  frequency: string;
  currency: string;
  tax_rate: number | null;
  source: string;
  source_announcement: string | null;
}
export type DividendsEventsData = ApiResponse<DividendsEventsItem>;

export interface FundamentalsItem {
  id: number;
  stock_id: number;
  ticker: string;
  fiscal_year: number;
  fiscal_period: string;
  report_date: string;
  metric_type: string;
  metric_value: number;
  currency: string;
  source: string;
  source_document: string | null;
  last_updated_source: string;
}
export type FundamentalsData = ApiResponse<FundamentalsItem>;

export interface OwnershipItem {
  id: number;
  stock_id: number;
  ticker: string;
  as_of_date: string;
  filing_date: string;
  as_of_period_key: string | null;
  rank_in_quarter: number;
  shareholder_name: string;
  shareholder_name_kr: string | null;
  ownership_percent: number;
  shares_held: number;
  holding_value_usd: number | null;
}
export type OwnershipData = ApiResponse<OwnershipItem>;

export interface CompanyItem {
  id: number;
  stock_id: number;
  ticker: string;
  company_name: string;
  company_name_kr: string;
  sector: string;
  industry: string;
  industry_kr: string;
  description: string;
  description_kr: string;
  ceo: string;
  ceo_kr: string;
  exchange: string;
  exchange_kr: string;
  ipo_date: string | null;
  country: string;
  employees_count: number;
  headquarters: string;
  website: string;
  source: string;
  logo_url: string;
}
export type CompaniesData = ApiResponse<CompanyItem>;

export interface OutstandingSharesItem {
  id: number;
  stock_id: number;
  ticker: string;
  record_date: string;
  shares_outstanding: number;
  shares_float: number | null;
  shares_authorized: number | null;
  treasury_shares: number | null;
  source: string;
  filing_document: string | null;
}
export type OutstandingSharesData = ApiResponse<OutstandingSharesItem>;

export interface DailyFinancialMetricsItem {
  id: number;
  stock_id: number;
  ticker: string;
  metric_date: string;
  metric_type: string;
  metric_value: number;
  calculation_method: string;
  source: string;
  source_timestamp: string;
}
export type DailyFinancialMetricsData = ApiResponse<DailyFinancialMetricsItem>;

export interface CompanyDataResponse {
  fundamentals: FundamentalsData | null;
  ownership: OwnershipData | null;
  company: CompaniesData | null;
  dividendsTTM: DividendsTTMData | null;
  dividendsEvents: DividendsEventsData | null;
  dailyPrices: DailyPricesData | null;
  outstandingShares: OutstandingSharesData | null;
  dailyFinancialMetrics: DailyFinancialMetricsData | null;
  errors: {
    fundamentals: Error | null;
    ownership: Error | null;
    company: Error | null;
    dividendsTTM: Error | null;
    dividendsEvents: Error | null;
    dailyPrices: Error | null;
    outstandingShares: Error | null;
    dailyFinancialMetrics: Error | null;
  };
}

// Helper function to format numbers
export const formatCurrency = (value: number): string => {
  if (value >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(1)}조원`;
  } else if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}조원`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}백만원`;
  }
  return `${value.toLocaleString()}원`;
};
export const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case "KRW":
      return "원";
    // Tambah lain jika perlu, e.g., "USD": "$"
    default:
      return currency;
  }
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatRatio = (value: number): string => {
  return value.toFixed(2);
};

// Generic API request function
async function apiRequest<T>(endpoint: string): Promise<T> {
  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    console.log("API Request:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      method: "GET",
      headers: API_CONFIG.headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("API Request Failed:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - silakan coba lagi");
      }
      throw new Error(`Network error: ${error.message}`);
    }

    throw new Error("Unknown error occurred");
  }
}

// API Service Class
export class ApiService {
  async getAllFundamentals(): Promise<FundamentalsData> {
    return apiRequest("/fundamentals");
  }

  async getAllOwnership(): Promise<OwnershipData> {
    return apiRequest("/ownership");
  }
  async getAllCompanies(): Promise<CompaniesData> {
    return apiRequest("/companies");
  }
  async getAllDividendsTTM(): Promise<DividendsTTMData> {
    return apiRequest("/dividendsTTM");
  }
  async getAllDividendsEvents(): Promise<DividendsEventsData> {
    return apiRequest("/dividends-events");
  }
  async getAllDailyPrices(): Promise<DailyPricesData> {
    return apiRequest("/daily-prices");
  }
  async getAllOutstandingShares(): Promise<OutstandingSharesData> {
    return apiRequest("/outstanding-shares");
  }
  async getAllDailyFinancialMetrics(): Promise<DailyFinancialMetricsData> {
    return apiRequest("/daily-financial-metrics");
  }
  async getDailyPrices(ticker: string): Promise<DailyPricesData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/daily-prices/${ticker.toUpperCase()}`);
  }
  async getCompany(ticker: string): Promise<CompaniesData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/companies/${ticker.toUpperCase()}`);
  }
  // async getFundamentals(ticker: string): Promise<FundamentalsData> {
  //   if (!ticker) {
  //     throw new Error("Ticker is required");
  //   }
  //   return apiRequest(`/fundamentals/${ticker.toUpperCase()}`);
  // }

  async getFundamentals(ticker: string, pageSize = 200): Promise<FundamentalsData> {
  if (!ticker) {
    throw new Error("Ticker is required");
  }
  return apiRequest(`/fundamentals/${ticker.toUpperCase()}?page=1&page_size=${pageSize}`);
}


  async getOwnership(ticker: string): Promise<OwnershipData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/ownership/${ticker.toUpperCase()}`);
  }

  async getDividendsTTM(ticker: string): Promise<DividendsTTMData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/dividendsTTM/${ticker.toUpperCase()}`);
  }

  async getDividendsEvents(ticker: string): Promise<DividendsEventsData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/dividends-events/${ticker.toUpperCase()}`);
  }

  async getOutstandingShares(ticker: string): Promise<OutstandingSharesData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/outstanding-shares/${ticker.toUpperCase()}`);
  }

  async getDailyFinancialMetrics(
    ticker: string,
  ): Promise<DailyFinancialMetricsData> {
    if (!ticker) {
      throw new Error("Ticker is required");
    }
    return apiRequest(`/daily-financial-metrics/${ticker.toUpperCase()}`);
  }
  

  async getCompanyData(ticker: string): Promise<CompanyDataResponse> {
    const [
      fundamentals,
      ownership,
      companies,
      dividendsTTM,
      dividendsEvents,
      dailyPrices,
      outstandingShares,
      dailyFinancialMetrics,
    ] = await Promise.allSettled([
      this.getFundamentals(ticker),
      this.getOwnership(ticker),
      this.getCompany(ticker),
      this.getDividendsTTM(ticker),
      this.getDividendsEvents(ticker),
      this.getDailyPrices(ticker),
      this.getOutstandingShares(ticker),
      this.getDailyFinancialMetrics(ticker),
    ]);

    return {
      fundamentals:
        fundamentals.status === "fulfilled" ? fundamentals.value : null,
      ownership: ownership.status === "fulfilled" ? ownership.value : null,
      company: companies.status === "fulfilled" ? companies.value : null,
      dividendsTTM:
        dividendsTTM.status === "fulfilled" ? dividendsTTM.value : null,
      dividendsEvents:
        dividendsEvents.status === "fulfilled" ? dividendsEvents.value : null,
      dailyPrices:
        dailyPrices.status === "fulfilled" ? dailyPrices.value : null,
      outstandingShares:
        outstandingShares.status === "fulfilled"
          ? outstandingShares.value
          : null,
      dailyFinancialMetrics:
        dailyFinancialMetrics.status === "fulfilled"
          ? dailyFinancialMetrics.value
          : null,
      errors: {
        fundamentals:
          fundamentals.status === "rejected" ? fundamentals.reason : null,
        ownership: ownership.status === "rejected" ? ownership.reason : null,
        company: companies.status === "rejected" ? companies.reason : null,
        dividendsTTM:
          dividendsTTM.status === "rejected" ? dividendsTTM.reason : null,
        dividendsEvents:
          dividendsEvents.status === "rejected" ? dividendsEvents.reason : null,
        dailyPrices:
          dailyPrices.status === "rejected" ? dailyPrices.reason : null,
        outstandingShares:
          outstandingShares.status === "rejected"
            ? outstandingShares.reason
            : null,
        dailyFinancialMetrics:
          dailyFinancialMetrics.status === "rejected"
            ? dailyFinancialMetrics.reason
            : null,
      },
    };
  }
}

export const apiService = new ApiService();
