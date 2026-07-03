import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation';
import { defineField, defineType } from 'sanity'

const blockContent = [
  { type: 'block', marks: {
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
              title: 'Chọn kiểu canh lề',
              options: {
                list: [
                  { title: 'Trái', value: 'left' },
                  { title: 'Giữa', value: 'center' },
                  { title: 'Phải', value: 'right' },
                  { title: 'Đều 2 bên', value: 'justify' }
                ],
                layout: 'radio'
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
      }
    ]
  },
  { type: 'youtube' }
];

export const projectType = defineType({
  name: 'project',
  title: 'Dự Án',
  type: 'document',
  fieldsets: [
    { name: 'basicInfo', title: 'Thông Tin Cơ Bản', options: { columns: 2 } },
    { name: 'landingPageGroup', title: 'Tùy Chỉnh Landing Page', options: { collapsible: true, collapsed: true } },
    { name: 'mediaGroup', title: 'Hình Ảnh Bìa & Thư Viện', options: { collapsible: true, collapsed: true } },
    { name: 'contentGroup', title: 'Nội Dung Tổng Quan', options: { collapsible: true, collapsed: true } },
    { name: 'featuresGroup', title: 'Tiện Ích', options: { collapsible: true, collapsed: true } },
    { name: 'locationGroup', title: 'Vị Trí & Bản Đồ', options: { collapsible: true, collapsed: true } },
    { name: 'pricingGroup', title: 'Bảng Giá & Thanh Toán', options: { collapsible: true, collapsed: true } },
    { name: 'legalGroup', title: 'Pháp Lý', options: { collapsible: true, collapsed: true } },
    { name: 'floorPlanGroup', title: 'Mặt Bằng', options: { collapsible: true, collapsed: true } },
    { name: 'designGroup', title: 'Thiết Kế', options: { collapsible: true, collapsed: true } },
    { name: 'showroomGroup', title: 'Nhà Mẫu', options: { collapsible: true, collapsed: true } },
    { name: 'progressGroup', title: 'Tiến Độ & Tour 360', options: { collapsible: true, collapsed: true } },
    { name: 'qaGroup', title: 'Hỏi Đáp (Q&A)', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tên Dự Án',
      type: 'string',
      validation: (rule) => rule.required(),
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'slug',
      title: 'Đường Dẫn (Slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'projectLogo',
      title: 'Logo Dự Án (Nền trong suốt)',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'category',
      title: 'Phân Loại',
      type: 'string',
      options: {
        list: ['Biệt thự', 'Nhà phố', 'Căn hộ', 'Đất nền'],
      },
      validation: (rule) => rule.required(),
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'price',
      title: 'Mức Giá Chính Thức',
      type: 'string',
      description: 'Ví dụ: 4 tỷ - 21 tỷ',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'productCount',
      title: 'Tổng Số Sản Phẩm',
      type: 'string',
      description: 'Ví dụ: 2000 căn',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'viewCount',
      title: 'Lượt Xem',
      type: 'number',
      description: 'Lượt xem ảo ban đầu',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'startDate',
      title: 'Ngày Khởi Công',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'progressPercentage',
      title: 'Tiến Độ Hiện Tại (%)',
      type: 'number',
      validation: (rule) => rule.min(0).max(100),
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'location',
      title: 'Vị Trí',
      type: 'string',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'developers',
      title: 'Chủ Đầu Tư',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'developer' } }],
      description: 'Có thể chọn 1 hoặc nhiều Chủ đầu tư cho dự án này.',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'consultant',
      title: 'Chuyên Viên Tư Vấn',
      type: 'reference',
      to: { type: 'author' },
      description: 'Chọn chuyên gia tư vấn cho dự án này.',
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'status',
      title: 'Trạng Thái',
      type: 'string',
      options: {
        list: ['Đang mở bán', 'Sắp ra mắt', 'Đã bàn giao'],
      },
      fieldset: 'basicInfo',
    }),
    defineField({
      name: 'imageUrl',
      title: 'Hình Ảnh Bìa',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'mediaGroup',
    }),
    defineField({
      name: 'gallery',
      title: 'Thư Viện Ảnh (Gallery)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Thêm nhiều hình ảnh để tạo Slider trình chiếu.',
      fieldset: 'mediaGroup',
    }),
    defineField({
      name: 'description',
      title: 'Nội Dung Tổng Quan Dự Án',
      type: 'array',
      of: blockContent,
      fieldset: 'contentGroup',
    }),
    defineField({
      name: 'features',
      title: 'Tiện Ích Ngắn (Dạng List)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Nhập các gạch đầu dòng ngắn (Tuỳ chọn)',
      fieldset: 'featuresGroup',
    }),
    defineField({
      name: 'featuresContent',
      title: 'Bài Viết Tiện Ích (Text/Hình/Video)',
      type: 'array',
      of: blockContent,
      description: 'Mô tả chi tiết tiện ích, chèn hình ảnh...',
      fieldset: 'featuresGroup',
    }),
    defineField({
      name: 'mapHtml',
      title: 'Bản Đồ Vị Trí (Google Maps Iframe)',
      type: 'text',
      rows: 3,
      description: 'Dán mã nhúng <iframe> lấy từ Google Maps vào đây.',
      fieldset: 'locationGroup',
    }),
    defineField({
      name: 'locationContent',
      title: 'Bài Viết Vị Trí (Text/Hình/Video)',
      type: 'array',
      description: 'Nhập mô tả, chèn hình ảnh, hoặc nhúng video YouTube',
      of: blockContent,
      fieldset: 'locationGroup',
    }),
    defineField({
      name: 'pricingContent',
      title: 'Bảng Giá & Chính Sách Thanh Toán',
      type: 'array',
      of: blockContent,
      fieldset: 'pricingGroup',
    }),
    defineField({
      name: 'legalDocuments',
      title: 'Tài Liệu Pháp Lý (PDF)',
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
      ],
      fieldset: 'legalGroup',
    }),
    defineField({
      name: 'legalContent',
      title: 'Bài Viết Pháp Lý (Editor)',
      type: 'array',
      of: blockContent,
      fieldset: 'legalGroup',
    }),
    defineField({
      name: 'floorPlans',
      title: 'Hình Ảnh Mặt Bằng',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      fieldset: 'floorPlanGroup',
    }),
    defineField({
      name: 'floorPlanContent',
      title: 'Bài Viết Mặt Bằng (Editor)',
      type: 'array',
      of: blockContent,
      fieldset: 'floorPlanGroup',
    }),
    defineField({
      name: 'designContent',
      title: 'Nội Dung Thiết Kế (Editor)',
      type: 'array',
      of: blockContent,
      fieldset: 'designGroup',
    }),
    defineField({
      name: 'showroomContent',
      title: 'Nội Dung Nhà Mẫu (Editor)',
      type: 'array',
      of: blockContent,
      fieldset: 'showroomGroup',
    }),
    defineField({
      name: 'tour360Url',
      title: 'Link Tour 360°',
      type: 'url',
      fieldset: 'progressGroup',
    }),
    defineField({
      name: 'progressContent',
      title: 'Bài Viết Tiến Độ Xây Dựng',
      type: 'array',
      of: blockContent,
      fieldset: 'progressGroup',
    }),
    defineField({
      name: 'customLandingPage',
      title: 'Mã HTML Custom Landing Page (Nâng cao)',
      description: 'Nếu bạn có mã HTML của một Landing Page thiết kế riêng, hãy dán toàn bộ vào đây. Hệ thống sẽ hiển thị nó thay cho giao diện cơ bản.',
      type: 'text',
      fieldset: 'landingPageGroup',
    }),
    defineField({
      name: 'hideLayoutComponents',
      title: 'Ẩn Menu & Chân trang?',
      description: 'Đánh dấu tích nếu Landing Page của bạn đã có Menu/Chân trang riêng và bạn muốn ẩn thanh Menu/Chân trang mặc định của website đi.',
      type: 'boolean',
      initialValue: false,
      fieldset: 'landingPageGroup',
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
    defineField({
      name: 'faqs',
      title: 'Danh sách Câu hỏi & Trả lời',
      type: 'array',
      fieldset: 'qaGroup',
      of: [{
        type: 'object',
        fields: [
          { name: 'question', type: 'string', title: 'Câu hỏi' },
          { name: 'answer', type: 'text', title: 'Câu trả lời (Dùng xuống dòng bình thường)', rows: 4 }
        ],
        preview: {
          select: { title: 'question', subtitle: 'answer' }
        }
      }]
    }),
  ],
})
