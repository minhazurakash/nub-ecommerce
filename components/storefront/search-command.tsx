"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Package } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setSearchOpen } from "@/modules/ui/uiSlice";
import { formatPrice } from "@/lib/utils";

interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
}

interface SearchResponse {
  products: SearchProduct[];
}

export function SearchCommand() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.searchOpen);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const setOpen = useCallback(
    (value: boolean) => dispatch(setSearchOpen(value)),
    [dispatch]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data.products ?? []);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search products..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {!loading && query.trim().length < 2 && (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        )}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <CommandEmpty>No products found.</CommandEmpty>
        )}
        {!loading && results.length > 0 && (
          <CommandGroup heading="Products">
            {results.map((product) => (
              <CommandItem
                key={product.id}
                value={product.title}
                onSelect={() => handleSelect(product.slug)}
                className="gap-3"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="line-clamp-1 text-sm">{product.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(product.discountPrice ?? product.price)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
