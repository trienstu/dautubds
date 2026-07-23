import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'province',
  title: 'Khu vực (Tỉnh/Thành)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên Tỉnh/Thành phố',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường dẫn (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'Dùng để tạo link tự động. Ví dụ: ho-chi-minh',
    }),
    defineField({
      name: 'order',
      title: 'Thứ tự ưu tiên',
      type: 'number',
      description: 'Số càng nhỏ càng xếp trên (ví dụ: 1 cho Hồ Chí Minh, 2 cho Hà Nội).',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
});
