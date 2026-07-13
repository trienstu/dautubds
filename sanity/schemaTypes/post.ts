import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation';
import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Tin Tức',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu Đề (Title)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isMarketAnalysis',
      title: 'Đây là bài Phân tích thị trường?',
      description: 'Đánh dấu tích nếu bạn muốn bài này xuất hiện ở khu vực "Phân tích thị trường" trên trang chủ thay vì "Tin tức mới nhất".',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (Slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Nguồn bài viết (Dành cho Auto-Crawl)',
      description: 'Lưu trữ link bài viết gốc để hệ thống tự động nhận diện và không cào lại bài đã có.',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'excerpt',
      title: 'Tóm Tắt',
      type: 'text',
    }),
    defineField({
      name: 'content',
      title: 'Nội Dung Chi Tiết',
      type: 'array',
      of: [
        { 
          type: 'block',
          marks: {
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
                    title: 'Vị trí',
                    options: {
                      list: [
                        { title: 'Trái', value: 'left' },
                        { title: 'Giữa', value: 'center' },
                        { title: 'Phải', value: 'right' },
                        { title: 'Đều', value: 'justify' }
                      ]
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
        { type: 'table' },
        { 
          type: 'image',
          title: 'Chèn Hình Ảnh',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Chú thích ảnh (Alt text)',
              description: 'Quan trọng cho SEO và người khiếm thị',
            }
          ]
        },
        {
          type: 'imageGrid'
        },
        {
          type: 'imageSlider'
        }
      ],
    }),
    defineField({
      name: 'date',
      title: 'Ngày Đăng',
      type: 'datetime',
    }),
    defineField({
      name: 'imageUrl',
      title: 'Hình Ảnh Bìa',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'viewCount',
      title: 'Lượt Xem Ban Đầu',
      type: 'number',
      description: 'Nhập số lượt xem ảo ban đầu cho bài viết.',
      initialValue: 0,
    }),
    defineField({
      name: 'author',
      title: 'Tác Giả',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Bài Viết Liên Quan',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'post' } }],
      description: 'Chọn tối đa 3 bài viết liên quan để hiển thị ở cuối bài.',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Dự Án Liên Quan',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'project' } }],
      description: 'Chọn các dự án liên quan đến bài viết này để hiển thị.',
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
