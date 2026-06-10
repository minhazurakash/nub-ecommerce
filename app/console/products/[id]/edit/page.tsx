import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/actions";
import {
  getProductForEdit,
  getProductFormOptions,
} from "@/modules/products/admin-queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { ProductForm } from "@/components/console/product-form";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await requireAdmin();
  const { id } = await params;

  const [product, { categories, brands }] = await Promise.all([
    getProductForEdit(id),
    getProductFormOptions(),
  ]);

  if (!product) notFound();

  return (
    <>
      <ConsoleHeader
        title="Edit Product"
        description={product.title}
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <ProductForm product={product} categories={categories} brands={brands} />
      </div>
    </>
  );
}
