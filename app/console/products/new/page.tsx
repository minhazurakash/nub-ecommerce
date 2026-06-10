import { requireAdmin } from "@/modules/auth/actions";
import { getProductFormOptions } from "@/modules/products/admin-queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { ProductForm } from "@/components/console/product-form";

export default async function NewProductPage() {
  const user = await requireAdmin();
  const { categories, brands } = await getProductFormOptions();

  return (
    <>
      <ConsoleHeader
        title="New Product"
        description="Add a new product to your catalog"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </>
  );
}
