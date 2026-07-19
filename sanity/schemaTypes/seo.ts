import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'Cấu Hình SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Tiêu Đề SEO',
      description: 'Tiêu đề hiển thị trên thanh tab trình duyệt và kết quả tìm kiếm Google (Khuyên dùng: 50-60 ký tự). Có thể chèn: {{thang_nam}}, {{thang}}, {{nam}}, {{ngay}} để hiển thị thời gian tự động.',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Mô Tả SEO (Meta Description)',
      description: 'Đoạn mô tả ngắn gọn nội dung để thu hút người dùng click vào từ Google (Khuyên dùng: 150-160 ký tự). Có thể chèn: {{thang_nam}}, {{thang}}, {{nam}}, {{ngay}} để hiển thị thời gian tự động.',
      type: 'text',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'Từ Khóa SEO (Meta Keywords)',
      description: 'Các từ khóa cách nhau bởi dấu phẩy (VD: can ho cao cap, the prive, bds hang hieu).',
      type: 'string',
    }),
    defineField({
      name: 'seoImage',
      title: 'Hình Ảnh Chia Sẻ (Open Graph Image)',
      description: 'Hình ảnh đại diện sẽ hiển thị khi bạn chia sẻ link này lên Facebook, Zalo, LinkedIn...',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})
