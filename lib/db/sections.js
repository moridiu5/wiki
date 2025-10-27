import prisma from '@/lib/prisma';

export async function getAllSections() {
  return await prisma.section.findMany({
    include: {
      pages: {
        include: {
          metadataFields: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  });
}

export async function getSectionById(id) {
  return await prisma.section.findUnique({
    where: { id: parseInt(id) },
    include: {
      pages: {
        include: {
          metadataFields: true
        }
      }
    }
  });
}

export async function createSection(data) {
  const maxOrder = await prisma.section.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true }
  });

  return await prisma.section.create({
    data: {
      title: data.title,
      order: (maxOrder?.order || 0) + 1
    }
  });
}

export async function updateSection(id, data) {
  return await prisma.section.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      ...(data.order !== undefined && { order: data.order })
    }
  });
}

export async function deleteSection(id) {
  return await prisma.section.delete({
    where: { id: parseInt(id) }
  });
}
