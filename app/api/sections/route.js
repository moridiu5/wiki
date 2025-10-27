import { NextResponse } from 'next/server';
import { getAllSections, createSection } from '@/lib/db/sections';

export async function GET() {
  try {
    const sections = await getAllSections();
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const section = await createSection(data);
    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
