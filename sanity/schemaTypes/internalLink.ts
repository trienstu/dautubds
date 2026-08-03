import { defineType, defineField } from 'sanity'

export const internalLink = defineType({
  name: 'internalLink',
  title: 'Internal Links',
  type: 'document',
  fields: [
    defineField({
      name: 'keyword',
      title: 'Từ khoá (Keyword)',
      type: 'string',
      description: 'Từ khoá chính xác cần được gắn link (ví dụ: Zalo Marketing)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Đường dẫn đích (ví dụ: https://www.dautubds.io.vn/cong-cu/zalo-marketing hoặc /cong-cu/zalo-marketing). Hỗ trợ cả link tuyệt đối và tương đối bằng cấu hình Custom validation.',
      validation: (Rule) => Rule.uri({
        allowRelative: true,
        scheme: ['http', 'https', 'mailto', 'tel']
      }).required(),
    }),
  ],
  preview: {
    select: {
      title: 'keyword',
      subtitle: 'url',
    },
  },
})
