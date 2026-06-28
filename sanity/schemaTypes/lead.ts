import { defineField, defineType } from 'sanity';

export const leadType = defineType({
  name: 'lead',
  title: 'Khách Hàng (Leads)',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      title: 'Số điện thoại',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Tên khách (nếu có)',
      type: 'string',
    }),
    defineField({
      name: 'projectOfInterest',
      title: 'Dự án quan tâm',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Tin nhắn/Ghi chú',
      type: 'text',
    }),
    defineField({
      name: 'source',
      title: 'Nguồn',
      type: 'string',
      initialValue: 'Chatbot AI',
    }),
  ],
  preview: {
    select: {
      title: 'phone',
      subtitle: 'projectOfInterest',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Khách chưa có SĐT',
        subtitle: subtitle ? `Quan tâm: ${subtitle}` : 'Từ Chatbot',
      };
    },
  },
});
