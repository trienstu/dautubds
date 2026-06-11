import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Sự Kiện',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên Sự Kiện',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Ngày Tổ Chức',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Địa Điểm',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Hình Ảnh Sự Kiện',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
  ],
})
