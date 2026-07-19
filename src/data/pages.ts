export interface FaqItem {
  q: string;
  a: string;
}

export interface MembershipTier {
  spending: string;
  name: string;
  benefit: string;
  maintenance?: string;
}

export interface JobListing {
  title: string;
  shift: string;
  district: string;
  applyLink: string;
}

export interface CookiePolicySection {
  heading: string;
  paragraphs: string[];
}

export const pages = {
  about: {
    heading: 'THỨC COFFEE - OPEN 24/7',
    body: [
      'Nơi ngắm nhìn Sài Gòn chuyển mình trọn vẹn 24h.',
      'Phải chăng chúng ta đã quá quen thuộc với ly cà phê đầu ngày cho tinh thần tỉnh táo, như một cách khởi động để đua cùng nhịp sống hối hả. Cà phê dần trở thành thứ không thể thiếu, đúng với nghĩa đen là chất kích thích tinh thần minh mẩn và nhạy bén hơn nhằm đáp ứng tốt công việc, học hành và hằng hà sa số thứ nhu cầu khác của mỗi cá nhân.',
      'Nhưng đã bao giờ bạn thấy 8 tiếng đồng hồ giờ hành chính không thể đủ để bạn "cào" hết mớ tài liệu, công việc ngổn ngang, những tập kiến thức còn dở dang,... Vậy hãy thức cùng cà phê để trải dài qua đêm ăn gian thời giờ để bắt kịp với nhịp sống. Sẽ là một thứ cảm giác mới lạ, khi đêm xuống bên tách cà phê đậm vị, yên tĩnh và "ngấu nghiến" hết thảy những thứ dang dở của ban ngày.',
      'Hoặc có thể đơn giản khi không nặng nhọc vì công việc, bạn lại vẩn vơ với đám suy nghĩ nặng tâm tư, đêm cùng cà phê là lúc bạn có thể hạ mình xuống mà chẳng ai hay biết, lúc bạn nuông chìu thứ cảm xúc thật, gỡ bỏ then cài làm hài lòng kẻ khác, đêm là của chính mình,... Cái cớ để gia nhập hội cú đêm thì chẳng ai giống ai.. nhưng suy cho cùng, nếu có thức hãy thức cùng nhau nhé!',
      'THỨC COFFEE, cà phê đêm giữa Sài Gòn nhộn nhịp, nơi tiên phong với mô hình cà phê phục vụ xuyên suốt 24/7, hướng đến các dòng sản phẩm nguyên chất, sạch và an toàn. Với không gian yên tĩnh, đầy đủ những tiện nghi, phục vụ sáng - tối. Phát triển hơn 9 cửa hàng rộng rãi trên nhiều quận tại Thành phố Hồ Chí Minh, luôn sáng đèn phục vụ 24H để đáp ứng nhu cầu khách hàng, cùng menu món uống phong phú, nhân viên phục vụ chuyên cần và tận tình, an toàn tuyệt đối để thức đêm cùng bạn. Thức coffee trở thành điểm đến quen thuộc ở mọi độ tuổi từ công việc, học hành đến hẹn hò hoặc đơn giản là nơi dừng chân để nhìn rõ nét hơn những chuyển động nơi Sài Thành hoa lệ này.',
      '"Đến với Thức Coffee, một ngày trọn vẹn 24 giờ."',
      'Cày đêm cùng Thức, hẹn đêm nào thức cùng cà phê nhỉ?',
      '#thuccoffee247 #open24h',
    ],
  },

  membership: {
    heading: 'Ưu đãi thành viên',
    intro:
      'Với mong muốn nâng cao quyền lợi và bảo vệ lợi ích khách hàng. Thức Coffee mang đến những ưu đãi đặc quyền dành cho khách hàng đăng ký thành viên tại Thức.',
    pointRule:
      'Với mỗi 10.000đ/hoá đơn , khách hàng sẽ tích luỹ được 1 điểm . Đồng thời, khách hàng cũng sẽ tích được 10.000đ vào chi tiêu tích luỹ . Khi chi tiêu tích luỹ đạt mức yêu cầu, khách hàng sẽ được nâng hạng thành viên tương ứng và nhận ưu đãi của hạng thành viên đó.',
    qrCaption: 'Quét Mã QR để tìm kiếm Thức Coffee nhanh chóng!',
    tiers: [
      { spending: 'Từ 0 đến ~3 triệu', name: 'MEMBER', benefit: 'Cần tích luỹ thêm' },
      {
        spending: 'Từ 3 triệu đến ~6 triệu',
        name: 'THÀNH VIÊN BẠC',
        benefit: 'Chiết khấu 5% /hoá đơn',
        maintenance:
          'Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 2 triệu để duy trì hạng sẽ quay lại hạng thành viên MEMBER.',
      },
      {
        spending: 'Từ 6 triệu đến ~10 triệu',
        name: 'THÀNH VIÊN VÀNG',
        benefit: 'Chiết khấu 10% /hoá đơn',
        maintenance:
          'Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 4 triệu để duy trì hạng sẽ rớt xuống hạng THÀNH VIÊN BẠC.',
      },
      {
        spending: 'Từ 10 triệu trở lên',
        name: 'THÀNH VIÊN KIM CƯƠNG',
        benefit: 'Chiết khấu 15% /hoá đơn',
        maintenance:
          'Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 4 triệu để duy trì hạng sẽ rớt xuống hạng THÀNH VIÊN VÀNG. Nếu khách hàng tích luỹ chi tiêu đủ 4 triệu trở lên sẽ tiếp tục duy trì hạng THÀNH VIÊN KIM CƯƠNG (xét duyệt hàng năm tính từ ngày thăng hạng).',
      },
    ] satisfies MembershipTier[],
    tierNotes: [
      '*Chi tiêu tích luỹ là số tiền bạn đã chi tiêu tại Thức Coffee, được dùng để xác định và nâng/hạ cấp bậc thành viên. Chi tiêu tích luỹ không phải là điểm tích luỹ.',
      'Ưu đãi sẽ được hệ thống tự động xác nhận và chiết khấu khi bạn tích điểm, không giới hạn số tiền và số lần sử dụng trong ngày.',
      '*Ngày xét duyệt hạng thành viên hàng năm sẽ dựa trên ngày thăng hạng thành viên.',
    ],
    support:
      'Mọi thắc mắc về chương trình "Ưu đãi thành viên" khách hàng vui lòng inbox Fanpage " Thức Coffee " hoặc gửi email: info@thuccoffee.com.vn để được hỗ trợ.',
  },

  membershipFaq: [
    {
      q: 'Cách thức đăng ký thành viên tại Thức Coffee như thế nào ?',
      a: 'Bước 1 : Truy cập ứng dụng Zalo và tìm kiếm " Thức Coffee " Bước 2 : Click " Quan tâm ", sau đó click " Đăng ký thành viên " Bước 3 : Điền đầy đủ và chính xác thông tin (để đối chiếu khi nhận ưu đãi về sau) Chúc mừng bạn đã trở thành thành viên của Thức Coffee, khi thanh toán bạn nhớ đọc mã tích điểm cho thu ngân để được tích điểm và thăng hạng nhé!',
    },
    {
      q: 'Làm sao để có mã tích điểm ?',
      a: 'Bạn chỉ cần truy cập khung chat "Thức Coffee" trên Zalo ⇒ click "Cá nhân" ⇒ click "Lấy mã tích điểm". Tại đây, bạn cũng có thể xem được điểm tích luỹ và hạng thành viên. Lưu ý : Mã tích điểm chỉ có hiệu lực trong 15 phút kể từ lúc lấy mã, sau thời gian trên bạn nhớ lấy mã tích điểm khác. * Để bảo vệ quyền lợi và sự riêng tư của khách hàng, Thức chỉ tích điểm bằng mã tích điểm.',
    },
    {
      q: 'Chính sách hạng thành viên như thế nào ?',
      a: 'Thức Coffee dựa trên chi tiêu tích luỹ * để phân hạng thành viên và có 4 hạng thành viên từ cơ bản đến nâng cao như sau: Từ 0 đến ~3 triệu: MEMBER - Cần tích luỹ thêm. Từ 3 triệu đến ~6 triệu: THÀNH VIÊN BẠC - Chiết khấu 5% /hoá đơn. Từ 6 triệu đến ~10 triệu: THÀNH VIÊN VÀNG - Chiết khấu 10% /hoá đơn. Từ 10 triệu trở lên: THÀNH VIÊN KIM CƯƠNG - Chiết khấu 15% /hoá đơn. *Chi tiêu tích luỹ là số tiền bạn đã chi tiêu tại Thức Coffee, được dùng để xác định và nâng/hạ cấp bậc thành viên. Chi tiêu tích luỹ không phải là điểm tích luỹ. Ưu đãi sẽ được hệ thống tự động xác nhận và chiết khấu khi bạn tích điểm, không giới hạn số tiền và số lần sử dụng trong ngày.',
    },
    {
      q: 'Hạng thành viên có điều kiện duy trì hay không ?',
      a: 'Hạng thành viên có điều kiện duy trì. Đối với các hạng thành viên khác nhau sẽ có những điều kiện khác nhau: - Đối với hạng THÀNH VIÊN BẠC : Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 2 triệu để duy trì hạng sẽ quay lại hạng thành viên MEMBER. - Đối với hạng THÀNH VIÊN VÀNG : Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 4 triệu để duy trì hạng sẽ rớt xuống hạng THÀNH VIÊN BẠC. - Đối với hạng THÀNH VIÊN KIM CƯƠNG : Sau 1 năm kể từ ngày nâng hạng, nếu khách hàng không tích luỹ chi tiêu đủ 4 triệu để duy trì hạng sẽ rớt xuống hạng THÀNH VIÊN VÀNG. Nếu khách hàng tích luỹ chi tiêu đủ 4 triệu trở lên sẽ tiếp tục duy trì hạng THÀNH VIÊN KIM CƯƠNG (xét duyệt hàng năm tính từ ngày thăng hạng). *Ngày xét duyệt hạng thành viên hàng năm sẽ dựa trên ngày thăng hạng thành viên.',
    },
    {
      q: 'Thức có "ưu đãi sinh nhật" dành cho thành viên không ?',
      a: 'Chắc chắn là có bạn nhé. Vào ngày sinh nhật (dựa trên ngày sinh đăng ký trên Zalo), bạn sẽ nhận được tin nhắn chúc mừng sinh nhật từ Thức và kèm theo mã ưu đãi 1 phần bánh miễn phí bất kỳ áp dụng cho tất cả chi nhánh của Thức Coffee. * Mã ưu đãi sinh nhật có hạn sử dụng trong vòng 30 ngày kể từ ngày nhận được tin nhắn',
    },
    {
      q: 'Ngoài ra, chương trình còn có quy định nào không?',
      a: 'Chương trình "Ưu đãi thành viên" chỉ áp dụng cho khách hàng đã đăng ký thành viên trên Zalo/Facebook "Thức Coffee". Chương trình "Ưu đãi thành viên" sẽ không áp dụng chung cùng một số chương trình khác. Khách hàng vui lòng xuất trình "Mã tích điểm" trước khi thanh toán, "Mã tích điểm" và "Ưu đãi hạng thành viên" sẽ không được áp dụng khi giao dịch đã hoàn thành. Điểm tích luỹ không thể quy đổi sang tiền mặt hoặc chuyển nhượng sang tài khoản khác. Chương trình "Ưu đãi thành viên" không áp dụng khi đặt hàng qua các đối tác giao hàng. "Ưu đãi thành viên" được áp dụng khi đặt hàng qua kênh Zalo/Facebook "Thức Coffee", Hotline Thức 18006230.',
    },
  ] satisfies FaqItem[],

  jobs: [
    { title: 'Nhân viên PHỤC VỤ', shift: 'CA SÁNG : 7H - 15H · CA CHIỀU: 15H - 23H · CA ĐÊM : 23H - 7H', district: 'Quận 1, Quận 4, Q.Phú Nhuận, Q.Gò Vấp', applyLink: 'https://by.com.vn/NjxZTV' },
    { title: 'Nhân viên PHA CHẾ', shift: 'CA SÁNG : 7H - 15H · CA CHIỀU: 15H - 23H · CA ĐÊM : 23H - 7H', district: 'Quận 1, Quận 4, Q.Phú Nhuận, Q.Gò Vấp', applyLink: 'https://by.com.vn/NjxZTV' },
    { title: 'Nhân viên THU NGÂN', shift: 'CA SÁNG : 7H - 15H · CA CHIỀU: 15H - 23H · CA ĐÊM : 23H - 7H', district: 'Quận 1, Quận 4, Q.Phú Nhuận, Q.Gò Vấp', applyLink: 'https://by.com.vn/NjxZTV' },
    { title: 'Nhân viên BẢO VỆ (Ca 12 tiếng)', shift: 'Ca 12 tiếng', district: 'Quận 1, Quận 4, Q.Phú Nhuận, Q.Gò Vấp', applyLink: 'https://by.com.vn/NjxZTV' },
  ] satisfies JobListing[],

  careers: {
    heading: 'TUYỂN DỤNG',
    intro: '👋 Bạn ơi đi đâu mà vội mà vàng, dừng chân ghé lại điền link ứng tuyển gia nhập đại gia đình Thức Coffee thôi nà 🫰',
    notice: '📌 LƯU Ý: Thức Coffee chỉ đăng tải thông tin tuyển dụng trên Fanpage chính thức của Thức Coffee, ngoài ra không đăng tải trên bất kì trang/nhóm nào khác. Những hồ sơ phù hợp Thức sẽ gửi email để hẹn lịch phỏng vấn, các bạn lưu ý nhé!',
    applyText: '📥 APPLY ngay tại đây bạn nhé: https://by.com.vn/NjxZTV',
    rolesHeading: '📌 Thức đang tuyển dụng các vị trí:',
    shiftsHeading: '📌 Ca làm việc full-time:',
    area: '📍 Làm việc tại khu vực Quận 1, Quận 4, Q.Phú Nhuận, Q.Gò Vấp.',
    benefits: '🤝 Về một nhà với Thức bạn sẽ được tạo cơ hội phát triển bản thân, thăng tiến trong quá trình làm việc và tận hưởng những quyền lợi đặc biệt dành riêng cho nhân viên.',
    responseTime: '✅ Những hồ sơ phù hợp sẽ được Thức liên hệ hẹn phỏng vấn trong vòng 5 ngày làm việc. Đừng bỏ lỡ cơ hội bạn nhé!',
    support: '📌 Mọi thắc mắc về thông tin tuyển dụng, bạn có thể inbox Fanpage để được giải đáp.',
    hashtags: '#thuccoffee247 #TuyenDung #Job #Wearehiring #open24hours',
  },

  delivery: {
    heading: 'THỨC DELIVERY',
    freeship: 'FREESHIP cho hóa đơn từ 70.000Đ & dưới 3KM',
    intro: 'Bạn có thể đặt hàng dễ dàng qua các kênh sau:',
    channels: [
      { label: 'Hotline Thức Delivery: 1800 6230', href: 'tel:18006230' },
      { label: 'Zalo " Thức Coffee " (Chỉ áp dụng Thành viên Thức Coffee): ĐẶT GIAO HÀNG', href: 'https://cutt.ly/w8dWP8s' },
      { label: 'Messenger " Thức Coffee " (Chỉ áp dụng Thành viên Thức Coffee): ĐẶT GIAO HÀNG', href: 'https://cutt.ly/w8dWP8s' },
    ],
    deliveryTime: 'Thời gian giao hàng 24/7.',
    codes: [
      { code: 'FBFRSHIP', description: 'Nhập mã FBFRSHIP để được FREESHIP cho đơn hàng dưới 3km, áp dụng cho đơn hàng từ 70.000đ.' },
      { code: 'FBKHAO20', description: 'Nhập mã FBKHAO20 để được GIẢM 20% tối đa 50.000đ.' },
    ],
  },

  cookiePolicy: {
    heading: 'Chính sách Cookie',
    sections: [
      { heading: 'Cookies là gì?', paragraphs: [
        'Cookie là các tệp văn bản nhỏ được gửi đến và lưu trữ trên máy tính, điện thoại thông minh hoặc thiết bị khác của bạn để truy cập internet, bất cứ khi nào bạn truy cập một trang web. Cookie hữu ích vì chúng cho phép trang web nhận ra thiết bị của người dùng.',
        "Như là thực tế phổ biến với hầu hết các trang web chuyên nghiệp, trang web này sử dụng cookie, đó là những tệp nhỏ được tải xuống máy tính của bạn, để cải thiện trải nghiệm của bạn. Trang này mô tả thông tin nào họ thu thập, cách chúng tôi sử dụng và tại sao đôi khi chúng tôi cần phải lưu trữ các cookie này. Chúng tôi cũng sẽ chia sẻ cách bạn có thể ngăn các cookie này được lưu trữ tuy nhiên điều này có thể hạ cấp hoặc 'phá vỡ' các yếu tố nhất định của chức năng trang web.",
        'Để biết thêm thông tin chung về cookie, hãy xem bài viết trên Wikipedia về Cookie HTTP.',
      ] },
      { heading: 'Cách chúng tôi sử dụng cookie', paragraphs: [
        'Chúng tôi sử dụng cookie vì nhiều lý do chi tiết bên dưới. Rất tiếc, trong hầu hết các trường hợp, không có tùy chọn chuẩn công nghiệp nào để tắt cookie mà không vô hiệu hóa hoàn toàn chức năng và tính năng mà chúng thêm vào trang web này. Chúng tôi khuyên bạn nên để lại tất cả cookie nếu bạn không chắc mình có cần chúng hay không trong trường hợp chúng được sử dụng để cung cấp dịch vụ mà bạn sử dụng.',
      ] },
      { heading: 'Tắt cookie', paragraphs: [
        'Bạn có thể ngăn chặn cài đặt cookie bằng cách điều chỉnh cài đặt trên trình duyệt của bạn (xem trình duyệt của bạn Trợ giúp về cách thực hiện điều này). Xin lưu ý rằng việc tắt cookie sẽ ảnh hưởng đến chức năng của điều này và nhiều trang web khác mà bạn truy cập. Việc tắt cookie thường sẽ dẫn đến việc vô hiệu hóa một số chức năng và tính năng nhất định của trang web này. Do đó, bạn không nên tắt cookie.',
      ] },
      { heading: 'Cookie chúng tôi đặt', paragraphs: [
        'Nếu bạn tạo một tài khoản với chúng tôi thì chúng tôi sẽ sử dụng cookie để quản lý quá trình đăng ký và quản trị chung. Các cookie này thường sẽ bị xóa khi bạn đăng xuất tuy nhiên trong một số trường hợp, chúng có thể vẫn còn sau đó để ghi nhớ các tùy chọn trang web của bạn khi đăng xuất.',
        'Chúng tôi sử dụng cookie khi bạn đăng nhập để chúng tôi có thể nhớ sự thật này. Điều này ngăn bạn không phải đăng nhập vào mỗi lần bạn truy cập một trang mới. Các cookie này thường được xóa hoặc xóa khi bạn đăng xuất để đảm bảo rằng bạn chỉ có thể truy cập các tính năng và khu vực bị hạn chế khi đăng nhập.',
        'Trang web này cung cấp dịch vụ đăng ký bản tin hoặc email và cookie có thể được sử dụng để ghi nhớ nếu bạn đã đăng ký và có hiển thị một số thông báo nhất định mà chỉ có thể hợp lệ cho người dùng đã đăng ký / không đăng ký.',
        'Trang web này cung cấp thương mại điện tử hoặc phương tiện thanh toán và một số cookie là điều cần thiết để đảm bảo rằng đơn đặt hàng của bạn được ghi nhớ giữa các trang để chúng tôi có thể xử lý nó đúng cách.',
        'Khi bạn gửi dữ liệu đến thông qua một biểu mẫu chẳng hạn như những dữ liệu được tìm thấy trên trang liên hệ hoặc biểu mẫu nhận xét, cookie có thể được đặt để ghi nhớ chi tiết người dùng của bạn cho thư từ trong tương lai.',
        'Để cung cấp cho bạn trải nghiệm tuyệt vời trên trang web này, chúng tôi cung cấp chức năng để đặt tùy chọn của bạn về cách trang web này chạy khi bạn sử dụng nó. Để ghi nhớ tùy chọn của bạn, chúng tôi cần đặt cookie để thông tin này có thể được gọi bất cứ khi nào bạn tương tác với một trang bị ảnh hưởng bởi tùy chọn của bạn.',
      ] },
      { heading: 'Cookie của bên thứ ba', paragraphs: [
        'Trong một số trường hợp đặc biệt, chúng tôi cũng sử dụng cookie do bên thứ ba đáng tin cậy cung cấp. Phần sau đây nêu chi tiết cookie của bên thứ ba mà bạn có thể gặp phải thông qua trang web này.',
        'Trang web này sử dụng Google Analytics là một trong những giải pháp phân tích phổ biến và đáng tin cậy nhất trên web để giúp chúng tôi hiểu cách bạn sử dụng trang web và các cách mà chúng tôi có thể cải thiện trải nghiệm của bạn. Các cookie này có thể theo dõi những thứ như thời gian bạn chi tiêu trên trang web và các trang bạn truy cập để chúng tôi có thể tiếp tục tạo nội dung hấp dẫn.',
        'Google cung cấp hướng dẫn để chọn không tham gia theo dõi bởi Google Analytics trên tất cả các trang web tại http://tools.google.com/dlpage/gaoptout. Để biết thêm thông tin về cookie Google Analytics, hãy xem trang Google Analytics chính thức.',
      ] },
      { heading: 'Thêm thông tin', paragraphs: [
        'Hy vọng rằng mọi thứ đã được làm rõ cho bạn và như đã đề cập ở trên nếu có điều gì đó mà bạn không chắc chắn liệu bạn có cần hay không thì an toàn hơn để bật cookie trong trường hợp nó tương tác với một trong các tính năng bạn sử dụng trên trang web của chúng tôi.',
        'Tuy nhiên, nếu bạn vẫn đang tìm kiếm thêm thông tin thì bạn có thể liên hệ với chúng tôi thông qua một trong các phương thức liên hệ ưa thích của chúng tôi.',
        'Để biết thêm thông tin về cookie và cách tắt chúng, vui lòng truy cập www.allaboutcookies.org',
      ] },
    ] satisfies CookiePolicySection[],
  },

  // Office address is sourced directly from the crawled contact page.
  contact: {
    heading: 'Liên hệ',
    intro: 'Cùng Thức phát triển ngày một tốt hơn',
    officeHeading: 'Văn Phòng',
    hotline: '1800 6230',
    email: 'info.thuccoffee247@gmail.com',
    location: '40D Lý Tự Trọng, P.Sài Gòn, TP.HCM',
  },
};
