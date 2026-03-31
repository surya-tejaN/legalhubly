import {
  LayoutDashboard,
  Search,
  Heart,
  Settings,
} from "lucide-react";

export const clientNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/client/dashboard" },
  { icon: <Search />, label: "Find Lawyers", to: "/client/find-lawyers" },
  { icon: <Heart />, label: "Saved Lawyers", to: "/client/saved-lawyers" },
  { icon: <Settings />, label: "Account Settings", to: "/client/settings" },
];

export const lawyerNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/lawyer/dashboard" },
];

export const firmNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/firm/dashboard" },
];

export const adminNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard" },
];
