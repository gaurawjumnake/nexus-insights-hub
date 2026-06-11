import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Gauge,
  ShieldAlert,
  Users,
  Database,
  Bot,
  ChevronRight,
  Activity,
} from "lucide-react";
import { PORTFOLIO_COMPANIES, WorkforceProvider, useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce")({
  component: WorkforceLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};
type NavGroup = { section: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    section: "OVERVIEW",
    items: [
      { to: "/workforce", label: "Boardroom Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/workforce/portfolio", label: "Portfolio Overview", icon: Briefcase },
    ],
  },
  {
    section: "MATURITY & GROWTH",
    items: [
      { to: "/workforce/ai-adoption", label: "AI Adoption & Skills", icon: Sparkles },
      { to: "/workforce/productivity", label: "Productivity & Cost", icon: Gauge },
    ],
  },
  {
    section: "HUMAN CAPITAL",
    items: [
      { to: "/workforce/talent-risk", label: "Talent Risk & L&D", icon: ShieldAlert },
      { to: "/workforce/workforce-drilldown", label: "Workforce Drill Down", icon: Users },
    ],
  },
  {
    section: "DATA MANAGEMENT",
    items: [
      { to: "/workforce/data-management", label: "Workforce Data Management", icon: Database },
    ],
  },
  {
    section: "AGENT CENTER",
    items: [{ to: "/workforce/agent-center", label: "AI Talent Agent Center", icon: Bot }],
  },
];

function WorkforceLayout() {
  return (
    <WorkforceProvider>
      <div
        className="min-h-screen flex w-full text-slate-100"
        style={{
          backgroundColor: "#060913",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </WorkforceProvider>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className="w-72 shrink-0 flex flex-col border-r border-white/5"
      style={{ backgroundColor: "#0d1222" }}
    >
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div
              className="text-[13px] font-semibold tracking-wide text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              PE AI Workforce
            </div>
            <div className="text-[11px] text-slate-400">& Talent Control Tower</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  "exact" in item && item.exact
                    ? pathname === item.to
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to as "/workforce"}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                      active
                        ? "bg-white/5 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                    style={
                      active
                        ? {
                            boxShadow: "inset 2px 0 0 #6366f1",
                          }
                        : undefined
                    }
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: active ? "#818cf8" : undefined }}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-white">CHRO Office</div>
            <div className="text-[10px] text-slate-500">Operating Partner View</div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#10b981" }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ backgroundColor: "#10b981" }}
              />
            </span>
            <span className="text-[10px] font-medium" style={{ color: "#10b981" }}>
              Active Cycle
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { company, setCompany } = useWorkforce();

  const current = NAV.flatMap((g) => g.items).find((i) =>
    i.to === "/workforce" ? pathname === "/workforce" : pathname.startsWith(i.to),
  );

  return (
    <header
      className="h-16 px-6 flex items-center justify-between border-b border-white/5"
      style={{ backgroundColor: "#0d1222" }}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">PE Control Tower</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
          {current?.label ?? "Boardroom Dashboard"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
          <Activity className="w-3.5 h-3.5" style={{ color: "#14b8a6" }} />
          <span className="text-[11px] text-slate-400">Live</span>
        </div>
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="text-[13px] px-3 py-2 rounded-md border border-white/10 text-white focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "#060913",
          }}
        >
          {PORTFOLIO_COMPANIES.map((c) => (
            <option key={c.value} value={c.value} style={{ backgroundColor: "#0d1222" }}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
