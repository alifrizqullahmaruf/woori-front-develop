import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { CompaniesData } from "@/app/_common/services/api/companies";
import { apiService } from "@/app/_common/services/apiServices";
import { QUERY_KEYS } from "./queryKeys";

export const useAllCompanies = (
  options?: Omit<UseQueryOptions<CompaniesData>, "queryKey" | "queryFn">,
) =>
  useQuery<CompaniesData>({
    queryKey: QUERY_KEYS.ALL_COMPANIES,
    queryFn: () => apiService.companies.getAll(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useCompany = (
  ticker: string,
  options?: Omit<UseQueryOptions<CompaniesData>, "queryKey" | "queryFn">,
) =>
  useQuery<CompaniesData>({
    queryKey: QUERY_KEYS.COMPANY(ticker),
    queryFn: () => apiService.companies.getByTicker(ticker),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
    ...options,
  });