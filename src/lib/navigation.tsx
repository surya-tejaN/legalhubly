import {
  LayoutDashboard,
  Search,
  Heart,
  Settings,
  MessageSquare,
  FileText,
  Briefcase,
  Video,
  CreditCard,
  Users,
  Calendar,
  Receipt,
} from "lucide-react";

export const clientNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/client/dashboard" },
  { icon: <Search />, label: "Find Lawyers", to: "/client/find-lawyers" },
  { icon: <Heart />, label: "Saved Lawyers", to: "/client/saved-lawyers" },
  { icon: <MessageSquare />, label: "Messages", to: "/client/messages" },
  { icon: <Briefcase />, label: "My Cases", to: "/client/cases" },
  { icon: <Video />, label: "Consultations", to: "/client/consultations" },
  { icon: <FileText />, label: "Documents", to: "/client/documents" },
  { icon: <CreditCard />, label: "Payments", to: "/client/payments" },
  { icon: <Settings />, label: "Account Settings", to: "/client/settings" },
];

export const lawyerNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/lawyer/dashboard" },
  { icon: <Users />, label: "Leads", to: "/lawyer/leads" },
  { icon: <MessageSquare />, label: "Messages", to: "/lawyer/messages" },
  { icon: <Briefcase />, label: "Cases", to: "/lawyer/cases" },
  { icon: <Calendar />, label: "Calendar", to: "/lawyer/calendar" },
  { icon: <Receipt />, label: "Billing", to: "/lawyer/billing" },
  { icon: <FileText />, label: "Documents", to: "/lawyer/documents" },
];

export const firmNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/firm/dashboard" },
];

export const adminNavItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard" },
];
