import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type OrderItemRow = {
  id: string;
  productTitle: string;
  productImage?: string | null;
  variantSnapshot?: { size?: string | null; color?: string | null } | null;
  quantity: number;
  unitPrice: number | string;
};

function formatVariant(
  variant?: OrderItemRow["variantSnapshot"]
): string | null {
  if (!variant) return null;

  const parts = [variant.size, variant.color].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

type OrderItemsTableProps = {
  items: OrderItemRow[];
  className?: string;
};

export function OrderItemsTable({ items, className }: OrderItemsTableProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[72px]">Product</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const unitPrice =
              typeof item.unitPrice === "string"
                ? parseFloat(item.unitPrice)
                : item.unitPrice;
            const lineTotal = unitPrice * item.quantity;
            const variant = formatVariant(item.variantSnapshot);

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{item.productTitle}</p>
                  {variant && (
                    <p className="text-sm text-muted-foreground">{variant}</p>
                  )}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(unitPrice)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(lineTotal)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
