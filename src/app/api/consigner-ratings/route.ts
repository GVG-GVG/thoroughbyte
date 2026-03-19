import { NextResponse } from 'next/server';
import consignerData from '@/lib/consigner-data-2024.json';

export async function GET() {
  return NextResponse.json(consignerData);
}
