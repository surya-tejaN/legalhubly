import { ReactNode } from "react";
import {
  LayoutDashboard,
  Bot,
  Briefcase,
  Search,
  MessageSquare,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  Calendar,
  Shield,
  Building2,
  Settings,
  BarChart3,
} from "lucide-react";

export const clientNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/client/dashboard" },
  { icon: <Bot />, label: "AI Legal Intake", to: "/client/intake", badge: 0 },
  { icon: <Briefcase />, label: "My Cases", to: "/client/cases", badge: 2 },
  { icon: <Search />, label: "Find Lawyers", to: "/client/find-lawyers" },
  { icon: <MessageSquare />, label: "Messages", to: "/client/messages", badge: 3 },
  { icon: <FileText />, label: "Documents", to: "/client/documents" },
  { icon: <CreditCard />, label: "Payments", to: "/client/payments" },
];

export const lawyerNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/lawyer/dashboard" },
  { icon: <Users />, label: "Leads", to: "/lawyer/leads", badge: 5 },
  { icon: <Briefcase />, label: "Cases", to: "/lawyer/cases", badge: 8 },
  { icon: <Calendar />, label: "Calendar", to: "/lawyer/calendar" },
  { icon: <FileText />, label: "AI Documents", to: "/lawyer/documents" },
  { icon: <MessageSquare />, label: "Messages", to: "/lawyer/messages", badge: 4 },
  { icon: <BarChart3 />, label: "Analytics", to: "/lawyer/analytics" },
];

export const firmNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/firm/dashboard" },
  { icon: <Building2 />, label: "Team", to: "/firm/team" },
  { icon: <Briefcase />, label: "All Cases", to: "/firm/cases" },
  { icon: <TrendingUp />, label: "Analytics", to: "/firm/analytics" },
  { icon: <CreditCard />, label: "Billing", to: "/firm/billing" },
  { icon: <Settings />, label: "Settings", to: "/firm/settings" },
];

export const adminNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard" },
  { icon: <Users />, label: "Users", to: "/admin/users" },
  { icon: <Building2 />, label: "Firms", to: "/admin/firms" },
  { icon: <Shield />, label: "Moderation", to: "/admin/moderation" },
  { icon: <BarChart3 />, label: "Analytics", to: "/admin/analytics" },
  { icon: <Settings />, label: "Settings", to: "/admin/settings" },
];
