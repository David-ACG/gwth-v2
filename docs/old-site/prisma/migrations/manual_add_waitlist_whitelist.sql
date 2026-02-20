-- Create waitlist table
CREATE TABLE IF NOT EXISTS "waitlist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- Create whitelist table
CREATE TABLE IF NOT EXISTS "whitelist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "reason" TEXT,
    "addedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "firstAccessAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whitelist_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");
CREATE UNIQUE INDEX "whitelist_email_key" ON "whitelist"("email");

-- Create indexes for performance
CREATE INDEX "waitlist_email_idx" ON "waitlist"("email");
CREATE INDEX "waitlist_createdAt_idx" ON "waitlist"("createdAt");
CREATE INDEX "whitelist_email_idx" ON "whitelist"("email");
CREATE INDEX "whitelist_isActive_idx" ON "whitelist"("isActive");

-- Add initial whitelist entry for david@agilecommercegroup.com
INSERT INTO "whitelist" ("email", "name", "reason", "isActive")
VALUES ('david@agilecommercegroup.com', 'David', 'Site owner', true)
ON CONFLICT (email) DO NOTHING;