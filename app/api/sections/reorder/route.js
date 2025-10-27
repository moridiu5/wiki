import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { sectionOrders } = await request.json();

    // Update each section's order
    const updatePromises = sectionOrders.map(({ id, order }) =>
      prisma.section.update({
        where: { id: parseInt(id) },
        data: { order }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}
