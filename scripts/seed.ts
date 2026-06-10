/**
 * Seed script — auto-creates tables if missing, then seeds data.
 * Usage: yarn db:seed
 */
import { config } from "dotenv";
import { resolve } from "path";
import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { setupDatabase } from "./setup-db";

// Load .env.local then .env (same order as Next.js)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing Supabase env vars. Ensure .env.local contains:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const ROOT_CATEGORIES = [
  { name: "Electronics", children: ["Phones", "Laptops", "Audio"] },
  { name: "Fashion", children: ["Men", "Women", "Shoes"] },
  { name: "Home", children: ["Kitchen", "Furniture"] },
  { name: "Sports", children: ["Fitness", "Outdoor"] },
  { name: "Beauty", children: ["Skincare", "Hair"] },
];

const BRANDS = [
  "Apple", "Samsung", "Nike", "Adidas", "Sony", "LG", "Dell", "HP",
  "Levi's", "Zara", "IKEA", "KitchenAid", "L'Oreal", "Maybelline", "Patagonia",
];

function slugify(t: string) {
  return t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

function checkError(error: { message: string; code?: string } | null, step: string) {
  if (!error) return;
  console.error(`\nSeed failed at: ${step}`);
  console.error(error.message);
  if (error.code === "PGRST205" || error.message.includes("does not exist")) {
    console.error(
      "\nDatabase tables not found. Run supabase/schema.sql in your Supabase SQL Editor first."
    );
  }
  process.exit(1);
}

async function ensureSchema() {
  const { error } = await db.from("users").select("id").limit(1);
  if (error?.message.includes("does not exist") || error?.code === "PGRST205") {
    console.log("Tables not found — setting up database automatically...");
    await setupDatabase();
    // Brief pause for Supabase API schema cache to refresh
    await new Promise((r) => setTimeout(r, 2000));
    const { error: retry } = await db.from("users").select("id").limit(1);
    if (retry) {
      console.error("Tables created but API not ready yet. Wait 10s and run: yarn db:seed");
      process.exit(1);
    }
  }
}

async function clearAll() {
  const tables = [
    "order_items", "orders", "cart_items", "wishlist_items", "reviews",
    "product_tags", "product_variants", "product_images", "products",
    "tags", "addresses", "users", "categories", "brands",
  ];
  for (const table of tables) {
    await db.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
}

async function main() {
  await ensureSchema();
  console.log("Clearing existing data...");
  await clearAll();

  // Users
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@blueberry.local";
  const users = [
    { auth_id: randomUUID(), email: adminEmail, name: "Admin", role: "ADMIN" },
    { auth_id: randomUUID(), email: "editor@blueberry.local", name: "Editor", role: "EDITOR" },
    ...Array.from({ length: 20 }, () => ({
      auth_id: randomUUID(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      role: "USER",
    })),
  ];
  const { data: insertedUsers, error: usersError } = await db
    .from("users")
    .insert(users)
    .select();
  checkError(usersError, "insert users");
  const customers = (insertedUsers ?? []).filter((u) => u.role === "USER");
  console.log(`Created ${insertedUsers?.length ?? 0} users`);

  // Brands
  const { data: brands, error: brandsError } = await db
    .from("brands")
    .insert(BRANDS.map((name) => ({ name, slug: slugify(name) })))
    .select();
  checkError(brandsError, "insert brands");
  console.log(`Created ${brands?.length ?? 0} brands`);

  // Categories
  const categoryIds: Record<string, string> = {};
  for (const root of ROOT_CATEGORIES) {
    const { data: parent } = await db
      .from("categories")
      .insert({ name: root.name, slug: slugify(root.name), sort_order: 0 })
      .select()
      .single();
    categoryIds[root.name] = parent!.id;
    for (const child of root.children) {
      const { data: sub } = await db
        .from("categories")
        .insert({
          name: child,
          slug: slugify(`${root.name}-${child}`),
          parent_id: parent!.id,
        })
        .select()
        .single();
      categoryIds[`${root.name}/${child}`] = sub!.id;
    }
  }
  const allCatIds = Object.values(categoryIds);
  console.log(`Created ${allCatIds.length} categories`);

  // Products
  const productRows = [];
  for (let i = 0; i < 75; i++) {
    const catKey = faker.helpers.arrayElement(Object.keys(categoryIds));
    const brand = faker.helpers.arrayElement(brands!);
    const price = faker.number.float({ min: 5, max: 500, fractionDigits: 2 });
    const hasDiscount = faker.datatype.boolean({ probability: 0.4 });
    productRows.push({
      title: faker.commerce.productName(),
      slug: slugify(`${faker.commerce.productName()}-${i}`),
      description: `<p>${faker.commerce.productDescription()}</p>`,
      price,
      discount_price: hasDiscount ? faker.number.float({ min: 5, max: price, fractionDigits: 2 }) : null,
      sku: `BB-${faker.string.alphanumeric(8).toUpperCase()}`,
      stock: faker.number.int({ min: 0, max: 200 }),
      rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
      review_count: faker.number.int({ min: 0, max: 50 }),
      is_featured: faker.datatype.boolean({ probability: 0.2 }),
      is_deal: faker.datatype.boolean({ probability: 0.15 }),
      category_id: categoryIds[catKey],
      brand_id: brand.id,
    });
  }
  const { data: products } = await db.from("products").insert(productRows).select();
  console.log(`Created ${products!.length} products`);

  // Images
  const images = products!.flatMap((p, i) =>
    Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, j) => ({
      product_id: p.id,
      url: `https://picsum.photos/seed/${p.id}-${j}/800/800`,
      alt: p.title,
      sort_order: j,
    }))
  );
  await db.from("product_images").insert(images);

  // Variants
  const colors = ["Black", "White", "Blue", "Red", "Green"];
  const sizes = ["S", "M", "L", "XL"];
  const variants = products!.slice(0, 50).flatMap((p) =>
    Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, i) => ({
      product_id: p.id,
      size: faker.helpers.arrayElement(sizes),
      color: faker.helpers.arrayElement(colors),
      color_hex: "#000000",
      sku: `${p.sku}-V${i}`,
      stock: faker.number.int({ min: 5, max: 50 }),
      price_delta: 0,
    }))
  );
  await db.from("product_variants").insert(variants);

  // Addresses & orders
  for (const customer of customers.slice(0, 15)) {
    await db.from("addresses").insert({
      user_id: customer.id,
      label: "Home",
      full_name: customer.name ?? "Customer",
      phone: faker.phone.number(),
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postal_code: faker.location.zipCode(),
      country: "US",
      is_default: true,
    });

    const orderCount = faker.number.int({ min: 1, max: 3 });
    for (let o = 0; o < orderCount; o++) {
      const items = faker.helpers.arrayElements(products!, faker.number.int({ min: 1, max: 4 }));
      let subtotal = 0;
      const orderItems = items.map((p) => {
        const qty = faker.number.int({ min: 1, max: 3 });
        const unit = Number(p.discount_price ?? p.price);
        subtotal += unit * qty;
        return {
          product_id: p.id,
          quantity: qty,
          unit_price: unit,
          product_title: p.title,
          product_image: `https://picsum.photos/seed/${p.id}-0/800/800`,
        };
      });
      const shipping = subtotal >= 75 ? 0 : 9.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      const { data: order } = await db
        .from("orders")
        .insert({
          user_id: customer.id,
          order_number: `BB-${Date.now().toString(36).toUpperCase()}-${faker.string.alphanumeric(4).toUpperCase()}`,
          status: faker.helpers.arrayElement(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]),
          subtotal,
          shipping,
          tax,
          total,
          shipping_address: {
            fullName: customer.name,
            line1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: "CA",
            postalCode: "90210",
            country: "US",
          },
        })
        .select()
        .single();

      await db.from("order_items").insert(
        orderItems.map((item) => ({ ...item, order_id: order!.id }))
      );
    }
  }

  console.log("Seed complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
