'use client';

export const storage = {
  getData: async () => {
    try {
      const response = await fetch('/api/wiki');
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  },

  setData: async (data) => {
    try {
      const response = await fetch('/api/wiki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save data');
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  clear: async () => {
    try {
      await storage.setData({ sections: [] });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};
