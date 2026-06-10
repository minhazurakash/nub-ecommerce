"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/database";
import { Plus, Pencil } from "lucide-react";
import { CategoryForm } from "@/components/console/category-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

type CategoriesManagerProps = {
  tree: CategoryTreeNode[];
  categories: Category[];
};

function CategoryRow({
  node,
  depth,
  categories,
  onEdit,
}: {
  node: CategoryTreeNode;
  depth: number;
  categories: Category[];
  onEdit: (category: Category) => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0",
          depth > 0 && "bg-muted/30"
        )}
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">{node.name}</p>
          <p className="text-xs text-muted-foreground">
            /{node.slug} · sort {node.sortOrder}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(node)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>
      {node.children.map((child) => (
        <CategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          categories={categories}
          onEdit={onEdit}
        />
      ))}
    </>
  );
}

export function CategoriesManager({ tree, categories }: CategoriesManagerProps) {
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setEditOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New category</DialogTitle>
            </DialogHeader>
            <CategoryForm categories={categories} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {tree.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">
            No categories yet. Create your first category.
          </p>
        ) : (
          tree.map((node) => (
            <CategoryRow
              key={node.id}
              node={node}
              depth={0}
              categories={categories}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingCategory(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editingCategory ? (
            <CategoryForm category={editingCategory} categories={categories} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
