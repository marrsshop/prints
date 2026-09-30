import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'
import {
  AllProductsDeleteList,
  PaintingsDeleteList,
  CeramicsDeleteList,
  OnPaperDeleteList,
  PrintsDeleteList,
} from './components/DeletableProductList'

const categories = [
  { title: 'Paintings', value: 'paintings' },
  { title: 'Ceramics', value: 'ceramics' },
  { title: 'On Paper', value: 'on-paper' },
  { title: 'Prints', value: 'prints' },
]

export default defineConfig({
  name: 'default',
  title: 'Tim Marrs',

  projectId: 'i4ddie4h',
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
            ),
            S.divider(),
            // Delete products section
            S.listItem()
              .title('🗑 Delete Products')
              .child(
                S.list()
                  .title('Delete Products')
                  .items([
                    S.listItem()
                      .title('All Products')
                      .child(S.component(AllProductsDeleteList).id('delete-all').title('All Products')),
                    ...categories.map(cat => {
                      const components = { paintings: PaintingsDeleteList, ceramics: CeramicsDeleteList, 'on-paper': OnPaperDeleteList, prints: PrintsDeleteList }
                      return S.listItem()
                        .title(cat.title)
                        .child(S.component(components[cat.value]).id(`delete-${cat.value}`).title(cat.title))
                    })
                  ])
              )
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
