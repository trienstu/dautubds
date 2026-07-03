import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation'
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
        { type: 'block', marks: {
            decorators: [
              { title: 'Đậm (Bold)', value: 'strong' },
              { title: 'Nghiêng (Italic)', value: 'em' },
              { title: 'Gạch dưới (Underline)', value: 'underline' },
              { title: 'Gạch ngang (Strike)', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'textAlign',
                type: 'object',
                title: 'Canh lề',
                icon: TextAlignIcon,
                components: {
                  annotation: TextAlignRender
                },
                fields: [
                  {
                    name: 'align',
                    type: 'string',
                    title: 'Chọn kiểu canh lề',
                    options: {
                      list: [
                        { title: 'Trái', value: 'left' },
                        { title: 'Giữa', value: 'center' },
                        { title: 'Phải', value: 'right' },
                        { title: 'Đều 2 bên', value: 'justify' }
                      ],
                      layout: 'radio'
                    }
                  }
                ]
              },
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  }
                ]
              }
            ]
          }
          },
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
