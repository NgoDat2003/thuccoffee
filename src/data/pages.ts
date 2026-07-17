export interface FaqItem {
  q: string;
  a: string;
}

export interface JobListing {
  title: string;
  location: string;
  blurb: string;
}

export const pages = {
  about: {
    heading: 'Về chúng tôi',
    body: [
      'Thức Coffee ra đời với một ý tưởng đơn giản: cà phê ngon phải luôn sẵn sàng, bất kể là mấy giờ. Thức tự hào là một trong những thương hiệu tiên phong hoạt động 24/7 tại TP.HCM, phục vụ những ai cần một góc quen thuộc để làm việc, gặp gỡ, hay đơn giản là nạp năng lượng giữa đêm khuya.',
      'Từ ly cà phê phin truyền thống đến các món trà trái cây và đá xay hiện đại, Thức luôn tìm cách kết hợp hương vị quen thuộc với sự sáng tạo mới mẻ, phục vụ mọi thời điểm trong ngày.',
      'Cam kết 24H không chỉ là giờ mở cửa — đó là lời hứa rằng luôn có một ly Thức đang chờ bạn.',
    ],
  },

  membershipFaq: [
    {
      q: 'Làm sao để đăng ký thành viên Thức?',
      a: 'Bạn có thể đăng ký ngay tại quầy khi mua hàng hoặc qua ứng dụng/website của Thức Coffee bằng số điện thoại.',
    },
    {
      q: 'Tích điểm như thế nào?',
      a: 'Mỗi hoá đơn hợp lệ sẽ được quy đổi thành điểm thưởng theo tỷ lệ giá trị đơn hàng, cộng dồn vào tài khoản thành viên của bạn.',
    },
    {
      q: 'Điểm tích luỹ dùng để làm gì?',
      a: 'Điểm có thể đổi thành voucher giảm giá hoặc quà tặng trong chương trình ưu đãi định kỳ của Thức.',
    },
    {
      q: 'Điều kiện lên hạng thành viên là gì?',
      a: 'Hạng thành viên được xét dựa trên tổng chi tiêu tích luỹ trong năm — chi tiêu càng nhiều, ưu đãi càng cao.',
    },
    {
      q: 'Thành viên có ưu đãi gì vào dịp sinh nhật?',
      a: 'Thành viên sẽ nhận được một ưu đãi đặc biệt trong tháng sinh nhật của mình, thông báo qua tin nhắn hoặc ứng dụng.',
    },
    {
      q: 'Điểm tích luỹ có thời hạn không?',
      a: 'Điểm thưởng có thời hạn sử dụng nhất định; vui lòng theo dõi trong tài khoản thành viên hoặc liên hệ hotline để biết thêm chi tiết.',
    },
  ] satisfies FaqItem[],

  jobs: [
    {
      title: 'Barista',
      location: 'TP.HCM',
      blurb: 'Pha chế và phục vụ khách hàng tại cửa hàng, làm việc theo ca linh hoạt phù hợp mô hình 24/7.',
    },
    {
      title: 'Quản lý cửa hàng',
      location: 'TP.HCM',
      blurb: 'Quản lý vận hành, nhân sự và chất lượng dịch vụ tại một cửa hàng Thức Coffee.',
    },
    {
      title: 'Nhân viên phục vụ',
      location: 'TP.HCM',
      blurb: 'Hỗ trợ order, phục vụ bàn và giữ gìn không gian cửa hàng luôn sạch đẹp.',
    },
  ] satisfies JobListing[],

  delivery: {
    heading: 'Thức Delivery',
    body: 'Đặt món yêu thích của bạn từ Thức Coffee và nhận hàng tận nơi, bất kể ngày hay đêm. Gọi hotline hoặc ghé cửa hàng gần nhất để được hỗ trợ đặt hàng nhanh chóng.',
  },

  cookiePolicy: {
    heading: 'Chính sách Cookie',
    body: [
      'Trang web này sử dụng cookie để cải thiện trải nghiệm duyệt web của bạn, ghi nhớ tuỳ chọn và phân tích lưu lượng truy cập.',
      'Bằng việc tiếp tục sử dụng trang web, bạn đồng ý với việc sử dụng cookie theo chính sách này. Bạn có thể tắt cookie trong cài đặt trình duyệt bất kỳ lúc nào, tuy nhiên một số tính năng của trang có thể không hoạt động như mong đợi.',
    ],
  },

  // Contact block intentionally uses only the real sourced hotline and a
  // generic city location — no invented street address for the real company.
  contact: {
    heading: 'Liên hệ',
    hotline: '1800 6230',
    email: 'info.thuccoffee247@gmail.com',
    location: 'TP.HCM, Việt Nam',
  },
};
