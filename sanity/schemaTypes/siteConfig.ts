import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteConfig',
  title: 'Cấu Hình Web',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Tên Công Ty (Tên Website)',
      type: 'string',
      initialValue: 'TRIEN BDS',
    }),
    defineField({
      name: 'logo',
      title: 'Logo Website',
      type: 'image',
      options: { hotspot: true },
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
      name: 'address',
      title: 'Địa Chỉ Văn Phòng',
      type: 'string',
    }),
    defineField({
      name: 'footerAbout',
      title: 'Giới Thiệu Ngắn (Footer)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Link Facebook',
      type: 'url',
    }),
    defineField({
      name: 'zaloUrl',
      title: 'Link Zalo',
      type: 'url',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Link YouTube',
      type: 'url',
    }),
    defineField({
      name: 'footerProjects',
      title: 'Menu Cột Dự Án (Footer)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Tên hiển thị', type: 'string' },
            { name: 'url', title: 'Đường dẫn (URL)', type: 'string' }
          ]
        }
      ]
    }),
    defineField({
      name: 'footerRegions',
      title: 'Menu Cột Khu Vực (Footer)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Tên hiển thị', type: 'string' },
            { name: 'url', title: 'Đường dẫn (URL)', type: 'string' }
          ]
        }
      ]
    }),
    defineField({
      name: 'footerNews',
      title: 'Menu Cột Tin Tức (Footer)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Tên hiển thị', type: 'string' },
            { name: 'url', title: 'Đường dẫn (URL)', type: 'string' }
          ]
        }
      ]
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Cấu Hình Website',
        subtitle: 'Lưu ý: Chỉ nên tạo và chỉnh sửa MỘT bản ghi duy nhất tại đây.',
      }
    }
  }
})
