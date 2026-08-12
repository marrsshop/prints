import {orderRankField} from '@sanity/orderable-document-list'

export const product = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    orderRankField({ type: 'product' }),
    {
      name: 'id',
      title: 'ID',
      type: 'slug',
      description: 'Unique ID for this product (no spaces, use hyphens). e.g. "my-painting"',
      options: { source: 'name', maxLength: 96 },
      validation: Rule => Rule.required()
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Paintings', value: 'paintings' },
          { title: 'Ceramics', value: 'ceramics' },
          { title: 'On Paper', value: 'on-paper' },
          { title: 'Prints', value: 'prints' },
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      title: 'Price (£)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'available',
      title: 'Available',
      type: 'boolean',
      description: 'Uncheck to mark as Sold Out',
      initialValue: true
    },
    {
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      description: 'Hide from the shop without deleting (e.g. while at a gallery show)',
      initialValue: false
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'First image appears in the shop grid. Add more for the detail carousel.',
      of: [
        {
          type: 'image',
          options: { hotspot: true }
        }
      ]
    },
    {
      name: 'sizeVariants',
      title: 'Size Variants (Prints only)',
      description: 'Tick the sizes available for this print and set a price for each. Leave all unticked for single-price products.',
      type: 'object',
      options: { collapsible: false },
      fields: [
        { name: 'a4Enabled', title: 'A4 (21cm × 29.7cm)', type: 'boolean', initialValue: false },
        { name: 'a4Price', title: 'A4 Price (£)', type: 'number' },
        { name: 'a3Enabled', title: 'A3 (29.7cm × 42cm)', type: 'boolean', initialValue: false },
        { name: 'a3Price', title: 'A3 Price (£)', type: 'number' },
        { name: 'a2Enabled', title: 'A2 (42cm × 59.4cm)', type: 'boolean', initialValue: false },
        { name: 'a2Price', title: 'A2 Price (£)', type: 'number' },
        { name: 'a1Enabled', title: 'A1 (59.4cm × 84.1cm)', type: 'boolean', initialValue: false },
        { name: 'a1Price', title: 'A1 Price (£)', type: 'number' },
      ]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      images: 'images'
    },
    prepare({ title, subtitle, images }) {
      return {
        title,
        subtitle,
        media: images && images[0]
      }
    }
  },
  orderings: [
    {
      title: 'Category',
      name: 'categoryAsc',
      by: [{ field: 'category', direction: 'asc' }, { field: 'name', direction: 'asc' }]
    }
  ]
}
