import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  ChevronDown,
  Layers,
  Archive,
  Settings,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiHealthIndicator } from "@/components/ApiHealthIndicator";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
};

const TOP_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
];

const PERSONA_NAV: NavItem[] = [
  { to: "/workforce", label: "CXO", icon: Users },
  { to: "/workforce/business", label: "Business", icon: Briefcase },
  { to: "/workforce/operations", label: "Operations", icon: Settings2 },
  { to: "/workforce/technology", label: "Technology", icon: Cpu },
];

const COMPARATIVE_NAV: NavItem[] = [
  { to: "/executive-overview", label: "Executive Overview", icon: Trophy },
  { to: "/compare", label: "Snapshot", icon: GitCompare },
  { to: "/workforce/portfolio", label: "Portfolio", icon: LayoutDashboard },
];

const REGISTRY_NAV: NavItem[] = [
  { to: "/registry/add-fact", label: "Add Fact", icon: Archive },
  { to: "/registry/add-kpi", label: "Add KPI", icon: Archive },
];

const BOTTOM_NAV: NavItem[] = [
  { to: "/upload", label: "Upload Documents", icon: Upload },
];

export function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const personaActive = useMemo(
    () => PERSONA_NAV.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")),
    [pathname],
  );
  const comparativeActive = useMemo(
    () => COMPARATIVE_NAV.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")),
    [pathname],
  );
  const registryActive = useMemo(
    () => REGISTRY_NAV.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")),
    [pathname],
  );
  const [personasOpen, setPersonasOpen] = useState(false);
  const [comparativeOpen, setComparativeOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const renderItem = (item: NavItem, opts?: { nested?: boolean }) => {
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
          "flex items-center gap-3 px-3 py-2 mx-2 my-0.5 rounded-md transition-colors",
          opts?.nested ? "text-[12px] pl-8" : "text-[13px]",
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
  };

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
        {TOP_NAV.map((item) => renderItem(item))}

        {/* Personas collapsible group */}
        <button
          type="button"
          onClick={() => setPersonasOpen((o) => !o)}
          className={cn(
            "w-[calc(100%-1rem)] mx-2 my-0.5 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors",
            personaActive
              ? "text-teal-700 font-semibold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
          aria-expanded={personasOpen}
          title="Personas"
        >
          <Layers className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">Personas</span>
              {personasOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </>
          )}
        </button>
        {(personasOpen || collapsed) &&
          PERSONA_NAV.map((item) => renderItem(item, { nested: !collapsed }))}

        {/* Comparative Analysis collapsible group */}
        <button
          type="button"
          onClick={() => setComparativeOpen((o) => !o)}
          className={cn(
            "w-[calc(100%-1rem)] mx-2 my-0.5 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors",
            comparativeActive
              ? "text-teal-700 font-semibold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
          aria-expanded={comparativeOpen}
          title="Analysis"
        >
          <GitCompare className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">Analysis</span>
              {comparativeOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </>
          )}
        </button>
        {(comparativeOpen || collapsed) &&
          COMPARATIVE_NAV.map((item) => renderItem(item, { nested: !collapsed }))}

        {BOTTOM_NAV.map((item) => renderItem(item))}
      </nav>

      <div className="border-t border-slate-200 py-2">
        {/* Config collapsible group */}
        <button
          type="button"
          onClick={() => setConfigOpen((o) => !o)}
          className={cn(
            "w-[calc(100%-1rem)] mx-2 my-0.5 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors",
            registryActive
              ? "text-teal-700 font-semibold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
          aria-expanded={configOpen}
          title="Config"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">Config</span>
              {configOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </>
          )}
        </button>
        {(configOpen || collapsed) && (
          <>
            {/* Registry collapsible group */}
            <button
              type="button"
              onClick={() => setRegistryOpen((o) => !o)}
              className={cn(
                "w-[calc(100%-1rem)] mx-2 my-0.5 flex items-center gap-3 py-2.5 rounded-md text-[13px] transition-colors",
                collapsed ? "px-3" : "pl-6 pr-3",
                registryActive
                  ? "text-teal-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
              aria-expanded={registryOpen}
              title="Registry"
            >
              <Archive className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">Registry</span>
                  {registryOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </>
              )}
            </button>
            {(registryOpen || collapsed) &&
              REGISTRY_NAV.map((item) => renderItem(item, { nested: !collapsed }))}
          </>
        )}
      </div>

      <ApiHealthIndicator collapsed={collapsed} />
      {!collapsed && (
        <div className="px-3 py-2 border-t border-slate-200 text-[10px] text-slate-400">
          Nexus · Live API
        </div>
      )}
    </aside>
  );
}
