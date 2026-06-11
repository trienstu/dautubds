import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Tác Giả',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên Tác Giả',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (Slug)',
      type: 'slug',
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'image',
      title: 'Hình Đại Diện (Avatar)',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Giới Thiệu Ngắn (Bio)',
      type: 'text',
      description: 'Giới thiệu về chuyên môn, kinh nghiệm của tác giả.',
    }),
    defineField({
      name: 'isVerified',
      title: 'Tài Khoản Xác Thực (Tick Xanh)',
      type: 'boolean',
      initialValue: false,
      description: 'Bật lên để hiển thị Dấu Tick Xanh uy tín bên cạnh tên tác giả.',
    }),
    defineField({
      name: 'phone',
      title: 'Số Điện Thoại (Hotline)',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Địa Chỉ Email',
      type: 'string',
    }),
    defineField({
      name: 'zaloUrl',
      title: 'Link Zalo',
      type: 'url',
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Link Facebook',
      type: 'url',
    }),
  ],
})
