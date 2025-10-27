// app/_common/services/apiService.ts
import { companiesService } from "./api/companies";
import { dailyFinancialMetricsService } from "./api/dailyFinancialMetrics";
import { dailyPricesService } from "./api/dailyPrices";
import { dividendsService } from "./api/dividends";
import { fundamentalsService } from "./api/fundamentals";
import { outstandingSharesService } from "./api/outstandingShares";
import { ownershipService } from "./api/ownership";

export const apiService = {
  companies: companiesService,
  dailyFinancialMetrics: dailyFinancialMetricsService,
  dailyPrices: dailyPricesService,
  dividends: dividendsService,
  fundamentals: fundamentalsService,
  outstandingShares: outstandingSharesService,
  ownership: ownershipService,
};
