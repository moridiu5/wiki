// API-based storage layer that replaces the file-based storage

// Transform database format to frontend format
function transformSectionsFromDB(dbSections) {
  return dbSections.map(section => ({
    id: section.id.toString(),
    title: section.title,
    pages: section.pages.map(page => ({
      id: page.id.toString(),
      title: page.title,
      content: page.content,
      metadata: {
        image: page.metadataImage || '',
        fields: page.metadataFields.map(field => ({
          key: field.key,
          value: field.value
        }))
      }
    }))
  }));
}

// Transform frontend format to database format
function transformPageToDB(page, sectionId) {
  return {
    title: page.title,
    content: page.content,
    sectionId: parseInt(sectionId),
    metadataImage: page.metadata?.image || null,
    metadataFields: page.metadata?.fields || []
  };
}

export const apiStorage = {
  async getData() {
    try {
      const response = await fetch('/api/sections');
      if (!response.ok) throw new Error('Failed to fetch data');
      const { sections } = await response.json();
      return { sections: transformSectionsFromDB(sections) };
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },

  async setData(data) {
    // This method is not used with API-based storage
    // Data is saved via individual API calls
    console.log('setData called but not implemented for API storage');
  },

  async createSection(title) {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Failed to create section');
      const { section } = await response.json();
      return section;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },

  async updateSection(id, title) {
    try {
      const response = await fetch(`/api/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Failed to update section');
      const { section } = await response.json();
      return section;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  },

  async deleteSection(id) {
    try {
      const response = await fetch(`/api/sections/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete section');
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  async createPage(page, sectionId) {
    try {
      const dbPage = transformPageToDB(page, sectionId);
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPage)
      });
      if (!response.ok) throw new Error('Failed to create page');
      const { page: createdPage } = await response.json();
      return createdPage;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  },

  async updatePage(pageId, page, sectionId) {
    try {
      const dbPage = transformPageToDB(page, sectionId);
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPage)
      });
      if (!response.ok) throw new Error('Failed to update page');
      const { page: updatedPage } = await response.json();
      return updatedPage;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  },

  async deletePage(pageId) {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete page');
      return true;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }
};
