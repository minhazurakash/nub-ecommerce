"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/modules/upload/actions";

export type ImageItem = {
  id: string;
  url: string;
  alt?: string;
};

type ImageUploaderProps = {
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxFiles?: number;
  className?: string;
};

type SortableThumbnailProps = {
  item: ImageItem;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

function SortableThumbnail({ item, onRemove, disabled }: SortableThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
        isDragging && "z-10 opacity-80 shadow-lg ring-2 ring-primary"
      )}
    >
      <Image
        src={item.url}
        alt={item.alt ?? "Product image"}
        fill
        className="object-cover"
        sizes="120px"
        unoptimized
      />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-white hover:bg-white/20 active:cursor-grabbing"
          aria-label="Drag to reorder"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="rounded p-1 text-white hover:bg-destructive/80"
          aria-label="Remove image"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 10,
  className,
}: ImageUploaderProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;
  const remaining = maxFiles - value.length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((item) => item.id !== id));
    },
    [onChange, value]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = value.findIndex((item) => item.id === active.id);
      const newIndex = value.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onChange(arrayMove(value, oldIndex, newIndex));
    },
    [onChange, value]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const filesToUpload = acceptedFiles.slice(0, remaining);
      if (filesToUpload.length === 0) {
        toast.error(`Maximum of ${maxFiles} images allowed.`);
        return;
      }

      setUploadingCount((count) => count + filesToUpload.length);
      const uploaded: ImageItem[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const result = await uploadImage(formData);
          if (result.success) {
            uploaded.push({
              id: crypto.randomUUID(),
              url: result.url,
              alt: file.name,
            });
          } else {
            toast.error(result.error);
          }
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        } finally {
          setUploadingCount((count) => count - 1);
        }
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(
          uploaded.length === 1
            ? "Image uploaded."
            : `${uploaded.length} images uploaded.`
        );
      }
    },
    [maxFiles, onChange, remaining, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: remaining,
    disabled: isUploading || remaining <= 0,
    multiple: true,
  });

  return (
    <div className={cn("space-y-4", className)}>
      {value.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((item) => item.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {value.map((item) => (
                <SortableThumbnail
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  disabled={isUploading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          (isUploading || remaining <= 0) && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="mb-2 size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : remaining <= 0 ? (
          <>
            <ImageIcon className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Maximum images reached.</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF up to 5 MB ({remaining} remaining)
            </p>
          </>
        )}
      </div>

      {value.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {value.length} of {maxFiles} images · drag to reorder
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
