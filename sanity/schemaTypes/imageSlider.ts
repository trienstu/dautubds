import { defineType, defineField } from 'sanity'

export const imageSlider = defineType({
  name: 'imageSlider',
  type: 'object',
  title: 'Slider Hình Ảnh',
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      title: 'Danh sách Hình Ảnh',
      description: 'Chọn nhiều hình ảnh để tạo Slider trình chiếu.',
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
      validation: Rule => Rule.required().min(2).error('Bạn phải chọn ít nhất 2 hình ảnh để tạo slider.')
    })
  ],
  preview: {
    select: {
      images: 'images'
    },
    prepare({ images }) {
      return {
        title: 'Slider Hình Ảnh',
        subtitle: images ? `Đã chọn ${images.length} hình ảnh` : 'Chưa có hình ảnh'
      }
    }
  }
})
