import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const categories = [
  { title: 'Ceramics', value: 'ceramics' },
  { title: 'Paintings', value: 'paintings' },
  { title: 'Collages', value: 'collages' },
  { title: 'Prints', value: 'prints' },
  { title: 'Drawings', value: 'drawings' },
]

export default defineConfig({
  name: 'default',
  title: 'Scott Garrett',

  projectId: 'k5wutx18',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Shop')
          .items([
            // All products
            S.listItem()
              .title('All Products')
              .child(
                S.documentList()
                  .title('All Products')
                  .filter('_type == "product"')
                  .defaultOrdering([{ field: 'category', direction: 'asc' }])
              ),
            S.divider(),
            // One section per category
            ...categories.map(cat =>
              S.listItem()
                .title(cat.title)
                .child(
                  S.documentList()
                    .title(cat.title)
                    .filter('_type == "product" && category == $cat')
                    .params({ cat: cat.value })
                )
            )
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
