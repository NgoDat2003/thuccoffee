import type { BlogPost } from './types';

// Blog slugs are sanitized (emoji/special characters stripped) so routing
// stays ASCII-safe; titles keep the original emoji/quotes from source.
export const blogPosts: BlogPost[] = [
  {
    title: 'THỨC COFFEE CHÍNH THỨC MANG "VŨ TRỤ XOÀI" ĐẾN VỚI MÙA HÈ RỒI ĐÂY 🥭',
    slug: 'thuc-coffee-chinh-thuc-mang-vu-tru-xoai-den-voi-mua-he-roi-dayy-s1485t2',
    cover: 'c8918c3a_social-post.jpg',
    summary:
      'Mùa hè này, không cần đi đâu xa vì "tín đồ" THỨC sẽ được hạ nhiệt ngay lập tức với bộ ba siêu phẩm từ Xoài Miền Tây siêu mướt mắt!',
  },
  {
    title: 'Deal on Day - Chill all Day',
    slug: 'deal-on-day-chill-all-day-s1468t2',
    cover: '2fc62206_social-1.jpg',
    summary: 'Ghé Thức "get deals" mỗi tuần và thứ 3 cuối cùng của tháng!',
  },
  {
    title: 'DEADLINE OVERNIGHT VẪN TRÀN ĐẦY NĂNG LƯỢNG CÙNG COMBO TỈNH TÁO',
    slug: 'deadline-overnight-van-tran-day-nang-luong-cung-combo-tinh-tao-s1476t2',
    cover: '9d5cb020_combo-dem-social.jpg',
    summary: 'Đêm thêm tỉnh táo cùng 1 ly cà phê và 1 chiếc bánh mì bơ tỏi siêu thơm ngon.',
  },
  {
    title: 'BUỔI CHIỀU "SO SWEET" CÙNG COMBO NGỌT NGÀO',
    slug: 'buoi-chieu-so-sweet-cung-combo-ngot-ngao-s1475t2',
    cover: '1fbf3667_combo-chieu-social.jpg',
    summary: 'Trà chiều cùng một chiếc bánh ngọt, nạp năng lượng giữa ngày.',
  },
  {
    title: 'SÁNG NO NÊ MỖI NGÀY CÙNG THỨC COFFEE',
    slug: 'sang-no-ne-moi-ngay-cung-thuc-coffee-s1474t2',
    cover: '493fc115_combo-sang-social.jpg',
    summary: 'Combo cà phê và bánh cho một buổi sáng no nê tràn đầy năng lượng.',
  },
];
