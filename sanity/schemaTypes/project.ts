import { defineField, defineType } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Dự Án',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên Dự Án',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (Slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Phân Loại',
      type: 'string',
      options: {
        list: ['Biệt thự', 'Nhà phố', 'Căn hộ', 'Đất nền'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Mức Giá Chính Thức',
      type: 'string',
      description: 'Ví dụ: 4 tỷ - 21 tỷ',
    }),
    defineField({
      name: 'productCount',
      title: 'Tổng Số Sản Phẩm',
      type: 'string',
      description: 'Ví dụ: 2000 căn',
    }),
    defineField({
      name: 'viewCount',
      title: 'Lượt Xem',
      type: 'number',
      description: 'Lượt xem ảo ban đầu',
    }),
    defineField({
      name: 'startDate',
      title: 'Ngày Khởi Công',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
    }),
    defineField({
      name: 'progressPercentage',
      title: 'Tiến Độ Hiện Tại (%)',
      type: 'number',
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'location',
      title: 'Vị Trí',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Nội Dung Chi Tiết Dự Án',
      type: 'array',
      of: [
        { type: 'block' },
        { 
          type: 'image',
          title: 'Chèn Hình Ảnh',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Chú thích ảnh (Alt text)',
            }
          ]
        }
      ],
    }),
    defineField({
      name: 'customLandingPage',
      title: 'Mã HTML Custom Landing Page (Nâng cao)',
      description: 'Nếu bạn có mã HTML của một Landing Page thiết kế riêng, hãy dán toàn bộ vào đây. Hệ thống sẽ hiển thị nó thay cho giao diện cơ bản.',
      type: 'text',
    }),
    defineField({
      name: 'hideLayoutComponents',
      title: 'Ẩn Menu & Chân trang?',
      description: 'Đánh dấu tích nếu Landing Page của bạn đã có Menu/Chân trang riêng và bạn muốn ẩn thanh Menu/Chân trang mặc định của website đi.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'imageUrl',
      title: 'Hình Ảnh Bìa',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Thư Viện Ảnh (Gallery)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Thêm nhiều hình ảnh để tạo Slider trình chiếu.',
    }),
    defineField({
      name: 'developer',
      title: 'Chủ Đầu Tư',
      type: 'reference',
      to: { type: 'developer' },
    }),
    defineField({
      name: 'consultant',
      title: 'Chuyên Viên Tư Vấn',
      type: 'reference',
      to: { type: 'author' },
      description: 'Chọn chuyên gia tư vấn cho dự án này.',
    }),
    defineField({
      name: 'features',
      title: 'Tiện Ích Nổi Bật',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'mapHtml',
      title: 'Bản Đồ Vị Trí (Google Maps Iframe)',
      type: 'text',
      description: 'Dán mã nhúng <iframe> lấy từ Google Maps vào đây. (Hiển thị phía trên)',
    }),
    defineField({
      name: 'locationContent',
      title: 'Bài Viết Vị Trí (Text/Hình/Video)',
      type: 'array',
      description: 'Nhập mô tả, chèn hình ảnh, hoặc nhúng video YouTube (Hiển thị bên dưới Bản đồ)',
      of: [
        { type: 'block' }, 
        { type: 'image', options: { hotspot: true } },
        { type: 'youtube' }
      ],
    }),
    defineField({
      name: 'pricingContent',
      title: 'Bảng Giá & Chính Sách Thanh Toán',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'legalDocuments',
      title: 'Tài Liệu Pháp Lý',
      type: 'array',
      of: [
        {
          type: 'file',
          options: { accept: '.pdf,.doc,.docx' },
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Tên tài liệu hiển thị',
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'floorPlans',
      title: 'Hình Ảnh Mặt Bằng',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'tour360Url',
      title: 'Link Tour 360°',
      type: 'url',
    }),
    defineField({
      name: 'progressContent',
      title: 'Tiến Độ Xây Dựng',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'status',
      title: 'Trạng Thái',
      type: 'string',
      options: {
        list: ['Đang mở bán', 'Sắp ra mắt', 'Đã bàn giao'],
      },
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
