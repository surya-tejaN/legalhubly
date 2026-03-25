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
  Heart,
  LogOut,
} from "lucide-react";

export const clientNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/client/dashboard" },
  { icon: <Search />, label: "Find Lawyers", to: "/client/find-lawyers" },
  { icon: <Heart />, label: "Saved Lawyers", to: "/client/saved-lawyers" },
  { icon: <Calendar />, label: "Consultations", to: "/client/consultations" },
  { icon: <MessageSquare />, label: "Messages", to: "/client/messages" },
  { icon: <Briefcase />, label: "My Cases", to: "/client/cases" },
  { icon: <FileText />, label: "Documents", to: "/client/documents" },
  { icon: <CreditCard />, label: "Payments", to: "/client/payments" },
  { icon: <Settings />, label: "Account Settings", to: "/client/settings" },
];

export const lawyerNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/lawyer/dashboard" },
  { icon: <Users />, label: "Leads", to: "/lawyer/leads" },
  { icon: <Briefcase />, label: "Matters", to: "/lawyer/cases" },
  { icon: <Calendar />, label: "Calendar", to: "/lawyer/calendar" },
  { icon: <FileText />, label: "AI Documents", to: "/lawyer/documents" },
  { icon: <MessageSquare />, label: "Messages", to: "/lawyer/messages" },
  { icon: <CreditCard />, label: "Billing", to: "/lawyer/billing" },
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
  { icon: <CreditCard />, label: "Pricing Plans", to: "/admin/pricing" },
  { icon: <Shield />, label: "Moderation", to: "/admin/moderation" },
  { icon: <BarChart3 />, label: "Analytics", to: "/admin/analytics" },
  { icon: <Settings />, label: "Settings", to: "/admin/settings" },
];
