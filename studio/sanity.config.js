import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'

const categories = [
  { title: 'Paintings', value: 'paintings' },
  { title: 'Ceramics', value: 'ceramics' },
  { title: 'Prints', value: 'prints' },
  { title: 'On Paper', value: 'on-paper' },
]

export default defineConfig({
  name: 'default',
  title: 'Scott Garrett',

  projectId: 'k5wutx18',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Shop')
          .items([
            // All products (non-orderable overview)
            S.listItem()
              .title('All Products')
              .child(
                S.documentList()
                  .title('All Products')
                  .filter('_type == "product"')
              ),
            S.divider(),
            // One draggable section per category
            ...categories.map(cat =>
              orderableDocumentListDeskItem({
                type: 'product',
                id: `orderable-product-${cat.value}`,
                title: cat.title,
                filter: '_type == "product" && category == $cat',
                params: { cat: cat.value },
                S,
                context
              })
            )
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
