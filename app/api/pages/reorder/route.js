import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { sectionId, pageOrders } = await request.json();

    // Update each page's order within the section
    const updatePromises = pageOrders.map(({ id, order }) =>
      prisma.page.update({
        where: { id: parseInt(id) },
        data: { order }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering pages:', error);
    return NextResponse.json(
      { error: 'Failed to reorder pages' },
      { status: 500 }
    );
  }
}
