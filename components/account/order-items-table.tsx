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

function parseUnitPrice(unitPrice: number | string) {
  return typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
}

function ItemThumbnail({
  image,
  title,
}: {
  image?: string | null;
  title: string;
}) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:h-12 sm:w-12">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="56px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          N/A
        </div>
      )}
    </div>
  );
}

type OrderItemsTableProps = {
  items: OrderItemRow[];
  className?: string;
};

export function OrderItemsTable({ items, className }: OrderItemsTableProps) {
  return (
    <div className={className}>
      <div className="divide-y md:hidden">
        {items.map((item) => {
          const unitPrice = parseUnitPrice(item.unitPrice);
          const lineTotal = unitPrice * item.quantity;
          const variant = formatVariant(item.variantSnapshot);

          return (
            <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <ItemThumbnail image={item.productImage} title={item.productTitle} />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="font-medium leading-snug">{item.productTitle}</p>
                  {variant ? (
                    <p className="text-sm text-muted-foreground">{variant}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Qty {item.quantity} × {formatPrice(unitPrice)}
                  </span>
                  <span className="font-medium">{formatPrice(lineTotal)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden rounded-lg border md:block">
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
              const unitPrice = parseUnitPrice(item.unitPrice);
              const lineTotal = unitPrice * item.quantity;
              const variant = formatVariant(item.variantSnapshot);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <ItemThumbnail
                      image={item.productImage}
                      title={item.productTitle}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.productTitle}</p>
                    {variant ? (
                      <p className="text-sm text-muted-foreground">{variant}</p>
                    ) : null}
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
    </div>
  );
}
