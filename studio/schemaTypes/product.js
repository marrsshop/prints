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
          { title: 'Ceramics', value: 'ceramics' },
          { title: 'Paintings', value: 'paintings' },
          { title: 'Collages', value: 'collages' },
          { title: 'Prints', value: 'prints' },
          { title: 'Drawings', value: 'drawings' },
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
      name: 'variants',
      title: 'Size Variants (Prints only)',
      type: 'array',
      description: 'For prints with multiple sizes and prices. Leave empty for single-price products.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', title: 'Size', type: 'string' },
            { name: 'price', title: 'Price (£)', type: 'number' }
          ],
          preview: {
            select: { title: 'size', subtitle: 'price' },
            prepare({ title, subtitle }) {
              return { title, subtitle: subtitle ? `£${subtitle}` : '' }
            }
          }
        }
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
