import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteConfig',
  title: 'Cấu Hình Web',
  type: 'document',
  groups: [
    { name: 'general', title: 'Cấu Hình Chung', default: true },
    { name: 'seo', title: 'Cấu Hình SEO Các Trang' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Tên Công Ty (Tên Website)',
      type: 'string',
      initialValue: 'TRIEN BDS',
      group: 'general',
    }),
    defineField({
      name: 'logo',
      title: 'Logo Website',
      type: 'image',
      options: { hotspot: true },
      group: 'general',
    }),
    defineField({
      name: 'phone',
      title: 'Số Điện Thoại (Hotline)',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'email',
      title: 'Địa Chỉ Email',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'address',
      title: 'Địa Chỉ Văn Phòng',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'footerAbout',
      title: 'Giới Thiệu Ngắn (Footer)',
      type: 'text',
      rows: 3,
      group: 'general',
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Link Facebook',
      type: 'url',
      group: 'general',
    }),
    defineField({
      name: 'zaloUrl',
      title: 'Link Zalo',
      type: 'url',
      group: 'general',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Link YouTube',
      type: 'url',
      group: 'general',
    }),
    defineField({
      name: 'footerProjects',
      title: 'Menu Cột Dự Án (Footer)',
      type: 'array',
      group: 'general',
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
      group: 'general',
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
      group: 'general',
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
      name: 'googleAnalyticsId',
      title: 'Mã Google Analytics (ID)',
      type: 'string',
      description: 'Ví dụ: G-XXXXXXXXXX',
      group: 'general',
    }),
    defineField({
      name: 'googleSiteVerification',
      title: 'Mã Google Search Console (Verification)',
      type: 'string',
      description: 'Chỉ nhập đoạn mã ngẫu nhiên bên trong thẻ content="..."',
      group: 'general',
    }),
    // --- SEO Fields ---
    defineField({
      name: 'homeSeo',
      title: 'SEO Trang Chủ (/ )',
      type: 'seo',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'projectsSeo',
      title: 'SEO Trang Danh Sách Dự Án (/du-an)',
      type: 'seo',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'newsSeo',
      title: 'SEO Trang Danh Sách Tin Tức (/tin-tuc)',
      type: 'seo',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'developersSeo',
      title: 'SEO Trang Chủ Đầu Tư (/chu-dau-tu)',
      type: 'seo',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'contactSeo',
      title: 'SEO Trang Liên Hệ (/lien-he)',
      type: 'seo',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
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
