export type ProjectCategory = 'Biệt thự' | 'Nhà phố' | 'Căn hộ' | 'Đất nền';

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  price: string;
  location: string;
  description: string;
  imageUrl: string;
  features: string[];
  status: 'Đang mở bán' | 'Sắp ra mắt' | 'Đã bàn giao';
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Biệt Thự Ven Sông Golden River',
    slug: 'biet-thu-ven-song-golden-river',
    category: 'Biệt thự',
    price: 'Từ 45 Tỷ',
    location: 'Quận 1, TP. Hồ Chí Minh',
    description: 'Khu biệt thự đẳng cấp với không gian sống biệt lập, an ninh 24/7 và tầm nhìn tuyệt đẹp ra sông. Được thiết kế theo phong cách Châu Âu hiện đại với vật liệu hoàn thiện cao cấp nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1613490905146-2bbbb8160408?q=80&w=2000&auto=format&fit=crop',
    features: ['Hồ bơi riêng', 'Sân vườn 500m2', 'Bến du thuyền', 'Phòng Gym'],
    status: 'Đang mở bán',
  },
  {
    id: '2',
    title: 'Nhà Phố Thương Mại Elite Shophouse',
    slug: 'nha-pho-thuong-mai-elite-shophouse',
    category: 'Nhà phố',
    price: 'Từ 15 Tỷ',
    location: 'Quận 7, TP. Hồ Chí Minh',
    description: 'Sự kết hợp hoàn hảo giữa không gian sống sang trọng và cơ hội kinh doanh sinh lời. Nằm trên trục đường chính huyết mạch với mặt tiền rộng.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop',
    features: ['Mặt tiền 8m', 'Có thang máy', 'Vỉa hè rộng 5m', 'Chỗ để xe hơi'],
    status: 'Đang mở bán',
  },
  {
    id: '3',
    title: 'Căn Hộ Hạng Sang Sky Pearl',
    slug: 'can-ho-hang-sang-sky-pearl',
    category: 'Căn hộ',
    price: 'Từ 6 Tỷ',
    location: 'Quận 2, TP. Hồ Chí Minh',
    description: 'Trải nghiệm cuộc sống trên cao với tiện ích 5 sao đẳng cấp quốc tế. Căn hộ được trang bị hệ thống Smart Home hiện đại bậc nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop',
    features: ['Hồ bơi vô cực', 'BBQ trên không', 'Phòng xông hơi', 'Sảnh đón 5 sao'],
    status: 'Sắp ra mắt',
  },
  {
    id: '4',
    title: 'Khu Đất Nền Sinh Thái Green Valley',
    slug: 'khu-dat-nen-sinh-thai-green-valley',
    category: 'Đất nền',
    price: 'Từ 35 Triệu/m2',
    location: 'Bảo Lộc, Lâm Đồng',
    description: 'Cơ hội đầu tư tuyệt vời tại khu vực có khí hậu ôn hòa quanh năm. Quy hoạch bài bản với đầy đủ tiện ích nội khu, mật độ xây dựng thấp.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop',
    features: ['Sổ đỏ từng nền', 'Công viên 2ha', 'Hồ cảnh quan', 'Cơ sở hạ tầng hoàn thiện'],
    status: 'Đang mở bán',
  },
  {
    id: '5',
    title: 'Penthouse The Crown',
    slug: 'penthouse-the-crown',
    category: 'Căn hộ',
    price: 'Từ 120 Tỷ',
    location: 'Quận 1, TP. Hồ Chí Minh',
    description: 'Biểu tượng của sự quyền uy và thịnh vượng. Penthouse với diện tích cực khủng, sân vườn riêng và hồ bơi vô cực ngắm trọn thành phố.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop',
    features: ['Thang máy riêng', 'Diện tích 600m2', 'Nội thất nhập khẩu Ý', 'View 360 độ'],
    status: 'Đã bàn giao',
  },
  {
    id: '6',
    title: 'Biệt Thự Đảo Ngọc',
    slug: 'biet-thu-dao-ngoc',
    category: 'Biệt thự',
    price: 'Từ 80 Tỷ',
    location: 'Phú Quốc, Kiên Giang',
    description: 'Tận hưởng cuộc sống nghỉ dưỡng đích thực tại hòn đảo ngọc. Các căn biệt thự 100% view biển, có bãi tắm riêng và quản lý bởi thương hiệu quốc tế.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
    features: ['Bãi biển riêng', 'Spa cao cấp', 'Nhà hàng Michelin', 'Quản gia 24/7'],
    status: 'Sắp ra mắt',
  }
];

export const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Bất Động Sản Dòng Tiền Lên Ngôi Cuối Năm 2026',
    slug: 'bat-dong-san-dong-tien-len-ngoi',
    excerpt: 'Các chuyên gia nhận định xu hướng đầu tư bất động sản tạo dòng tiền ổn định đang thu hút dòng vốn lớn từ các nhà đầu tư cá nhân và tổ chức.',
    content: 'Nội dung chi tiết đang cập nhật... Phân tích thị trường cho thấy sự chuyển dịch từ đầu tư lướt sóng sang đầu tư dài hạn an toàn.',
    date: '2026-06-01',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Cơ Sở Hạ Tầng Khu Đông Sài Gòn Tiếp Tục Bứt Phá',
    slug: 'co-so-ha-tang-khu-dong-sai-gon',
    excerpt: 'Hàng loạt dự án giao thông trọng điểm chuẩn bị hoàn thành, hứa hẹn tạo đòn bẩy lớn cho giá trị bất động sản khu vực này.',
    content: 'Nội dung chi tiết đang cập nhật... Đặc biệt, đường Vành Đai 3 đang được đẩy nhanh tiến độ.',
    date: '2026-05-28',
    imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f928f1e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Vì Sao Biệt Thự Nghỉ Dưỡng Trở Thành Kênh Trú Ẩn An Toàn?',
    slug: 'vi-sao-biet-thu-nghi-duong',
    excerpt: 'Trong bối cảnh kinh tế biến động, bất động sản nghỉ dưỡng cao cấp vẫn chứng tỏ sức hút nhờ giá trị khan hiếm và khả năng sinh lời kép.',
    content: 'Nội dung chi tiết đang cập nhật... Giới thượng lưu ngày càng quan tâm đến không gian sống thứ hai để cân bằng cuộc sống và công việc.',
    date: '2026-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop',
  }
];
