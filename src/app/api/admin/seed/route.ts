import { NextResponse } from 'next/server';
import { seedData } from '@/lib/admin-db';

export async function POST() {
  try {
    await seedData();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}