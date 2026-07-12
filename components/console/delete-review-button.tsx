"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteReview } from "@/modules/reviews/actions";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this review permanently?")) return;

    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Review deleted.");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleDelete}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
