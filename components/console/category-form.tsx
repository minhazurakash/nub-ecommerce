"use client";

import { useActionState, useState } from "react";
import type { Category } from "@/lib/types/database";
import { Loader2, Trash2 } from "lucide-react";
import {
  saveCategory,
  deleteCategory,
  type CategoryFormState,
} from "@/modules/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CategoryFormProps = {
  category?: Category;
  categories: Category[];
};

const initialState: CategoryFormState = {};

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(saveCategory, initialState);
  const [parentId, setParentId] = useState(category?.parentId ?? "none");

  const parentOptions = categories.filter(
    (item) => !category || item.id !== category.id
  );

  return (
    <div className="space-y-6">
      <form action={formAction}>
        {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
        <input type="hidden" name="parentId" value={parentId} />

        {state.error ? (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {category ? "Edit category" : "New category"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name}
                placeholder="Electronics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={category?.slug}
                placeholder="auto-generated from name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={category?.sortOrder ?? 0}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={category?.imageUrl ?? ""}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="parentId">Parent category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="No parent (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top level)</SelectItem>
                  {parentOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nest this category under a parent for hierarchical navigation.
              </p>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : category ? (
                  "Update category"
                ) : (
                  "Create category"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {category ? (
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <Button type="submit" variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete category
          </Button>
        </form>
      ) : null}
    </div>
  );
}
