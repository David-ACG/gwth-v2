const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupBetterAuthTables() {
  try {
    console.log('Setting up Better Auth database tables...');
    
    // Create user table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        image TEXT,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create account table for OAuth providers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider_id, account_id)
      );
    `);
    
    // Create verification table for email verification and password reset
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add password field to user table if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='user' AND column_name='password'
        ) THEN
          ALTER TABLE "user" ADD COLUMN password TEXT;
        END IF;
      END $$;
    `);
    
    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier)`);
    
    console.log('✅ Better Auth tables created successfully!');
    
  } catch (error) {
    console.error('Error setting up Better Auth tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupBetterAuthTables();