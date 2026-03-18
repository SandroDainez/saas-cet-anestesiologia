import type { Route } from "next";

import type { DashboardScope } from "@/types/auth";

export interface NavigationItem {
  href: Route;
  label: string;
  description: string;
  scope: DashboardScope | "shared";
}
