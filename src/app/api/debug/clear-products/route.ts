import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { products, searchResults } from '@/server/db/schema';

export async function POST(request: Request) {
  try {
    // Check for admin secret to prevent unauthorized access
    const { secret } = await request.json();
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all search results first (due to FK)
    const deletedResults = await db.delete(searchResults).returning();
    
    // Delete all products
    const deletedProducts = await db.delete(products).returning();

    return NextResponse.json({
      success: true,
      deleted: {
        searchResults: deletedResults.length,
        products: deletedProducts.length,
      },
      message: 'All products and search results cleared successfully',
    });
  } catch (error) {
    console.error('[Debug] Clear products error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'POST to this endpoint with {"secret": "ADMIN_SECRET"} to clear all products',
    warning: 'This will delete all products and search results from the database',
  });
}
