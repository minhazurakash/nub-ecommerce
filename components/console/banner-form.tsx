"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Banner } from "@/lib/types/database";
import { saveBanner, type BannerFormState } from "@/modules/banners/actions";
import { ImageUploader, type ImageItem } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateId } from "@/lib/utils";

type BannerFormProps = {
  banner?: Banner;
};

const initialState: BannerFormState = {};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function BannerForm({ banner }: BannerFormProps) {
  const [state, formAction, isPending] = useActionState(saveBanner, initialState);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [images, setImages] = useState<ImageItem[]>(
    banner?.imageUrl
      ? [{ id: generateId(), url: banner.imageUrl, alt: banner.title }]
      : []
  );

  const imageUrl = images[0]?.url ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {banner?.id ? <input type="hidden" name="id" value={banner.id} /> : null}
      <input type="hidden" name="isActive" value={isActive ? "on" : ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {state.error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Banner image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader value={images} onChange={setImages} maxFiles={1} />
          {!imageUrl ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a banner image (recommended 1600×900 or wider).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Promo label</Label>
            <Input
              id="title"
              name="title"
              defaultValue={banner?.title}
              placeholder="2026 FIFA World Cup"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="headlineBefore">Headline (before)</Label>
              <Input
                id="headlineBefore"
                name="headlineBefore"
                defaultValue={banner?.headlineBefore}
                placeholder="Official"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineHighlight">Headline (highlight)</Label>
              <Input
                id="headlineHighlight"
                name="headlineHighlight"
                defaultValue={banner?.headlineHighlight}
                placeholder="World Cup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headlineAfter">Headline (after)</Label>
              <Input
                id="headlineAfter"
                name="headlineAfter"
                defaultValue={banner?.headlineAfter}
                placeholder="Jerseys"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Button text</Label>
              <Input
                id="ctaText"
                name="ctaText"
                defaultValue={banner?.ctaText ?? "Shop Now"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Button link</Label>
              <Input
                id="href"
                name="href"
                defaultValue={banner?.href ?? "/shop"}
                placeholder="/shop"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule & order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={banner?.sortOrder ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts (optional)</Label>
              <Input
                id="startsAt"
                name="startsAt"
                type="date"
                defaultValue={toDateInputValue(banner?.startsAt ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Ends (optional)</Label>
              <Input
                id="endsAt"
                name="endsAt"
                type="date"
                defaultValue={toDateInputValue(banner?.endsAt ?? null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive" className="font-normal">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || !imageUrl}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {banner ? "Update banner" : "Create banner"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/console/banners">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
