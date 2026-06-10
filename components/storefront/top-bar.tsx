"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function TopBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      <div className="container-custom flex h-9 items-center justify-center gap-2 text-xs font-medium sm:text-sm">
        <Sparkles className="hidden h-3.5 w-3.5 sm:block" />
        <p className="text-center">
          Free delivery on orders over {formatPrice(75)} —{" "}
          <Link href="/shop?deals=true" className="underline underline-offset-2 hover:opacity-90">
            Shop deals
          </Link>
        </p>
        <Truck className="hidden h-3.5 w-3.5 sm:block" />
      </div>
    </motion.div>
  );
}
