-- Notification types + table
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('ORDER_PLACED', 'ORDER_STATUS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT NOT NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_order ON notifications(order_id);

-- One review per user per product
DO $$ BEGIN
  ALTER TABLE reviews ADD CONSTRAINT reviews_product_id_user_id_key UNIQUE (product_id, user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
