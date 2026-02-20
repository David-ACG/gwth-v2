const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestUser() {
  try {
    const email = 'david@agilecommercegroup.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      // Update password for existing user
      await pool.query(
        'UPDATE "user" SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
      console.log(`✅ Updated password for user: ${email}`);
    } else {
      // Create new user
      const userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await pool.query(
        'INSERT INTO "user" (id, email, name, password, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, email, 'David Admin', hashedPassword, true, new Date(), new Date()]
      );
      console.log(`✅ Created new user: ${email}`);
    }
    
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\n✨ You can now login at https://gwth.ai/login`);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();