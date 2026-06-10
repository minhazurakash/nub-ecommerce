import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/modules/auth/actions";
import { deleteProduct } from "@/modules/products/actions";
import { getAdminProducts } from "@/modules/products/admin-queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ConsoleProductsPage() {
  const user = await requireAdmin();
  const products = await getAdminProducts();

  return (
    <>
      <ConsoleHeader
        title="Products"
        description="Manage your product catalog"
        user={user}
      />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/console/products/new">
              <Plus className="h-4 w-4" />
              New product
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found. Create your first product.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      {product.discountPrice
                        ? formatPrice(product.discountPrice)
                        : formatPrice(product.price)}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isFeatured ? (
                          <Badge variant="secondary">Featured</Badge>
                        ) : null}
                        {product.isDeal ? (
                          <Badge variant="warning">Deal</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/console/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
