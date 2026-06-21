import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/modules/auth/actions";
import { getBanners } from "@/modules/banners/queries";
import { deleteBanner } from "@/modules/banners/actions";
import { ConsoleHeader } from "@/components/console/console-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ConsoleBannersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ConsoleBannersPage({
  searchParams,
}: ConsoleBannersPageProps) {
  const user = await requireAdmin();
  const banners = await getBanners();
  const { error } = await searchParams;

  const errorMessage =
    error === "delete-failed" ? "Failed to delete banner." : null;

  return (
    <>
      <ConsoleHeader
        title="Banners"
        description="Manage homepage hero carousel slides"
        user={user}
      />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {errorMessage ? (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button asChild>
            <Link href="/console/banners/new">
              <Plus className="mr-2 h-4 w-4" />
              New banner
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No banners yet. Create your first hero slide.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {banner.headlineBefore} {banner.headlineHighlight}{" "}
                      {banner.headlineAfter}
                    </TableCell>
                    <TableCell>{banner.sortOrder}</TableCell>
                    <TableCell>
                      {banner.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/console/banners/${banner.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <form action={deleteBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
