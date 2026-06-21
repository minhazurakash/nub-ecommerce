-- Banners for hero carousel
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  headline_before TEXT NOT NULL DEFAULT '',
  headline_highlight TEXT NOT NULL DEFAULT '',
  headline_after TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  href TEXT NOT NULL DEFAULT '/shop',
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON banners(is_active, sort_order);

DROP TRIGGER IF EXISTS banners_updated_at ON banners;
CREATE TRIGGER banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Payment methods
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('COD', 'SSLCOMMERZ');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method payment_method NOT NULL DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
