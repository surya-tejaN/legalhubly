import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, ChevronLeft, ChevronRight, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationsCenter from "@/components/NotificationsCenter";

interface SidebarItem {
  icon: ReactNode;
  label: string;
  to: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  portalLabel: string;
  userName?: string;
  userRole?: string;
}

export default function DashboardLayout({ children, sidebarItems, portalLabel, userName = "User", userRole = "Member" }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
        <Scale className="h-6 w-6 text-accent shrink-0" />
        {!collapsed && <span className="font-serif text-lg text-primary-foreground tracking-tight">LegalBridge</span>}
      </div>

      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent/80">{portalLabel}</span>
        </div>
      )}

      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-accent-foreground truncate">{userName}</div>
              <div className="text-[11px] text-sidebar-foreground/50">{userRole}</div>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 border-t border-sidebar-border shrink-0 flex flex-col gap-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-colors text-xs"
        >
          {collapsed ? <Scale className="h-4 w-4" /> : <span>← Back to Home</span>}
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-40 flex-col bg-primary transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[280px] h-full flex flex-col bg-primary shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "md:ml-[68px]" : "md:ml-[250px]")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 md:px-6 bg-background/80 backdrop-blur-lg border-b">
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md bg-muted rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <NotificationsCenter />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
