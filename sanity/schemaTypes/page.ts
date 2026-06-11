import { defineField, defineType } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Trang (Pages)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu Đề Trang',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Nội Dung',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
  ],
})
