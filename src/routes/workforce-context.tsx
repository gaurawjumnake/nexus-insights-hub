import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanies, getLatestPeriod, type Company } from "@/services/kpiService";

/** Real companies, derived from the backend (GET /kpis/ grouped by company_id) — no hardcoded fake roster. */
function usePortfolioCompanyOptions() {
  const companiesQuery = useQuery({
    queryKey: ["workforce-companies"],
    queryFn: getCompanies,
    staleTime: 2 * 60 * 1000,
  });
  const periodQuery = useQuery({
    queryKey: ["workforce-latest-period"],
    queryFn: getLatestPeriod,
    staleTime: 2 * 60 * 1000,
  });

  const options = useMemo(
    () => [
      { value: "all", label: "All Portfolio Companies" },
      ...(companiesQuery.data ?? []).map((c: Company) => ({ value: c.id, label: c.label })),
    ],
    [companiesQuery.data],
  );

  return {
    options,
    isLoading: companiesQuery.isLoading || periodQuery.isLoading,
    period: periodQuery.data,
  };
}

type Ctx = {
  company: string;
  setCompany: (v: string) => void;
  companyLabel: string;
  /** Latest period present in the backend data — use this instead of hardcoding "2025-2026". */
  period: string | undefined;
  companyOptions: { value: string; label: string }[];
  isLoadingCompanies: boolean;
};

const WorkforceCtx = createContext<Ctx | null>(null);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const { options, isLoading, period } = usePortfolioCompanyOptions();
  const [company, setCompany] = useState<string>("all");
  const companyLabel = options.find((c) => c.value === company)?.label ?? "All Portfolio Companies";

  return (
    <WorkforceCtx.Provider
      value={{ company, setCompany, companyLabel, period, companyOptions: options, isLoadingCompanies: isLoading }}
    >
      {children}
    </WorkforceCtx.Provider>
  );
}

export function useWorkforce() {
  const ctx = useContext(WorkforceCtx);
  if (!ctx) throw new Error("useWorkforce must be used within WorkforceProvider");
  return ctx;
}
