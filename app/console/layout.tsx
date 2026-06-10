export const dynamic = "force-dynamic";

import { requireAdmin } from "@/modules/auth/actions";
import { ConsoleSidebar } from "@/components/console/console-sidebar";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleSidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
