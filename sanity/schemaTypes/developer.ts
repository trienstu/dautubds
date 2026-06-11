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
  ],
})
