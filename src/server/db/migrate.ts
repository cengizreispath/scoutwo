import { sql } from 'drizzle-orm';
import { db } from './index';

export async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Brands table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        website_url TEXT NOT NULL,
        logo_url TEXT,
        is_active BOOLEAN DEFAULT true,
        scraper_config JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Products table (before searches due to FK)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        brand_id UUID REFERENCES brands(id),
        external_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'TRY',
        image_url TEXT,
        product_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Searches table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS searches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        query TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Search brands junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS search_brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
        brand_id UUID REFERENCES brands(id),
        last_scraped_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Search results table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS search_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        search_brand_id UUID REFERENCES search_brands(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        relevance_score REAL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Favorites table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, product_id)
      )
    `);

    // Seed brands
    await db.execute(sql`
      INSERT INTO brands (name, slug, website_url) VALUES
      ('Zara', 'zara', 'https://www.zara.com/tr/'),
      ('H&M', 'hm', 'https://www2.hm.com/tr_tr/'),
      ('Mango', 'mango', 'https://shop.mango.com/tr/'),
      ('Massimo Dutti', 'massimo-dutti', 'https://www.massimodutti.com/tr/'),
      ('Koton', 'koton', 'https://www.koton.com/'),
      ('LC Waikiki', 'lcw', 'https://www.lcwaikiki.com/tr-TR/TR/'),
      ('Beymen', 'beymen', 'https://www.beymen.com/'),
      ('Network', 'network', 'https://www.network.com.tr/')
      ON CONFLICT (slug) DO NOTHING
    `);

    console.log('Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
