"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createReview } from "@/modules/reviews/actions";

type ReviewFormProps = {
  productId: string;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  hasExistingReview: boolean;
};

export function ReviewForm({
  productId,
  isLoggedIn,
  hasPurchased,
  hasExistingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>{" "}
        to leave a review after purchasing this product.
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Purchase this product to leave a review.
      </div>
    );
  }

  if (hasExistingReview) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        You have already reviewed this product. Thank you for your feedback.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createReview({ productId, rating, comment });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Review submitted.");
      setComment("");
      setRating(5);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
      <div className="space-y-2">
        <Label>Your rating</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = value <= (hoverRating || rating);
            return (
              <button
                key={value}
                type="button"
                className="rounded p-0.5 transition-colors"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">Your review</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
