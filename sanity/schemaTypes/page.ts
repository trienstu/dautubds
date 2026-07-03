import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation'
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
      of: [{ type: 'block', marks: {
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
          }, { type: 'image' }, { type: 'youtube' }],
    }),
  ],
})
