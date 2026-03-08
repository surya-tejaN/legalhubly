import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarItem {
  icon: ReactNode;
  label: string;
  to: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  portalLabel: string;
  portalColor?: string;
}

export default function DashboardLayout({ children, sidebarItems, portalLabel }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-primary transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <Scale className="h-6 w-6 text-accent shrink-0" />
          {!collapsed && <span className="font-serif text-lg text-primary-foreground">LegalBridge</span>}
        </div>

        {/* Portal label */}
        {!collapsed && (
          <div className="px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">{portalLabel}</span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-sm"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>

        {/* Back to home */}
        <div className="p-2 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-sm"
          >
            {collapsed ? <Scale className="h-4 w-4" /> : <span>← Back to Home</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-60")}>
        <div className="p-6 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
