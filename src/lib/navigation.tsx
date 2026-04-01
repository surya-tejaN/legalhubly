import {
  Search,
  Briefcase,
  User,
  LayoutDashboard,
  Users,
  Wrench,
  Settings,
} from "lucide-react";

export const clientNavItems = [
  { icon: <Search />, label: "Find Lawyers", to: "/client/find-lawyers" },
  { icon: <Briefcase />, label: "My Cases", to: "/client/cases" },
  { icon: <User />, label: "Profile", to: "/client/profile" },
];

export const lawyerNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/lawyer/dashboard" },
  { icon: <Users />, label: "Clients", to: "/lawyer/clients" },
  { icon: <Wrench />, label: "Tools", to: "/lawyer/tools" },
  { icon: <Settings />, label: "Settings", to: "/lawyer/settings" },
];

export const firmNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/firm/dashboard" },
];

export const adminNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard" },
];
