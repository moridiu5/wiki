export const initialData = {
  sections: [
    {
      id: '1',
      title: 'Geography',
      pages: [
        {
          id: 'martinique',
          title: 'Martinique',
          content: `Martinique is an island in the Lesser Antilles in the eastern Caribbean Sea, with a land area of 1,128 square kilometres (436 sq mi) and a population of 386,486 inhabitants (as of Jan. 2013).[1] Like Guadeloupe, it is an overseas region of France, consisting of a single overseas department. One of the Windward Islands, it is directly north of Saint Lucia, northwest of Barbados, and south of Dominica.

## History

### European contact

The island was occupied first by Arawaks, then by Caribs. The Carib people had migrated from the mainland to the islands about 1200 CE, according to carbon dating of artifacts. They largely displaced, exterminated and assimilated the Taino who were resident on the island in the 1490s. Martinique was charted by Columbus.`,
          metadata: {
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            fields: [
              { key: 'Country', value: 'France' },
              { key: 'Area', value: '1128 km²' },
              { key: 'Density', value: '340 hab/km²' },
              { key: 'Capital', value: 'Fort-de-France' },
            ]
          }
        }
      ]
    },
    {
      id: '2',
      title: 'History',
      pages: []
    }
  ]
};
