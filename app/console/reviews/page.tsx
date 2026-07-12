import Link from "next/link";
import { requireRoleAdmin } from "@/modules/auth/actions";
import { getAdminReviews } from "@/modules/reviews/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { DeleteReviewButton } from "@/components/console/delete-review-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

type ConsoleReviewsPageProps = {
  searchParams: Promise<{
    product?: string;
    user?: string;
    rating?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ConsoleReviewsPage({
  searchParams,
}: ConsoleReviewsPageProps) {
  const user = await requireRoleAdmin();
  const params = await searchParams;

  const ratingFilter = params.rating ? Number(params.rating) : undefined;
  const { reviews } = await getAdminReviews({
    productQuery: params.product,
    userQuery: params.user,
    rating:
      ratingFilter && ratingFilter >= 1 && ratingFilter <= 5
        ? ratingFilter
        : undefined,
    from: params.from || undefined,
    to: params.to ? `${params.to}T23:59:59.999Z` : undefined,
    limit: 200,
  });

  return (
    <>
      <ConsoleHeader
        title="Reviews"
        description="Moderate product reviews"
        user={user}
      />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <form
          method="get"
          className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              name="product"
              placeholder="Title or slug"
              defaultValue={params.product ?? ""}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="user">Customer</Label>
            <Input
              id="user"
              name="user"
              placeholder="Name or email"
              defaultValue={params.user ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <select
              id="rating"
              name="rating"
              defaultValue={params.rating ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">All</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              name="from"
              type="date"
              defaultValue={params.from ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              name="to"
              type="date"
              defaultValue={params.to ?? ""}
            />
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/console/reviews">Clear</Link>
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      {review.product.slug ? (
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="font-medium text-primary hover:underline"
                          target="_blank"
                        >
                          {review.product.title}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {review.product.title}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {review.user.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {review.rating}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteReviewButton reviewId={review.id} />
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
