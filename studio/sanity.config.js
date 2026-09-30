import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'
import {ProductDeleteList} from './components/DeletableProductList'

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
            // Draggable list — order here is the order on the site
            orderableDocumentListDeskItem({
              type: 'product',
              title: 'Prints',
              S,
              context
            }),
            S.divider(),
            S.listItem()
              .title('🗑 Delete Prints')
              .child(S.component(ProductDeleteList).id('delete-prints').title('Delete Prints'))
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
