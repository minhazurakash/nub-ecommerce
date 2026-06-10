"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Dumbbell,
  Home,
  Laptop,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: LucideIcon;
}

const categoryIcons: Record<string, LucideIcon> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
};

/* Muted, earthy category tones — colorful but not neon */
const categoryColors: Record<string, string> = {
  electronics: "bg-[oklch(0.50_0.09_235)]",
  fashion: "bg-[oklch(0.54_0.10_18)]",
  home: "bg-[oklch(0.56_0.09_68)]",
  beauty: "bg-[oklch(0.52_0.08_330)]",
  sports: "bg-[oklch(0.50_0.09_158)]",
  books: "bg-[oklch(0.46_0.10_252)]",
};

const defaultCategories: CategoryItem[] = [
  { id: "1", name: "Electronics", slug: "electronics", icon: Laptop },
  { id: "2", name: "Fashion", slug: "fashion", icon: Shirt },
  { id: "3", name: "Home", slug: "home", icon: Home },
  { id: "4", name: "Beauty", slug: "beauty", icon: Sparkles },
  { id: "5", name: "Sports", slug: "sports", icon: Dumbbell },
  { id: "6", name: "Books", slug: "books", icon: BookOpen },
];

interface CategoryStripProps {
  categories?: CategoryItem[];
  className?: string;
}

export function CategoryStrip({
  categories = defaultCategories,
  className,
}: CategoryStripProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {categories.map((category, index) => {
        const slugKey = category.slug.toLowerCase();
        const Icon = category.icon ?? categoryIcons[slugKey] ?? Sparkles;
        const color = categoryColors[slugKey] ?? "bg-primary";

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
          >
            <Link
              href={`/shop?category=${category.slug}`}
              className="group relative block overflow-hidden rounded-xl border border-border/60 bg-card transition-colors duration-300 hover:border-primary/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center",
                      color
                    )}
                  >
                    <Icon className="h-14 w-14 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-[family-name:var(--font-poppins)] text-base font-semibold text-white sm:text-lg">
                    {category.name}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/80 transition-colors group-hover:text-white">
                    Shop now
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
