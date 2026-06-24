import { defineType, defineField } from 'sanity'

export const imageGrid = defineType({
  name: 'imageGrid',
  type: 'object',
  title: 'Lưới 2 Hình Ảnh (1 Hàng)',
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      title: 'Danh sách 2 Hình Ảnh',
      description: 'Chọn 2 hình ảnh để hiển thị song song trên cùng 1 hàng.',
      of: [{ 
        type: 'image',
        options: { hotspot: true },
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Chú thích ảnh (Alt text)'
          }
        ]
      }],
      validation: Rule => Rule.required().min(2).max(2).error('Bạn phải chọn đúng 2 hình ảnh.')
    })
  ],
  preview: {
    select: {
      images: 'images'
    },
    prepare({ images }) {
      return {
        title: 'Lưới 2 Hình Ảnh (1 Hàng)',
        subtitle: images ? `Đã chọn ${images.length} hình ảnh` : 'Chưa có hình ảnh'
      }
    }
  }
})
