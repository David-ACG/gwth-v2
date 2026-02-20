-- Add role column to Better Auth user table
-- This migration adds admin role capability to the existing Better Auth system

BEGIN;

-- Add role column to user table (Better Auth table)
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) DEFAULT 'user' CHECK ("role" IN ('user', 'admin', 'super_admin'));

-- Set existing admin user to admin role
UPDATE "user"
SET "role" = 'admin'
WHERE "email" = 'david@agilecommercegroup.com';

-- Create index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_user_role ON "user" ("role");
CREATE INDEX IF NOT EXISTS idx_user_email_role ON "user" ("email", "role");

COMMIT;

-- Verify the migration
SELECT
  id,
  name,
  email,
  role,
  "emailVerified",
  "createdAt"
FROM "user"
WHERE "role" = 'admin' OR email = 'david@agilecommercegroup.com';