import { requireAdmin } from "@/modules/auth/actions";
import { getCategories, getCategoryTree } from "@/modules/categories/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { CategoriesManager } from "./categories-manager";

export default async function ConsoleCategoriesPage() {
  const user = await requireAdmin();

  const [tree, categories] = await Promise.all([
    getCategoryTree(),
    getCategories(),
  ]);

  return (
    <>
      <ConsoleHeader
        title="Categories"
        description="Organize products with nested categories"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <CategoriesManager tree={tree} categories={categories} />
      </div>
    </>
  );
}
