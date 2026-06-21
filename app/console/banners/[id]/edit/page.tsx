import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/actions";
import { getBannerById } from "@/modules/banners/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { BannerForm } from "@/components/console/banner-form";

type EditBannerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const user = await requireAdmin();
  const { id } = await params;
  const banner = await getBannerById(id);

  if (!banner) notFound();

  return (
    <>
      <ConsoleHeader
        title="Edit banner"
        description="Update hero carousel slide"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <BannerForm banner={banner} />
      </div>
    </>
  );
}
