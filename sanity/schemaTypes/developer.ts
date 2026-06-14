import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'developer',
  title: 'Chủ Đầu Tư',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên Chủ Đầu Tư',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Thứ tự hiển thị (Tùy chọn)',
      type: 'number',
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (Slug)',
      type: 'slug',
      options: { source: 'name' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Bài Viết Giới Thiệu',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'youtube' }
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Cấu Hình SEO',
      type: 'seo',
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],
})
