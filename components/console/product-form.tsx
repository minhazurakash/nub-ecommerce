"use client";

import { useActionState, useMemo, useState } from "react";
import type { Brand, Category, Product, ProductImage } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import { saveProduct, type ProductFormState } from "@/modules/products/actions";
import { RichTextEditor } from "@/components/console/rich-text-editor";
import { ImageUploader, type ImageItem } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProductWithTags = Product & {
  tags?: { tag: { name: string } }[];
  images?: ProductImage[];
};

type ProductFormProps = {
  product?: ProductWithTags;
  categories: Category[];
  brands: Brand[];
};

const initialState: ProductFormState = {};

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(saveProduct, initialState);
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(product?.subcategoryId ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isDeal, setIsDeal] = useState(product?.isDeal ?? false);
  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? undefined,
    })) ?? []
  );

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories]
  );

  const subcategories = useMemo(
    () => categories.filter((category) => category.parentId === categoryId),
    [categories, categoryId]
  );

  const defaultTags = product?.tags?.map((entry) => entry.tag.name).join(", ") ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="isFeatured" value={isFeatured ? "on" : ""} />
      <input type="hidden" name="isDeal" value={isDeal ? "on" : ""} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="subcategoryId" value={subcategoryId} />
      <input type="hidden" name="brandId" value={brandId} />
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(images.map(({ url, alt }) => ({ url, alt })))}
      />

      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={product?.title}
                  placeholder="Product title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader value={images} onChange={setImages} maxFiles={6} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price.toString()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount price</Label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.discountPrice?.toString() ?? ""}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku}
                  placeholder="BB-001"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => {
                    setCategoryId(value);
                    setSubcategoryId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {rootCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={subcategoryId || "none"}
                  onValueChange={(value) =>
                    setSubcategoryId(value === "none" ? "" : value)
                  }
                  disabled={subcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subcategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={brandId || "none"}
                  onValueChange={(value) => setBrandId(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Textarea
                  id="tags"
                  name="tags"
                  defaultValue={defaultTags}
                  placeholder="wireless, premium, sale"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Comma-separated tag names</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show on homepage highlights</p>
                </div>
                <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="deal">Deal</Label>
                  <p className="text-xs text-muted-foreground">Mark as a special offer</p>
                </div>
                <Switch id="deal" checked={isDeal} onCheckedChange={setIsDeal} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : product ? (
              "Update product"
            ) : (
              "Create product"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
