import prisma from '@/lib/prisma';

export async function getAllPages() {
  return await prisma.page.findMany({
    include: {
      section: true,
      metadataFields: true
    }
  });
}

export async function getPageById(id) {
  return await prisma.page.findUnique({
    where: { id: parseInt(id) },
    include: {
      section: true,
      metadataFields: true
    }
  });
}

export async function createPage(data) {
  // Get max order for pages in this section
  const maxOrder = await prisma.page.findFirst({
    where: { sectionId: parseInt(data.sectionId) },
    orderBy: { order: 'desc' },
    select: { order: true }
  });

  return await prisma.page.create({
    data: {
      title: data.title,
      content: data.content,
      sectionId: parseInt(data.sectionId),
      order: (maxOrder?.order || 0) + 1,
      metadataImage: data.metadataImage || null,
      metadataFields: {
        create: data.metadataFields || []
      }
    },
    include: {
      metadataFields: true
    }
  });
}

export async function updatePage(id, data) {
  // Delete existing metadata fields and recreate them
  await prisma.metadataField.deleteMany({
    where: { pageId: parseInt(id) }
  });

  return await prisma.page.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      content: data.content,
      sectionId: parseInt(data.sectionId),
      metadataImage: data.metadataImage || null,
      metadataFields: {
        create: data.metadataFields || []
      }
    },
    include: {
      metadataFields: true
    }
  });
}

export async function deletePage(id) {
  return await prisma.page.delete({
    where: { id: parseInt(id) }
  });
}
