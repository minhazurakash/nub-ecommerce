import { Role } from "@/lib/types/database";

export function isStaffRole(role?: Role | null) {
  return role === Role.ADMIN || role === Role.EDITOR;
}

export function getDashboardPath(role?: Role | null) {
  return isStaffRole(role) ? "/console" : "/account";
}

export function getDashboardLabel(role?: Role | null) {
  return isStaffRole(role) ? "Dashboard" : "My Account";
}
