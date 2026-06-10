"use client";

import { useTransition } from "react";
import { Role } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import { updateUserRole } from "@/modules/users/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRoleSelectProps = {
  userId: string;
  currentRole: Role;
  disabled?: boolean;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: Role.ADMIN, label: "Admin" },
  { value: Role.EDITOR, label: "Editor" },
  { value: Role.USER, label: "User" },
];

export function UserRoleSelect({
  userId,
  currentRole,
  disabled,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(role: Role) {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("role", role);
    startTransition(() => {
      updateUserRole(formData);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentRole}
        onValueChange={(value) => handleRoleChange(value as Role)}
        disabled={disabled || isPending}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
