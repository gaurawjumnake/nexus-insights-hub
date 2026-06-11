import { createContext, useContext, useState, type ReactNode } from "react";

export const PORTFOLIO_COMPANIES = [
  { value: "all", label: "All Portfolio Companies" },
  { value: "company-a", label: "Company A" },
  { value: "company-b", label: "Company B" },
  { value: "company-c", label: "Company C" },
  { value: "company-d", label: "Company D" },
  { value: "company-e", label: "Company E" },
] as const;

type Ctx = {
  company: string;
  setCompany: (v: string) => void;
  companyLabel: string;
};

const WorkforceCtx = createContext<Ctx | null>(null);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<string>("all");
  const companyLabel =
    PORTFOLIO_COMPANIES.find((c) => c.value === company)?.label ?? "All Portfolio Companies";
  return (
    <WorkforceCtx.Provider value={{ company, setCompany, companyLabel }}>
      {children}
    </WorkforceCtx.Provider>
  );
}

export function useWorkforce() {
  const ctx = useContext(WorkforceCtx);
  if (!ctx) throw new Error("useWorkforce must be used within WorkforceProvider");
  return ctx;
}
