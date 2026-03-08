import { NextResponse } from 'next/server';
import { runMigrations } from '@/server/db/migrate';

let migrationRan = false;

export async function GET() {
  if (migrationRan) {
    return NextResponse.json({ status: 'already_ran' });
  }
  
  const success = await runMigrations();
  migrationRan = true;
  
  return NextResponse.json({ 
    status: success ? 'success' : 'error',
    message: success ? 'Migrations completed' : 'Migration failed'
  });
}
