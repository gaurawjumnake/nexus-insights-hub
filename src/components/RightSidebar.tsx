import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Cpu,
  Settings2,
  Users,
  Upload,
  GitCompare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiHealthIndicator } from "@/components/ApiHealthIndicator";
import { BackendConfigPanel } from "@/components/BackendConfigPanel";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  search?: Record<string, string>;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/workforce", label: "Workforce", icon: Users },
  { to: "/workforce/business", label: "Business", icon: Briefcase },
  { to: "/workforce/technology", label: "Technology", icon: Cpu },
  { to: "/workforce/operations", label: "Operations", icon: Settings2 },
  { to: "/workforce/portfolio", label: "Portfolio", icon: LayoutDashboard },
  { to: "/compare", label: "PortCo Comparison", icon: GitCompare },
  { to: "/upload", label: "Upload Documents", icon: Upload },
];

export function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 shadow-sm transition-all duration-200 flex flex-col",
        collapsed ? "w-12" : "w-56",
      )}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="h-12 flex items-center justify-center border-b border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {!collapsed && (
          <span className="mr-2 text-[12px] font-semibold tracking-wide text-slate-700">
            NAVIGATION
          </span>
        )}
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-md text-[13px] transition-colors",
                active
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && <BackendConfigPanel />}
      <ApiHealthIndicator collapsed={collapsed} />
      {!collapsed && (
        <div className="px-3 py-2 border-t border-slate-200 text-[10px] text-slate-400">
          Nexus · Live API
        </div>
      )}
    </aside>
  );
}
