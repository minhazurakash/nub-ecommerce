import { requireAdmin } from "@/modules/auth/actions";
import { ConsoleHeader } from "@/components/console/console-header";
import { BannerForm } from "@/components/console/banner-form";

export default async function NewBannerPage() {
  const user = await requireAdmin();

  return (
    <>
      <ConsoleHeader
        title="New banner"
        description="Add a slide to the homepage hero carousel"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <BannerForm />
      </div>
    </>
  );
}
