import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="font-[family-name:var(--font-poppins)] text-2xl font-bold tracking-tight text-primary"
        >
          Blueberry
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Premium ecommerce, simplified
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
