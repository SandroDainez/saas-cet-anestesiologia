import type { TraineeYearCode } from "@/types/database";

export type UserRole =
  | "super_admin"
  | "institution_admin"
  | "coordinator"
  | "preceptor"
  | "trainee_me1"
  | "trainee_me2"
  | "trainee_me3";

export type DashboardScope = "trainee" | "preceptor" | "admin";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  institution_id: string;
  institution_name: string;
  training_year?: TraineeYearCode;
}
