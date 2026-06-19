import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import type { Company } from "@/services/kpiService";

export const WORKFORCE_DEFAULT_PERIOD = "2025-2026";

type Ctx = {
  /** "all" or backend company id */
  company: string;
  setCompany: (v: string) => void;
  companyLabel: string;
  /** Backend-derived list (never hardcoded) */
  companies: Company[];
  period: string;
  isLoadingCompanies: boolean;
};

const WorkforceCtx = createContext<Ctx | null>(null);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<string>("all");
  const { companies, isLoadingCompanies } = usePortfolioKpis();

  const companyLabel = useMemo(() => {
    if (company === "all") return "All Portfolio Companies";
    return companies.find((c) => c.id === company)?.label ?? company;
  }, [company, companies]);

  return (
    <WorkforceCtx.Provider
      value={{
        company,
        setCompany,
        companyLabel,
        companies,
        period: WORKFORCE_DEFAULT_PERIOD,
        isLoadingCompanies,
      }}
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
