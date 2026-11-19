# **Lumen 24 – Đặc tả yêu cầu website vận hành (bản mô phỏng)**

*Môn Nguyên lý quản trị (BSA2004) · Dùng để giao AI viết code theo từng phần · 19/11/2026*

## **0\. Cách dùng tài liệu**

* Tài liệu mô tả đầy đủ tính năng website của quán Lumen 24, bám theo kế hoạch Planning của nhóm (mục 5.7 về hệ thống web, cùng các mục 5, 6, 8, 9).  
* Đây là hệ thống **mô phỏng** cho bài tập: không có thanh toán thật, máy in thật hay khách thật. Dữ liệu là dữ liệu giả, nhưng **quy tắc nghiệp vụ phải chạy đúng** như kế hoạch.  
* Mục 1-4 là phần chung. Mỗi lần giao việc cho AI, hãy dán kèm mục 1-4 và mục 6 (quy tắc nghiệp vụ), sau đó dán module cần làm ở mục 5\.  
* Chỗ nào kế hoạch chưa quy định, tài liệu đặt **giả định mặc định** và ghi dấu **\[MĐ\]**. Tất cả được liệt kê ở mục 12 để bạn xác nhận hoặc sửa trước khi giao AI.  
* Ba giai đoạn trong kế hoạch (GĐ1 khai trương, GĐ2 tháng 2-4/2027, GĐ3 tháng 5-8/2027) được ghi ở từng module. Vì là bản mô phỏng nên có thể làm đủ cả ba, theo thứ tự ở mục 11\.

**Cách làm đã chọn (bản cập nhật):** website **tĩnh** viết bằng HTML, CSS và JavaScript thuần, làm hoàn toàn trên GitHub và xem thử bằng GitHub Pages. Vercel tính sau, khi bản trên GitHub đã đạt. Chi tiết ở mục 1.2, 10 và 11\.

## **1\. Phạm vi và nguyên tắc mô phỏng**

### **1.1 Những gì được mô phỏng**

| Thành phần ngoài đời | Cách mô phỏng trong website |
| :---- | :---- |
| Thanh toán QR | Hiện mã QR giả (sinh bằng thư viện) kèm hai nút “Mô phỏng: đã chuyển khoản” và “Mô phỏng: thất bại”. Không kết nối ngân hàng. |
| Quét QR check-in | Mỗi tầng và mỗi bàn có mã QR giả. Nút “Mô phỏng quét mã” mở trang check-in; có thêm ô nhập mã tay. |
| Máy in | Hàng đợi in giả với trạng thái Chờ in, Đang in, Hoàn tất, Lỗi. Nhân viên bấm đổi trạng thái hoặc hệ thống tự chạy sau vài giây. |
| Email, Zalo | Hộp thông báo trong ứng dụng (biểu tượng chuông) và nhật ký “email giả”. |
| Công tơ điện | Quản lý nhập số kWh tay; có dữ liệu mẫu. |
| Camera, kiểm soát ra vào | Không mô phỏng. |

### **1.2 Yêu cầu kỹ thuật tối thiểu**

* Website **tĩnh** bằng HTML, CSS và JavaScript thuần (ES modules): không framework, không build, không npm, không máy chủ. Xem thử bằng GitHub Pages; sau này đưa lên Vercel (Framework Preset chọn Other, để trống mọi ô lệnh build) mà không phải sửa mã.  
* Người làm chỉ dán file vào GitHub bằng trình duyệt, không có Terminal. Vì vậy mỗi file phải **đầy đủ, chạy được ngay**, không phụ thuộc bước cài đặt nào.  
* Mọi liên kết, ảnh, CSS, script dùng **đường dẫn tương đối** (ví dụ ./bang-gia.html, ./css/style.css), vì GitHub Pages thêm tiền tố tên repo vào địa chỉ. Không dùng đường dẫn bắt đầu bằng dấu gạch chéo.  
* Mỗi trang là một file .html ở thư mục gốc; tham số đi qua query string (ví dụ dat-phong.html?phong=r35). Header, footer, thanh điều hướng, dải thông báo mô phỏng và bảng điều khiển demo do js/ui.js chèn vào mọi trang.  
* Thư viện ngoài chỉ nạp bằng thẻ \<script\> từ CDN, ghi rõ phiên bản cụ thể: Chart.js cho biểu đồ, một thư viện tạo mã QR. Không dùng thư viện nào cần cài đặt.  
* Dữ liệu khởi tạo nằm trong js/config.js và js/seed.js. Trạng thái phát sinh khi dùng (check-in, đặt phòng, đơn đồ, điểm...) lưu bằng **localStorage** qua js/store.js; mọi chỗ đụng tới localStorage bọc try/catch. Các tab cùng trình duyệt đồng bộ bằng BroadcastChannel, để demo màn hình khách và màn hình nhân viên ở hai tab.  
* Mọi truy cập dữ liệu đi qua js/api.js (hàm async giả lập độ trễ 200-500 ms). Sau này có thể thay bằng cơ sở dữ liệu thật mà không sửa giao diện.  
* Mọi quy tắc tính giá, tính giờ, kiểm tra điều kiện nằm trong js/rules.js dưới dạng hàm thuần (không đụng tới giao diện). Có trang test.html chạy các ví dụ ở mục 6 và hiện đạt hoặc không đạt ngay trên trình duyệt.  
* Bảng giá, ngưỡng cảnh báo, giờ mở cửa nằm trong js/config.js; trang Admin chỉnh được và lưu vào store.  
* Có nút **Đặt lại dữ liệu demo** để về trạng thái seed ở mục 8\.  
* Không dùng khóa bí mật, không gọi dịch vụ bên ngoài (ngoài việc nạp thư viện từ CDN).  
* File JavaScript dạng module chỉ chạy khi mở qua địa chỉ http hoặc https (GitHub Pages), không chạy khi mở trực tiếp file từ ổ đĩa.  
* Dải thông báo cố định trên đầu trang: “Hệ thống mô phỏng cho bài tập, dữ liệu là giả”.

### **1.3 Đồng hồ mô phỏng**

Mọi quy tắc phụ thuộc thời gian (tầng 3 mở 19h-23h, giá phòng thấp điểm, combo đêm, ca làm việc, giờ điện cao điểm, cảnh báo vắng mặt 30 phút) chỉ được đọc giờ qua **một hàm duy nhất now()**. Ở chế độ demo, now() có thể bị ghi đè (đặt giờ cụ thể, tua nhanh x1, x10, x60, tạm dừng). Nhờ vậy xem được mọi tình huống mà không phải chờ.

## **2\. Phong cách giao diện**

### **2.1 Tham khảo từ Nerd Society (chỉ tham khảo cấu trúc và cách trình bày)**

Trang chủ dạng cuộn dài: Hero, Giới thiệu, Không gian, Bảng giá, Liên hệ.

* **Hero:** slogan, hai nút (Đặt lịch, Xem combo), hàng số liệu nổi bật.  
* **Khối điểm mạnh:** lưới 6 thẻ nhỏ có biểu tượng.  
* **Không gian:** lưới ảnh kèm số liệu (diện tích, chỗ ngồi, phòng họp, 24/7).  
* **Bảng giá:** dạng thẻ, có nhãn “PHỔ BIẾN” ở gói nên bán.  
* **Menu:** Trang chủ, Giới thiệu, Cộng đồng, Đặt lịch, Tuyển dụng, Góp ý; nút “Đặt lịch ngay” nổi bật ở header.  
* **Footer:** giới thiệu ngắn, mạng xã hội, liên kết nhanh, địa điểm, liên hệ, giờ mở cửa, ba trang chính sách.  
* **Giọng văn:** gần gũi, hướng tới sinh viên.

### **2.2 Điều không được làm**

Không sao chép tên gói, câu chữ, hình ảnh hay logo của Nerd Society. Dùng tên và nội dung của Lumen 24 theo tài liệu này.

### **2.3 Design tokens (tạm, bạn sẽ chỉnh sau)**

Toàn bộ màu, font, bo góc, đổ bóng đặt ở một nơi duy nhất là css/tokens.css (biến CSS, ví dụ \--mau-nen, \--mau-nhan) để đổi phong cách mà không sửa từng trang.

| Token | Giá trị tạm | Ghi chú |
| :---- | :---- | :---- |
| Màu nền | Trắng ấm (kem nhạt) |  |
| Màu chữ | Xanh than đậm |  |
| Màu nhấn chính | Vàng ấm, gợi “ánh sáng” | Nút chính, nhãn PHỔ BIẾN |
| Màu mức độ đông | Xanh \= vắng, vàng \= vừa, cam \= đông, đỏ \= gần kín | Dùng ở sơ đồ chỗ ngồi |
| Font | Sans-serif hỗ trợ đầy đủ tiếng Việt (ví dụ Be Vietnam Pro hoặc Inter) |  |
| Bo góc, bóng | Bo lớn 12-16 px, thẻ có bóng nhẹ |  |

Tông chung: yên tĩnh, tập trung, tối giản, đúng giá trị cốt lõi “giá minh bạch, yên tĩnh, an toàn, cộng đồng”.

### **2.4 Logo và hình ảnh**

* Logo tên: logo.svg (hoặc logo.png) ở thư mục gốc. Logo nhỏ trên tab trình duyệt: favicon.ico ở thư mục gốc, khai báo bằng \<link rel="icon" href="./favicon.ico"\>. Bạn thay file thật, mã không cần sửa.  
* Chưa có ảnh quán: dùng **khối ảnh giữ chỗ** (nền gradient, biểu tượng, chú thích “Ảnh minh họa”). Đặt tên file cố định trong images/ (hero.jpg, space-1.jpg, room-3-5.jpg...) để thay ảnh thật sau mà không đổi mã.

### **2.5 Yêu cầu chung của giao diện**

* Ưu tiên điện thoại (khách chủ yếu dùng điện thoại); kiểm tra ở 360 px, 768 px, 1280 px.  
* Tiếng Việt có dấu; tiền định dạng 89.000đ; ngày dd/mm/yyyy; giờ 24h; múi giờ Việt Nam.  
* Mọi màn hình có đủ trạng thái: đang tải, rỗng, lỗi, thành công.  
* Tiếp cận: tương phản đủ, nhãn cho ô nhập, dùng được bằng bàn phím, có alt cho ảnh.

## **3\. Vai trò, tài khoản demo và điều hướng**

### **3.1 Vai trò**

| Vai trò | Mô tả | Khu vực sử dụng |
| :---- | :---- | :---- |
| Khách | Sinh viên hoặc người đi làm | Trang công khai, tài khoản, check-in, đặt phòng, đặt đồ, in, góp ý |
| Nhân viên | Làm theo ca | Màn hình nhân viên: khách đang ngồi, đơn đồ uống, phòng, hàng đợi in, chế độ dự phòng |
| Quản lý | Nhóm sáng lập | Mọi thứ của nhân viên, cộng Dashboard, báo cáo, Admin |

### **3.2 Tài khoản demo (đăng nhập nhanh bằng một nút)**

| Tên | Vai trò | Mục đích demo |
| :---- | :---- | :---- |
| Minh Anh | Khách, sinh viên | Có 88 giờ tích lũy, gần mốc 100 giờ |
| Quốc Bảo | Khách, người đi làm | Có thẻ tháng hè |
| Linh | Khách, đại diện CLB | CLB đã được duyệt ưu đãi |
| Hà | Khách mới | Chưa có dữ liệu, dùng để demo đăng ký |
| Tuấn | Nhân viên ca tối |  |
| Mai | Nhân viên ca đêm |  |
| Hoàng | Quản lý |  |

Đăng ký tài khoản mới vẫn hoạt động (lưu vào store). Mật khẩu chỉ là mật khẩu giả cho demo, không dùng mật khẩu thật.

### **3.3 Điều hướng và phân quyền**

* Thanh điều hướng thay đổi theo vai trò đang đăng nhập.  
* Vào trang không đủ quyền thì hiện trang “Bạn không có quyền truy cập” kèm nút về trang phù hợp.  
* Ở chế độ demo có nút đổi vai trò nhanh (xem module M1).

## **4\. Dữ liệu cấu hình (nguồn duy nhất)**

Mọi con số dưới đây đặt trong js/config.js. Không viết cứng ở nơi khác.

### **4.1 Tầng và chỗ ngồi**

| Tầng | Giờ mở | Chỗ ngồi tự do | Phòng họp |
| :---- | :---- | :---- | :---- |
| 1 | 24/7 | 30 | Không có (quầy pha chế, thu ngân, in ấn) |
| 2 | 24/7 | 28 | Phòng 3-5 người; phòng 7-10 người (phòng 1\) |
| 3 | Chỗ tự do mở 19h-23h; phòng họp mở khi có đặt phòng | 22 | Phòng 7-10 người (phòng 2); phòng 15-20 người |

Tổng chỗ ngồi tự do: 80\.

### **4.2 Gói chỗ ngồi (chỉ tính chỗ ngồi, đồ uống mua riêng)**

| Mã | Gói | Giá | Kèm theo | Nhãn |
| :---- | :---- | :---- | :---- | :---- |
| h1 | 1 giờ | 12.000đ | Không |  |
| h3 | 3 giờ | 30.000đ | 1 trà túi lọc hoặc nước pha sẵn |  |
| h6 | 6 giờ | 55.000đ | Như gói 3 giờ |  |
| h9 | 9 giờ | 75.000đ | Như gói 3 giờ, thêm 1 đồ ăn nhẹ (bánh mì hoặc mì ly) |  |
| night | Combo đêm (23h-7h) | 45.000đ | Không |  |
| day | Combo Trọn Ngày | 89.000đ | 1 đồ uống trong menu, ngồi không giới hạn thời gian, in 10 trang A4 đen trắng, tính 10 giờ vào tích điểm | PHỔ BIẾN \[MĐ\] |

Nước lọc miễn phí cho mọi khách. Trên trang giá có khối so sánh: “Gói 9 giờ \+ 1 đồ uống \= 114.000đ-130.000đ; Combo Trọn Ngày \= 89.000đ, tiết kiệm 25.000đ-41.000đ”. Các con số này **tính tự động** từ giá gói 9 giờ, giá đồ uống thấp nhất và cao nhất trong menu.

### **4.3 Phòng họp**

| Mã | Phòng | Tầng | Sức chứa | Giá chuẩn/giờ | Thiết bị |
| :---- | :---- | :---- | :---- | :---- | :---- |
| r35 | Phòng 3-5 người | 2 | 3-5 | 60.000đ | Máy chiếu, bảng, micro |
| r710a | Phòng 7-10 người (phòng 1\) | 2 | 7-10 | 90.000đ | Máy chiếu, bảng, micro |
| r710b | Phòng 7-10 người (phòng 2\) | 3 | 7-10 | 90.000đ | Máy chiếu, bảng, micro |
| r1520 | Phòng 15-20 người | 3 | 15-20 | 160.000đ | Máy chiếu, bảng, micro |

### **4.4 Menu mẫu \[MĐ\] (kế hoạch nói sẽ chốt sau khi chạy thử, nên đây là dữ liệu giả)**

| Nhóm | Món và giá |
| :---- | :---- |
| Đồ uống (8 món, 39.000đ-55.000đ) | Cà phê đen đá 39k; Cà phê sữa đá 39k; Bạc xỉu 42k; Trà đào cam sả 45k; Trà vải hoa hồng 45k; Cacao đá 49k; Matcha latte 52k; Cold brew 55k |
| Ăn nhẹ (4 món, 15.000đ-30.000đ) | Mì ly 15k; Bánh quy đóng gói 18k; Bánh mì 20k; Sandwich đóng gói 30k |
| Miễn phí | Nước lọc |

### **4.5 In ấn và văn phòng phẩm**

| Dịch vụ | Giá |
| :---- | :---- |
| In hoặc photo đen trắng A4 (một hoặc hai mặt) | 1.000đ/tờ; từ 50 tờ trở lên 700đ/tờ |
| Văn phòng phẩm mẫu \[MĐ\] | Bút bi 5k; Kẹp giấy 5k; Giấy note 10k; File đựng tài liệu 12k; Pin 20k |

### **4.6 Khung giờ**

| Khung | Giờ | Dùng cho |
| :---- | :---- | :---- |
| Cao điểm quán | 19h-23h | Mở chỗ tự do tầng 3; ca tối 4 người |
| Đêm | 23h-6h | Chỉ tầng 1-2 hoạt động; 2 nhân viên |
| Giờ làm đêm theo luật | 22h-6h | Tính lương đêm (hiển thị ở ca làm việc) |
| Thấp điểm của phòng họp | Sau 23h và buổi sáng 6h-11h \[MĐ\] | Giảm giá phòng |
| Combo đêm | 23h-7h | Mua và dùng gói đêm |

## **5\. Module chức năng**

Mỗi module gồm: mục đích, màn hình, chức năng, quy tắc, cách mô phỏng và tiêu chí nghiệm thu. Các quy tắc chi tiết nằm ở mục 6\.

### **M1. Bảng điều khiển demo (GĐ1)**

**Mục đích:** để giảng viên và nhóm xem được mọi tình huống của kế hoạch (mùa thi, hè, Tết, đêm, sự cố) mà không phải chờ.

**Màn hình:** bảng điều khiển nổi, thu gọn được, bật bằng nút ở footer hoặc ?demo=1. Mặc định bật.

**Chức năng:**

1. **Đặt giờ hệ thống:** chọn ngày giờ; nút nhanh “9h sáng”, “20h cao điểm”, “2h đêm”; tua nhanh x1, x10, x60; tạm dừng.  
2. **Chọn mùa:** Mùa học, Mùa thi, Hè, Tết. Mùa quyết định chỉ số khách (mục 8\) và việc có hiện chương trình hè hay không.  
3. **Chọn kịch bản khách:** Thấp (60 khách/ngày), Cơ sở (100), Cao (140). Hệ thống tạo khách giả đang ngồi trong quán tương ứng với giờ hiện tại.  
4. **Thao tác nhanh với khách giả:** “Thêm 10 khách”, “Làm đầy tầng 1-2 đến 90%”, “Xóa hết khách giả”.  
5. **Giả lập sự cố:** bật hoặc tắt “Web và cổng thanh toán gián đoạn” (kích hoạt chế độ dự phòng ở M11); “Lần thanh toán tiếp theo thất bại”.  
6. **Đăng nhập nhanh** bảy tài khoản demo (mục 3.2).  
7. **Đặt lại dữ liệu demo**; xuất và nhập trạng thái dạng JSON (tùy chọn).  
8. **Nhật ký sự kiện:** danh sách những việc hệ thống tự làm (tự mở tầng 3, tự hủy đặt phòng, tự cảnh báo...).

**Nghiệm thu:** đặt giờ 19h30 thì tầng 3 hiện “mở chỗ tự do”; đặt 2h thì tầng 3 đóng chỗ tự do và sơ đồ chỉ còn tầng 1-2; chọn kịch bản Cao thì sơ đồ chỗ ngồi chuyển sang mức đông; bật sự cố thì nhân viên thấy chế độ dự phòng.

### **M2. Trang công khai (GĐ1)**

**Mục đích:** giới thiệu quán và bán gói, không cần đăng nhập.

**Trang và nội dung:**

| Tệp | Nội dung |
| :---- | :---- |
| index.html | Hero (slogan, nút Đặt lịch và Xem combo); số liệu nổi bật (24/7, 300 m², khoảng 80 chỗ, 4 phòng họp đến 20 người); 6 điểm mạnh; **widget mức độ đông theo tầng cập nhật theo thời gian mô phỏng**; gallery không gian; bản xem trước bảng giá; lời kêu gọi hành động |
| gioi-thieu.html | Sứ mệnh, tầm nhìn, giá trị cốt lõi (giá minh bạch, yên tĩnh, an toàn, cộng đồng), khách hàng mục tiêu |
| bang-gia.html | Gói chỗ ngồi, khối so sánh Combo Trọn Ngày, phòng họp, in ấn và văn phòng phẩm, menu, ghi chú nước lọc miễn phí |
| phong-hop.html | Danh sách 4 phòng: ảnh, sức chứa, thiết bị, giá, nút Đặt phòng (dẫn tới dat-phong.html?phong=...) |
| quy-tac.html | Quy tắc quán: giữ yên lặng ở khu học; gọi điện ở khu riêng hoặc trong phòng; không để đồ giữ chỗ khi vắng quá 30 phút |
| cong-dong.html | Chương trình tích điểm, bảng vinh danh tháng và năm, ưu đãi CLB |
| tuyen-dung.html | Vị trí tuyển (phục vụ, pha chế, nhân viên đa năng), ca làm, mức lương tham khảo, form ứng tuyển giả |
| gop-y.html | Form góp ý (xem M10) |
| lien-he.html | Địa chỉ giả định khu Trịnh Văn Bô, giờ mở cửa từng tầng, mạng xã hội |
| dieu-khoan.html, chinh-sach-hoan-coc.html, chinh-sach-bao-mat.html | Ba trang chính sách; chính sách hoàn cọc lấy đúng quy tắc ở mục 6 |

**Quy tắc:** mọi giá hiển thị đọc từ cấu hình; nhãn PHỔ BIẾN lấy từ trường nhãn của gói; khối so sánh Combo Trọn Ngày tự tính.

**Nghiệm thu:** đổi giá gói ở Admin thì trang giá và khối so sánh đổi theo; trang hiển thị tốt ở 360 px.

### **M3. Tài khoản và hồ sơ (GĐ1)**

**Mục đích:** một tài khoản dùng cho mọi dịch vụ của quán.

**Màn hình:** dang-ky.html, dang-nhap.html, quen-mat-khau.html (giả: hiện thông báo “đã gửi email giả”), tai-khoan.html (tổng quan; các tab chọn bằng ?tab= gồm ho-so, giao-dich, diem, dat-phong, thong-bao).

**Chức năng:**

1. Đăng ký bằng email hoặc số điện thoại, họ tên, mật khẩu; chọn loại khách (sinh viên hoặc đi làm); trường hoặc đơn vị (tùy chọn); CLB (tùy chọn, gửi yêu cầu duyệt ưu đãi, xem M13).  
2. Đăng nhập, đăng xuất, đăng nhập nhanh tài khoản demo.  
3. Trang tổng quan: phiên đang ngồi (nếu có) với đồng hồ đếm giờ và giờ còn lại; tổng giờ tích lũy; voucher; đặt phòng sắp tới; đơn gần đây.  
4. Hồ sơ: sửa họ tên, loại khách, đơn vị; bật hoặc tắt “ẩn tên khỏi bảng vinh danh”; xóa tài khoản (demo xóa khỏi store).  
5. Mã khách dạng LM-000123 để nhân viên tra cứu nhanh.  
6. Hộp thông báo (biểu tượng chuông): xác nhận đặt phòng, nhắc lịch, thanh toán, voucher mới, đơn đồ sẵn sàng.

**Quy tắc:** chỉ lưu thông tin tối thiểu (họ tên, liên hệ, loại khách, đơn vị tùy chọn); không lưu thông tin thẻ hay ngân hàng; email và số điện thoại không được trùng; số điện thoại Việt Nam gồm 10 chữ số bắt đầu bằng 0; mật khẩu chỉ là mật khẩu giả cho demo.

**Nghiệm thu:** đăng ký tài khoản mới thì tải lại trang vẫn còn đăng nhập; đăng ký trùng email báo lỗi bằng tiếng Việt; tài khoản Hà (khách mới) có trang tổng quan rỗng nhưng không lỗi.

### **M4. Check-in, check-out QR và sơ đồ chỗ ngồi (GĐ1)**

**Mục đích:** tính giờ ngồi chính xác và cho khách thấy chỗ trống ngay trên web. Đây là điểm khác biệt so với đối thủ, nơi khách phải nhắn tin hỏi quán có đông không.

**Màn hình:** checkin.html (trang đích khi quét QR, nhận tham số ?tang= và \&ban=), so-do-cho.html (công khai, theo tầng), demo-qr.html (danh sách QR giả của từng tầng và bàn), widget mức độ đông ở trang chủ.

**Chức năng:**

1. **Check-in:** khách đăng nhập, chọn gói (hoặc dùng voucher), thanh toán (M6), hệ thống bắt đầu tính giờ và gán chỗ (tầng, bàn).  
2. **Đồng hồ phiên:** giờ bắt đầu, giờ kết thúc dự kiến, giờ còn lại; cảnh báo khi còn 15 phút; nút “Mua thêm giờ” và nút Check-out.  
3. **Check-out:** bằng quét QR hoặc bấm nút; hiện tóm tắt gồm giờ thực tế, giờ cộng vào tích điểm, tiền vượt giờ nếu có.  
4. **Sơ đồ chỗ:** mỗi tầng hiện số chỗ trống trên tổng, thanh màu theo mức độ đông, lưới bàn (trống, có người, tạm rời); tầng 3 hiện rõ trạng thái “Mở chỗ tự do”, “Chỉ phòng họp” hoặc “Đóng”.  
5. **Mức độ đông** tính theo công suất chỗ tự do đang mở: Vắng (dưới 30%), Vừa (30-60%), Đông (60-85%), Gần kín (trên 85%) \[MĐ\]. Hiện theo từng tầng và tổng.  
6. **Tạm rời và vắng mặt:** khách bấm “Tạm rời” hoặc nhân viên đánh dấu vắng; sau 30 phút hệ thống cảnh báo nhân viên; nhân viên có thể giải phóng chỗ. Giờ gói vẫn chạy trong lúc tạm rời.  
7. Mỗi khách chỉ có một phiên đang hoạt động tại một thời điểm.  
8. **Nhập mã tay:** ô nhập mã tầng hoặc bàn khi không quét được QR.

**Quy tắc chính (chi tiết ở mục 6):** tầng 3 mở chỗ tự do trong 19h-23h hoặc khi công suất tầng 1-2 vượt 85%; 23h-6h chỉ tầng 1-2; giờ chỉ được tính khi check-in bằng QR và có gói hợp lệ; gói đêm chỉ check-in trong 23h-7h; vượt giờ tính phụ phí theo quy tắc ở mục 6\.

**Mô phỏng:** quét QR bằng nút “Mô phỏng quét mã”; dữ liệu kích thước sơ đồ lấy từ mục 4.1.

**Nghiệm thu:** đặt giờ 20h, tầng 3 mở và hiện 22 chỗ; đặt giờ 14h với tầng 1-2 còn nhiều chỗ, tầng 3 chỉ phòng họp; làm đầy tầng 1-2 trên 85% thì tầng 3 tự mở chỗ tự do và nhật ký demo ghi lại sự kiện; check-in rồi check-out sau 40 phút với gói 1 giờ thì không có phụ phí; check-out sau 1 giờ 50 phút thì có phụ phí đúng quy tắc.

### **M5. Đặt phòng họp (GĐ1)**

**Mục đích:** khách tự đặt, cọc và hủy phòng mà nhân viên không phải xử lý tay.

**Màn hình:** dat-phong.html (lịch và bộ lọc; chi tiết một phòng qua ?phong=r35), tai-khoan.html?tab=dat-phong (đặt của tôi, hủy).

**Chức năng:**

1. **Lịch theo ngày và tuần:** hàng là giờ, cột là phòng; ô trống bấm chọn được; ô đã đặt hiển thị xám; mặc định theo đồng hồ mô phỏng.  
2. **Chọn đặt:** phòng, ngày, giờ bắt đầu và kết thúc (bước 30 phút, tối thiểu 1 giờ \[MĐ\]), số người (kiểm tra theo sức chứa), ghi chú.  
3. **Tính giá tức thì:** giá chuẩn nhân số giờ, trừ giảm giá giờ thấp điểm hoặc giảm giá CLB, hiện rõ cọc và tổng tiền.  
4. **Cọc bằng QR giả** (M6). Phòng được giữ tạm 10 phút trong lúc thanh toán; hết hạn thì tự nhả phòng. Đặt thành công chỉ khi cọc đã thanh toán.  
5. **Không đặt trùng:** kiểm tra chồng lịch ở phía xử lý, không chỉ ở giao diện.  
6. **Xác nhận:** mã đặt phòng, mã QR phòng (giả), thông báo trong ứng dụng, nhắc lịch trước 30 phút.  
7. **Hủy:** trước khi xác nhận hiển thị rõ chính sách hoàn cọc (còn từ 2 giờ trở lên: hoàn cọc; ít hơn 2 giờ: mất cọc). Hệ thống áp dụng tự động và ghi giao dịch hoàn.  
8. **Không đến:** quá 15 phút sau giờ bắt đầu mà chưa check-in phòng thì trạng thái “Không đến” và mất cọc \[MĐ\]; nhân viên có thể bỏ qua trong trường hợp đặc biệt.  
9. **Sử dụng phòng:** check-in phòng bằng QR phòng hoặc nhân viên bấm; khi kết thúc, số tiền còn lại bằng tổng tiền trừ cọc.  
10. **Thêm đồ uống vào phòng:** nút dẫn tới M8, đơn gắn với mã đặt phòng.  
11. **Hiển thị lưu ý ở tầng 3:** ngoài giờ cao điểm, chỉ phòng họp mở, chỗ ngồi tự do đóng.

**Không cần duyệt:** đặt phòng không cần báo trước và không cần quản lý duyệt, chỉ bắt buộc cọc (đúng kế hoạch).

**Nghiệm thu (ví dụ có số liệu):**

* Phòng 15-20 người, 2 giờ lúc 14h-16h: tổng 320.000đ, cọc 160.000đ.  
* Phòng 3-5 người, 2 giờ lúc 7h-9h (thấp điểm, giảm 10%): tổng 108.000đ, cọc 60.000đ.  
* Khách CLB đặt phòng 7-10 người, 1 giờ lúc 14h: 90.000đ trừ 10% \= 81.000đ. Nếu trùng thấp điểm thì chỉ áp một mức giảm, không cộng dồn \[MĐ\].  
* Hai người đặt cùng phòng, cùng giờ: người sau bị báo “Phòng đã có người đặt”.  
* Hủy lúc còn 3 giờ thì hoàn cọc; hủy lúc còn 1 giờ thì mất cọc.

### **M6. Thanh toán QR giả và lịch sử giao dịch (GĐ1)**

**Mục đích:** một luồng thanh toán dùng chung cho mọi dịch vụ, có thể mô phỏng cả trường hợp lỗi.

**Chức năng:**

1. **Màn hình thanh toán dùng chung:** tóm tắt đơn (tên, số tiền), mã QR giả, nội dung chuyển khoản là mã đơn, đồng hồ đếm ngược 10 phút, hai nút mô phỏng “Đã chuyển khoản” và “Thất bại”. Kết quả cập nhật ngay.  
2. **Loại giao dịch:** Mua gói, Gia hạn, Phụ phí vượt giờ, Cọc phòng, Tiền phòng còn lại, Đồ uống và đồ ăn, In ấn, Văn phòng phẩm, Thẻ tháng, Hoàn cọc.  
3. **Trạng thái:** Chờ thanh toán, Đã thanh toán, Thất bại, Hết hạn, Đã hoàn, Mất cọc.  
4. **Lịch sử giao dịch của khách:** lọc theo loại và tháng; xem hóa đơn đơn giản, in bằng chức năng in của trình duyệt.  
5. **Đối soát cho quản lý:** tổng thu theo ngày và theo loại; phí cổng thanh toán 1% tính tự động; tiền cọc đang giữ; danh sách giao dịch thất bại.  
6. **Hoàn cọc mô phỏng:** chỉ ghi một giao dịch hoàn, không có tiền thật.

**Quy tắc:** số tiền làm tròn đến đồng; mỗi đơn chỉ thanh toán thành công một lần (bấm hai lần không tạo hai giao dịch); đơn hết hạn không thanh toán được; nội dung QR là chuỗi giả dạng LUMEN24\|mã đơn\|số tiền, ghi rõ trên màn hình rằng đây không phải mã ngân hàng; khi bật “Web hoặc cổng thanh toán gián đoạn” thì đơn mới chuyển sang quy trình thủ công của M11.

**Nghiệm thu:** bấm “Thất bại” thì đơn không được xác nhận và khách thử lại được; bấm “Đã chuyển khoản” hai lần chỉ ghi một giao dịch; báo cáo đối soát có dòng phí 1%.

### **M7. Tích điểm và bảng vinh danh (GĐ2)**

**Mục đích:** giữ chân khách bằng giờ ngồi tích lũy và thi đua lành mạnh, thay cho việc đếm tay.

**Chức năng:**

1. **Giờ tích lũy:** cộng từ các phiên đã check-out hợp lệ. Combo Trọn Ngày cộng cố định 10 giờ.  
2. **Mốc thưởng:** mỗi lần đạt thêm 100 giờ tích lũy (100, 200, 300...) tặng 1 voucher Combo Trọn Ngày \[MĐ: giờ không bị trừ sau khi nhận voucher\]. Voucher hiện trong tài khoản, có mã, dùng khi check-in với giá 0đ, hạn dùng 90 ngày \[MĐ\].  
3. **Thanh tiến độ** tới mốc kế tiếp (ví dụ 88/100 giờ).  
4. **Bảng vinh danh:** top 3 theo tháng (tháng này và tháng trước) và top 3 theo năm; hiện tên, số giờ, huy hiệu; tính tự động. Khách đã chọn ẩn tên hiện là “Thành viên ẩn danh”. Số giờ bằng nhau thì ai đạt trước xếp trước.  
5. **Trang cong-dong.html:** bảng vinh danh, mô tả chương trình và quà (giải tháng khoảng 1 triệu, giải năm 3-5 triệu theo kế hoạch), ưu đãi CLB.  
6. **Nhân viên và quản lý:** xem danh sách top và đánh dấu “đã trao quà”.

**Quy tắc:** giờ chỉ tính khi check-in bằng QR và có gói hợp lệ (đúng kế hoạch, để tránh để đồ giữ chỗ); giờ tính theo thời gian ngồi thực tế, tối đa bằng thời lượng gói đã mua cộng giờ vượt đã trả; phiên bị hủy hoặc thanh toán thất bại không tính.

**Nghiệm thu:** tài khoản Minh Anh có 88 giờ; sau một phiên Combo Trọn Ngày (cộng 10 giờ) thì đạt 98 giờ chưa có voucher; thêm một phiên 3 giờ thì vượt 100 giờ và nhận 1 voucher; bật ẩn tên thì tên biến khỏi bảng vinh danh nhưng giờ vẫn được tính.

### **M8. Đặt đồ uống, đồ ăn tại bàn và màn hình bar (GĐ2)**

**Mục đích:** giảm việc cho nhân viên, nhất là ca đêm, nhờ khách đặt và thanh toán trước.

**Màn hình khách:** dat-do.html (menu, giỏ hàng, thanh toán), dat-do.html?tab=don-cua-toi (theo dõi trạng thái).

**Màn hình nhân viên:** màn hình bar trong khu nhân viên (M11).

**Chức năng cho khách:**

1. Menu theo nhóm (đồ uống, ăn nhẹ), tìm kiếm, giỏ hàng, ghi chú cho từng món.  
2. Vị trí giao: mặc định lấy từ phiên check-in (tầng và bàn); với khách phòng họp thì chọn phòng.  
3. Thanh toán trước bằng QR giả (M6).  
4. Theo dõi trạng thái: Mới, Đang pha, Sẵn sàng, Đã giao, Đã hủy; thông báo trong ứng dụng khi sẵn sàng.  
5. **Quà tặng kèm gói:** gói 3, 6, 9 giờ có 1 trà túi lọc hoặc nước pha sẵn; gói 9 giờ thêm 1 đồ ăn nhẹ; Combo Trọn Ngày có 1 đồ uống trong menu. Hiện mục “Quà tặng chưa nhận”, khi nhận thì đơn có dòng 0đ và chỉ nhận một lần cho mỗi gói.  
6. **Nước lọc miễn phí:** nút “Gọi nước lọc” không tính tiền.

**Chức năng cho bar:** danh sách đơn theo thứ tự thời gian; bấm để đổi trạng thái; đơn mới nổi bật kèm âm báo; đếm số đơn đang chờ; đánh dấu đơn của ca đêm; xem ghi chú và vị trí.

**Quy tắc:** giá đọc từ menu; Admin đánh dấu món “hết hàng” thì khách không đặt được; chỉ hủy đơn khi trạng thái còn là Mới; đơn của khách phòng họp gắn mã đặt phòng để tính doanh thu đồ uống phòng họp; đơn trên 150.000đ hiện cảnh báo xác nhận \[MĐ\]; phí thanh toán 1% ghi ở đối soát.

**Nghiệm thu:** khách Combo Trọn Ngày đặt 1 đồ uống thì dòng quà tặng ghi 0đ, đặt lần hai thì tính tiền; bar đổi trạng thái thì khách thấy thay đổi trong vòng vài giây ở tab khác; món hết hàng bị khóa nút thêm vào giỏ.

### **M9. In ấn từ web (GĐ3)**

**Mục đích:** khách chạy deadline gửi file và in ngay, không cần nhân viên nhập tay.

**Màn hình:** in-an.html (khách); hàng đợi in nằm ở màn hình nhân viên (M11).

**Chức năng:**

1. **Tải file:** chọn PDF, DOC, DOCX hoặc ảnh (tối đa 20 MB \[MĐ\]). Hệ thống mô phỏng không đọc nội dung file; khách nhập số trang (mặc định gợi ý 10).  
2. **Tùy chọn:** số bản, một mặt hoặc hai mặt; chỉ in đen trắng khổ A4.  
3. **Tính giá tức thì** theo quy tắc ở mục 6.5, hiện rõ số tờ, số tờ miễn phí, đơn giá và tổng tiền.  
4. **Thêm văn phòng phẩm** vào cùng đơn (bút, kẹp, giấy note, file, pin).  
5. **Thanh toán QR giả** (M6); sau đó đơn vào hàng đợi in với trạng thái Chờ in, Đang in, Hoàn tất hoặc Lỗi.  
6. **Thông báo** trong ứng dụng khi in xong: “Nhận tại quầy tầng 1”.  
7. **Lỗi in:** nhân viên đánh dấu lỗi (hết giấy, kẹt giấy), chọn in lại miễn phí hoặc hoàn tiền; khách nhận thông báo.

**Mô phỏng máy in:** hàng đợi tự chuyển trạng thái sau vài giây (có thể tắt để nhân viên bấm tay); nút “Giả lập lỗi máy in” ở bảng điều khiển demo.

**Nghiệm thu:** 30 tờ không có combo là 30.000đ; 60 tờ không có combo là 42.000đ; 60 tờ có Combo Trọn Ngày (miễn phí 10 tờ, còn 50 tờ tính tiền) là 35.000đ; 55 tờ có combo (còn 45 tờ tính tiền) là 45.000đ.

### **M10. Góp ý và phản ánh (đơn giản ở GĐ1, đầy đủ ở GĐ3)**

**Mục đích:** thu phản hồi để kiểm tra giả định của kế hoạch và cải tiến dịch vụ.

**Khách:** gop-y.html có đánh giá 1-5 sao, chọn chủ đề (không gian và yên tĩnh, dịch vụ, giá, phòng họp, vệ sinh, an ninh, khác), nội dung, tùy chọn “Đây là khiếu nại”, tùy chọn gửi ẩn danh. Gửi được cả khi chưa đăng nhập. Sau khi check-out, hệ thống gợi ý đánh giá nhanh.

**Quản lý:** danh sách góp ý có bộ lọc theo sao, chủ đề, trạng thái; gắn nhãn Mới, Đang xử lý, Đã xử lý; ghi chú nội bộ; điểm hài lòng trung bình theo tháng; tỷ lệ khiếu nại.

**Quy tắc:** khiếu nại là đánh giá 1-2 sao hoặc có tick “Đây là khiếu nại” \[MĐ\]; tỷ lệ khiếu nại bằng số khiếu nại chia số lượt khách trong tháng \[MĐ\]. Mục tiêu hiển thị ở dashboard: điểm từ 4,5 trở lên, khiếu nại dưới 2%.

**Nghiệm thu:** gửi góp ý 5 sao thì điểm trung bình thay đổi ở dashboard; gửi khiếu nại thì hiện trong danh sách với nhãn Mới.

### **M11. Màn hình nhân viên và chế độ dự phòng (GĐ1)**

**Màn hình:** nhan-vien.html có các tab:

| Tab | Nội dung |
| :---- | :---- |
| Khách đang ngồi | Theo từng tầng; tìm theo mã hoặc tên; check-in và check-out hộ khách; đánh dấu vắng; giải phóng chỗ |
| Đặt phòng hôm nay | Lịch phòng trong ngày; check-in phòng; đánh dấu không đến |
| Đơn đồ uống | Màn hình bar của M8 |
| Hàng đợi in | Đơn in của M9, đổi trạng thái, báo lỗi |
| Cảnh báo ca | Khách vắng trên 30 phút, tầng 1-2 sắp đầy, phòng sắp hết giờ, tầng 3 vừa tự mở hoặc đóng |
| Giao ca | Ca hiện tại theo đồng hồ mô phỏng; checklist vệ sinh theo giờ, kiểm kho, kiểm máy in; biên bản giao ca (ghi chú, sự cố) lưu và xem lại |
| Chế độ dự phòng | Mô tả bên dưới |

**Ca làm việc theo kế hoạch:** sáng 6h-13h (2 người), chiều 13h-19h (2 người), tối 19h-23h (4 người), đêm 23h-6h (2 người). Hiển thị số người đang đăng nhập so với số cần có; **cảnh báo cho quản lý nếu ca đêm chỉ có một người** (kế hoạch quy định không để một người trực đêm một mình) \[MĐ\].

**Chế độ dự phòng** (bật khi “Web hoặc cổng thanh toán gián đoạn”):

1. Banner đỏ trên mọi màn hình nhân viên.  
2. Hiện **mã QR cố định của quán** thay cho QR từng đơn.  
3. **Sổ ghi giờ vào:** form nhập tay gồm mã hoặc tên khách, giờ vào, gói, ghi chú; bản ghi gắn nhãn “nhập bổ sung”.  
4. Khi hết sự cố, nhân viên rà các bản ghi nhập bổ sung và xác nhận; hệ thống tạo phiên và giao dịch tương ứng, đưa vào lịch sử khách.  
5. Gửi thông báo cho khách bị ảnh hưởng; nhân viên chọn hoàn giờ hoặc tặng bù.

**Quy tắc:** nhân viên không sửa được bảng giá và không xem báo cáo tài chính; thao tác của nhân viên đều ghi nhật ký.

**Nghiệm thu:** bật sự cố thì mọi màn hình nhân viên hiện banner và tab dự phòng; nhập tay một khách rồi xác nhận thì xuất hiện phiên trong lịch sử của khách đó.

### **M12. Dashboard, cảnh báo và báo cáo cho quản lý (bản sơ khai GĐ1, đầy đủ GĐ3)**

**Màn hình:** quan-ly.html (dashboard), quan-ly-canh-bao.html, quan-ly-bao-cao.html.

**Bảng chỉ số** (theo mục 9.1 của kế hoạch), mỗi chỉ số có đèn xanh, vàng, đỏ:

| Chỉ số | Cách tính | Tần suất | Ngưỡng cảnh báo |
| :---- | :---- | :---- | :---- |
| Khách ngồi mỗi ngày | Số khách có check-in mỗi ngày, trung bình 14 ngày | Hằng tuần | Dưới 70, dưới 55, dưới 45 |
| Doanh thu so với kế hoạch | Doanh thu thực chia mục tiêu theo mùa | Hằng tuần | Dưới 80% |
| Công suất chỗ ngồi theo khung giờ | Số khách đồng thời chia số chỗ đang mở | Hằng tuần | Trên 85% (mở tầng 3); dưới 20% kéo dài |
| Giờ phòng họp được thuê mỗi ngày | Tổng giờ đã dùng của 4 phòng | Hằng tuần | Dưới 8 giờ |
| Tỷ lệ chọn Combo Trọn Ngày | Số combo chia số lượt mua gói | Hằng tháng | Dưới 10% hoặc trên 30% |
| Điện tiêu thụ (kWh/ngày) | Quản lý nhập tay hằng tuần | Hằng tuần | Tăng trên 10% khi điều kiện không đổi |
| Điểm hài lòng và số góp ý | Trung bình số sao (M10) | Hằng tháng | Dưới 4,5/5 |
| Quỹ dự phòng | Quản lý nhập tay hằng tháng | Hằng tháng | Dưới 75 triệu |

**Thành phần dashboard:**

1. Thẻ tổng quan: khách hôm nay, doanh thu hôm nay, công suất hiện tại, số cảnh báo đang mở.  
2. Biểu đồ khách theo giờ (hôm nay), theo ngày (30 ngày), theo tháng (12 tháng), có vạch **điểm hòa vốn 50-60 khách mỗi ngày**.  
3. Doanh thu theo nguồn: gói và combo, đồ uống và ăn nhẹ, thuê phòng họp, đồ uống của khách phòng họp, in ấn và văn phòng phẩm, khác.  
4. Tỷ lệ chọn từng gói; giờ phòng họp theo phòng.  
5. **Mô hình lợi nhuận hoạt động ước tính:** doanh thu trừ chi phí biến đổi trừ chi phí cố định (chi phí cố định mặc định 144 triệu mỗi tháng, chỉnh được ở Admin), hiển thị biên lợi nhuận so với mục tiêu từ 25%.  
6. Khối “Mục tiêu năm đầu”: 70 khách mỗi ngày trong tháng đầu và 100 khách từ tháng thứ 3; 800 thành viên cuối năm; 12 giờ phòng họp mỗi ngày từ tháng thứ 3; tiền điện không quá 9% doanh thu; điểm hài lòng từ 4,5; khiếu nại dưới 2%.  
7. So sánh với ba kịch bản của kế hoạch (thấp 60, cơ sở 100, cao 140 khách mỗi ngày).

**Cảnh báo tự động và ba cấp ứng phó:**

| Cấp | Dấu hiệu | Gợi ý hệ thống hiển thị | Tác động ước tính |
| :---- | :---- | :---- | :---- |
| 1 | Doanh thu 80-100% kế hoạch | Ưu đãi mùa thi, thẻ thành viên, tăng đặt phòng từ CLB, thử điều chỉnh giá combo | Chủ yếu giữ doanh thu |
| 2 | 60-80% kế hoạch trong 4 tuần liên tiếp (dưới khoảng 70 khách mỗi ngày) | Lịch ca mùa hè (khoảng 10 triệu), điều hòa theo vùng (khoảng 5), cắt marketing trả phí (khoảng 8\) | Tiết kiệm khoảng 22 triệu mỗi tháng |
| 3 | Dưới 60% trong 2-3 tháng (dưới 45-50 khách mỗi ngày) | Cho thuê phòng cố định cho lớp học và gia sư (khoảng 10), thương lượng giảm thuê (2-4), rút giờ mở cửa nếu lợi nhuận gộp ca đêm thấp hơn khoảng 17 triệu | Thêm khoảng 16 triệu mỗi tháng trở lên |

**Điểm dừng lỗ:** sau 6 tháng quán vẫn dưới 45 khách mỗi ngày hoặc quỹ dự phòng dưới 50 triệu thì hiện banner đề nghị thu hẹp quy mô hoặc đổi mô hình.

**Báo cáo:** xuất CSV cho giao dịch, phiên ngồi, đặt phòng, chỉ số; xuất báo cáo tuần và tháng dạng trang in (dùng chức năng in thành PDF của trình duyệt).

**Quy tắc:** cảnh báo tính theo dữ liệu và đồng hồ mô phỏng; mỗi cảnh báo có trạng thái Mới, Đã xem, Đã xử lý và ghi chú của quản lý; không tạo lại cùng một cảnh báo trong cùng một chu kỳ.

**Nghiệm thu:** chọn mùa Hè và kịch bản Thấp thì dashboard hiện cảnh báo cấp 2 hoặc 3 kèm gợi ý đúng bảng trên; chọn mùa Học và kịch bản Cơ sở thì lợi nhuận hoạt động ước tính quanh 99 triệu mỗi tháng.

### **M13. Quản trị cấu hình (GĐ1)**

**Màn hình:** quan-ly-cau-hinh.html (chỉ quản lý).

**Chức năng:**

1. **Bảng giá và gói:** sửa giá, nội dung kèm theo, nhãn, bật hoặc tắt từng gói.  
2. **Phòng họp:** giá, sức chứa, thiết bị, ngưng hoạt động.  
3. **Menu:** thêm, sửa món; đánh dấu hết hàng.  
4. **Quy tắc:** giờ cao điểm, giờ thấp điểm, phần trăm giảm thấp điểm và giảm CLB, tiền cọc (số giờ), hạn hủy hoàn cọc (giờ), thời gian chờ không đến (phút), ngưỡng 85% để mở tầng 3, ngưỡng cảnh báo.  
5. **Duyệt CLB:** danh sách yêu cầu ưu đãi, duyệt hoặc từ chối, ghi điều kiện truyền thông (1 bài đăng trên fanpage của CLB cho mỗi đợt, gắn tag quán), đánh dấu đã đăng. Không đặt việc đánh giá trên Google Maps làm điều kiện ưu đãi.  
6. **Chế độ mùa hè** (công tắc): bật thì hiện Thẻ tháng hè 1.090.000đ (6 giờ mỗi ngày trong 26 ngày, giới hạn 20 suất \[MĐ\]), happy hour ban ngày 9h-15h giảm đồ uống \[MĐ 10%\], tích điểm nhân đôi cho giờ ngồi ban ngày, thuê phòng theo gói 10 buổi.  
7. **Thẻ tháng thường** (công tắc): kế hoạch ra mắt sau 6 tháng hoạt động.  
8. **Nhập liệu tay:** số điện (kWh) hằng tuần, quỹ dự phòng hằng tháng, chi phí cố định và biến đổi.  
9. **Voucher:** tạo, thu hồi. **Tài khoản:** đổi vai trò, khóa.  
10. **Nhật ký thay đổi:** ghi người sửa, thời điểm, giá trị cũ và mới.

**Quy tắc:** thay đổi giá chỉ áp dụng cho đơn mới, đơn cũ giữ giá lúc đặt; mọi thay đổi cấu hình có ghi nhật ký.

**Nghiệm thu:** đổi giá combo từ 89.000đ sang 79.000đ thì trang giá, khối so sánh và check-in đều dùng 79.000đ, đơn đã tạo trước đó vẫn giữ 89.000đ.

## **6\. Quy tắc nghiệp vụ tổng hợp**

Mọi quy tắc dưới đây được cài trong js/rules.js và có ví dụ kiểm thử chạy trên trang test.html.

### **6.1 Tầng và chỗ ngồi**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R01 | Tầng 1 và tầng 2 mở 24/7 | Lúc 3h sáng vẫn check-in được ở tầng 1 và 2 |
| R02 | Chỗ tự do tầng 3 mở khi 19h đến trước 23h; ngoài khung đó, chỉ mở khi trong khoảng 6h-23h công suất tầng 1-2 vượt 85% (từ 50 khách trở lên trong 58 chỗ); tự đóng lại khi công suất tầng 1-2 xuống dưới 70% \[MĐ\] | 14h, tầng 1-2 có 50 khách thì tầng 3 mở; xuống 40 khách thì đóng |
| R03 | 23h-6h chỉ tầng 1-2 hoạt động; chỗ tự do tầng 3 đóng dù tầng 1-2 đầy; phòng họp tầng 3 vẫn đặt được | 2h sáng, tầng 1-2 đầy thì tầng 3 vẫn đóng |
| R04 | Công suất bằng số khách đang ngồi chia số chỗ đang mở; mức đông: Vắng dưới 30%, Vừa 30-60%, Đông 60-85%, Gần kín trên 85% \[MĐ\] | 20 trên 80 chỗ là 25%, Vắng |
| R05 | Mỗi khách chỉ có một phiên đang hoạt động | Check-in lần hai khi đang ngồi bị từ chối |

### **6.2 Gói chỗ ngồi và giờ**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R06 | Gói 1, 3, 6, 9 giờ dùng liên tục kể từ lúc check-in và hết hạn khi hết số giờ; không chia nhiều lần trong ngày; ra khỏi quán giờ vẫn chạy \[MĐ\] | Gói 3 giờ check-in 14h00, hết hạn 17h00 |
| R07 | Combo đêm: chỉ mua và check-in từ 23h đến 6h, hết hiệu lực lúc 7h \[MĐ\] | Check-in 22h30 bị từ chối; 23h30 được, hết hạn 7h |
| R08 | Combo Trọn Ngày: hiệu lực từ check-in đến check-out nhưng tối đa 24 giờ \[MĐ\]; kèm 1 đồ uống một lần, 10 tờ in miễn phí, cộng cố định 10 giờ tích điểm | Check-in 8h thứ Hai thì hết hạn 8h thứ Ba |
| R09 | Vượt giờ: có 10 phút ân hạn; sau đó tính phụ phí 12.000đ cho mỗi giờ hoặc phần của giờ, làm tròn lên \[MĐ\] | Gói 1 giờ, check-out sau 1 giờ 08 phút: 0đ; sau 1 giờ 25 phút: 12.000đ; sau 2 giờ 15 phút: 24.000đ |
| R10 | Gia hạn: mua thêm gói bất kỳ khi đang ngồi, nối tiếp gói hiện tại | Còn 10 phút mua thêm gói 3 giờ thì hạn mới cộng 3 giờ |
| R11 | Giờ chỉ được tính vào tích điểm khi check-in bằng QR và có gói hợp lệ | Nhân viên nhập tay trong chế độ dự phòng thì sau khi xác nhận mới cộng giờ |
| R12 | Vắng mặt quá 30 phút: cảnh báo nhân viên; nhân viên có thể giải phóng chỗ; giờ vẫn chạy \[MĐ\] | Tạm rời lúc 15h00, 15h31 có cảnh báo |

### **6.3 Phòng họp**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R13 | Giá bằng tổng giá từng khung 30 phút nhân (1 trừ mức giảm của khung đó) | Đặt 22h30-23h30: nửa giờ giá chuẩn, nửa giờ giá thấp điểm |
| R14 | Giờ thấp điểm là 23h-6h và 6h-11h, giảm 10%; 11h-23h là giá chuẩn, kể cả giờ cao điểm 19h-23h \[MĐ\] | Phòng 3-5 người 7h-9h: 120.000đ trừ 10% là 108.000đ |
| R15 | Giảm giá CLB 10% cho tài khoản thuộc CLB đã duyệt; giảm giá không cộng dồn, lấy mức cao hơn \[MĐ\] | CLB đặt phòng 7-10 người lúc 8h: giảm 10%, không phải 20% |
| R16 | Cọc bằng giá chuẩn của phòng cho 1 giờ (không giảm); trừ vào tổng tiền khi sử dụng | Phòng 15-20 người: cọc 160.000đ; thuê 2 giờ 320.000đ thì còn thanh toán 160.000đ |
| R17 | Hủy trước giờ bắt đầu từ 2 giờ trở lên thì hoàn cọc; ít hơn 2 giờ hoặc không đến thì mất cọc | Hủy lúc còn 2 giờ 00 phút: hoàn; còn 1 giờ 59 phút: mất |
| R18 | Không đến: quá 15 phút sau giờ bắt đầu mà chưa check-in phòng \[MĐ\] | Đặt 14h00, đến 14h16 vẫn chưa vào: trạng thái Không đến |
| R19 | Không đặt trùng; giữ tạm 10 phút khi đang thanh toán cọc | Hai người cùng chọn một ô thì người sau bị báo phòng đã giữ |
| R20 | Đặt tối thiểu 1 giờ, bước 30 phút; đặt không cần báo trước và không cần duyệt nhưng bắt buộc cọc | Đặt ngay lúc này cho 5 phút sau vẫn được nếu cọc |
| R21 | Số người không vượt sức chứa tối đa của phòng | 12 người không đặt được phòng 7-10 người |

### **6.4 Tích điểm**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R22 | Đạt mỗi 100 giờ tích lũy (100, 200, 300...) tặng 1 voucher Combo Trọn Ngày; giờ không bị trừ \[MĐ\]; voucher có hạn 30 ngày \[MĐ\] | 99 giờ cộng 2 giờ thành 101 giờ thì nhận 1 voucher |
| R23 | Combo Trọn Ngày cộng cố định 10 giờ; gói khác cộng theo giờ ngồi thực tế, tối đa bằng thời lượng gói cộng giờ vượt đã trả | Gói 3 giờ ngồi 2 giờ cộng 2 giờ |
| R24 | Bảng vinh danh top 3 tháng và top 3 năm; bằng giờ thì ai đạt trước xếp trước; khách ẩn tên hiện là “Thành viên ẩn danh” | Hai người cùng 50 giờ thì người đạt 50 giờ sớm hơn xếp trên |

### **6.5 In ấn và văn phòng phẩm**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R25 | Một mặt: 1 trang là 1 tờ; hai mặt: 2 trang là 1 tờ (làm tròn lên) \[MĐ\]; số tờ bằng số tờ mỗi bản nhân số bản | 25 trang hai mặt, 2 bản: 13 nhân 2 bằng 26 tờ |
| R26 | Giảm 10 tờ miễn phí cho Combo Trọn Ngày đang hoạt động, mỗi combo một lần; đơn giá xác định theo số tờ còn phải trả | 60 tờ có combo: còn 50 tờ tính tiền |
| R27 | Đơn giá 1.000đ mỗi tờ; từ 50 tờ phải trả trở lên, toàn bộ số tờ tính 700đ mỗi tờ | 49 tờ: 49.000đ; 50 tờ: 35.000đ |
| R28 | Văn phòng phẩm cộng vào đơn theo giá niêm yết, không giảm giá | Bút bi 5.000đ cộng vào đơn 30 tờ là 35.000đ |

### **6.6 Thẻ tháng hè và ưu đãi mùa vụ**

| Mã | Quy tắc | Ví dụ kiểm thử |
| :---- | :---- | :---- |
| R29 | Thẻ tháng hè 1.090.000đ: hiệu lực 26 ngày liên tiếp kể từ ngày kích hoạt, mỗi ngày dùng 6 giờ, không cộng dồn; phụ phí vượt giờ theo R09 \[MĐ\]; giới hạn 20 suất; chỉ bán khi chế độ mùa hè bật | Mua lẻ gói 6 giờ 26 ngày là 1.430.000đ, thẻ rẻ hơn 340.000đ |
| R30 | Tích điểm nhân đôi cho giờ ngồi ban ngày khi chế độ mùa hè bật | 3 giờ ngồi ban ngày cộng 6 giờ |
| R31 | Happy hour ban ngày 9h-15h giảm 10% đồ uống khi chế độ mùa hè bật \[MĐ\] | Đồ uống 45.000đ lúc 10h còn 40.500đ |

## **7\. Mô hình dữ liệu (gợi ý cho AI)**

Các thực thể và trường chính. AI có thể thêm trường phụ nhưng không bỏ các trường dưới đây.

| Thực thể | Trường chính |
| :---- | :---- |
| User | id, code (LM-000123), name, contact, passwordDemo, role (guest, staff, manager), type (student, worker), org, clubId, hideOnBoard, totalHours, createdAt |
| Club | id, name, status (pending, approved, rejected), mediaCommitment, lastPostedAt |
| Package | id, name, price, hours, perks, tag, active, availableFrom, availableTo |
| Room | id, name, floor, capacityMin, capacityMax, pricePerHour, equipment, active |
| MenuItem | id, group (drink, snack), name, price, soldOut |
| Session | id, userId, packageId, floor, table, startAt, expectedEndAt, endAt, status (active, away, ended, cancelled), awaySince, hoursCredited, overtimeFee, source (qr, manual) |
| Booking | id, userId, roomId, startAt, endAt, people, basePrice, discount, total, deposit, status (holding, confirmed, checkedIn, completed, cancelled, noShow), cancelledAt, depositOutcome (held, refunded, forfeited) |
| Payment | id, type, refId, amount, fee, status, createdAt, expiresAt, paidAt |
| Voucher | id, userId, kind, code, issuedAt, expiresAt, usedAt |
| Order | id, userId, location, bookingId, items, total, status, createdAt, giftFlags |
| PrintJob | id, userId, fileName, pages, copies, duplex, sheets, freeSheets, total, status, error |
| Feedback | id, userId (có thể rỗng), stars, topic, content, isComplaint, status, note, createdAt |
| Alert | id, metric, level (1, 2, 3), message, status, note, createdAt |
| ShiftLog | id, shift, staffIds, checklist, note, incident, createdAt |
| ManualEntry | id, name, startAt, packageId, note, status (pending, confirmed) |
| Notification | id, userId, text, read, createdAt |
| EnergyReading | id, weekStart, kwh |
| DailyMetric | date, guests, revenueBySource, meetingHours, orders, sessionsByPackage |
| ConfigLog | id, who, at, key, oldValue, newValue |

## **8\. Dữ liệu giả (seed) bám theo kế hoạch**

Mục tiêu: mở ứng dụng lần đầu là thấy dashboard có số liệu hợp lý và khớp mô hình tài chính của kế hoạch.

### **8.1 Khách và tài khoản**

* 7 tài khoản demo ở mục 3.2.  
* Khoảng 120 khách giả sinh tự động (tên Việt ngẫu nhiên, 70% sinh viên, 30% đi làm), 800 thành viên là mục tiêu cuối năm đầu nên trên dashboard tiến độ hiển thị so với 800\.  
* 3 CLB: một đã duyệt, một đang chờ, một bị từ chối.

### **8.2 Chỉ số khách theo mùa (từ khai trương 18/11/2026)**

Chỉ số lấy 100% là mùa học bình thường, khoảng 100 khách mỗi ngày. Mỗi ngày thêm nhiễu ngẫu nhiên khoảng cộng trừ 8% (có hạt giống cố định để kết quả lặp lại được).

| Giai đoạn | Khách mỗi ngày | Lợi nhuận hoạt động ước tính (triệu mỗi tháng) |
| :---- | :---- | :---- |
| 18/11 \- 2/12/2026 (hai tuần đầu) | Khoảng 60-70 | Quanh hòa vốn, kịch bản thấp khoảng \+1 |
| 3/12/2026 \- 31/1/2027 | Khoảng 105-120 | \+118 đến \+150 |
| Tháng 2/2027 (Tết) | Khoảng 55 | \-2 |
| Tháng 3-4/2027 | Khoảng 100 | \+108 |
| Tháng 5 \- đầu tháng 6/2027 | Khoảng 120 | \+146 |
| Giữa tháng 6 \- tháng 8/2027 | Khoảng 55-75 | \-14 đến \+35 nếu không làm gì |
| Tháng 9/2027 | Khoảng 80 | \+48 |
| Tháng 10-11/2027 | Khoảng 105-110 | \+120 đến \+133 |

Các con số lợi nhuận chỉ để đối chiếu: dashboard tính lợi nhuận từ doanh thu seed, kết quả sai lệch nhỏ là chấp nhận được, nhưng ở kịch bản Cơ sở (100 khách mỗi ngày, mùa học) phải ra khoảng 99 triệu mỗi tháng.

### **8.3 Cơ cấu mỗi 100 khách (kịch bản cơ sở)**

* Gói: 15 gói 1 giờ, 33 gói 3 giờ, 20 gói 6 giờ, 6 gói 9 giờ, 9 combo đêm, 17 Combo Trọn Ngày.  
* Khoảng 55% khách mua gói (không phải combo) mua thêm 1 đồ uống, giá trung bình 45.000đ.  
* Phòng họp được thuê khoảng 12,6 giờ mỗi ngày (cả 4 phòng); mỗi giờ thuê khách mua trung bình 1,5 đồ uống.  
* Gói 9 giờ tặng 1 đồ ăn nhẹ có giá nhập khoảng 8.000đ.  
* In ấn và văn phòng phẩm đóng góp khoảng 1-2 triệu mỗi tháng.  
* Tổng doanh thu kịch bản cơ sở khoảng 306 triệu mỗi tháng; chi phí biến đổi khoảng 63 triệu; chi phí cố định 144 triệu (thuê 20, nhân sự 61, điện nước internet 33, marketing 15, phần mềm 5, vật tư bảo trì 10).

### **8.4 Phân bố lượt check-in trong ngày (gợi ý)**

| Khung | Tỷ lệ lượt check-in |
| :---- | :---- |
| 6h-9h | 8% |
| 9h-12h | 12% |
| 12h-15h | 14% |
| 15h-18h | 16% |
| 18h-21h | 30% |
| 21h-23h | 12% |
| 23h-6h | 8% |

Ở kịch bản cơ sở, khung 19h-23h có khoảng 50-60 khách ngồi cùng lúc, gần kín tầng 1-2.

### **8.5 Dữ liệu mẫu khác**

* 15 đặt phòng trong tuần hiện tại (đủ trạng thái đã đặt, đã hủy hoàn cọc, mất cọc, không đến).  
* 25 góp ý, điểm trung bình khoảng 4,5, có 2 khiếu nại.  
* Bảng vinh danh tháng và năm với 10 khách; Minh Anh có 88 giờ.  
* Số điện: khoảng 160 kWh mỗi ngày (mùa mát, 4.800 kWh mỗi tháng) và khoảng 260 kWh mỗi ngày (mùa hè, 7.900 kWh mỗi tháng); quỹ dự phòng 150 triệu.  
* Đồng hồ mô phỏng mặc định là 10/11/2027 lúc 20h để dashboard có đủ 12 tháng dữ liệu \[MĐ\]. Bổ sung vào M1 các nút mốc nhanh: “Ngày khai trương (18/11/2026)”, “Sau 3 tháng”, “Mùa hè 2027”, “Sau 12 tháng”. Dashboard chỉ hiển thị dữ liệu đến thời điểm đồng hồ mô phỏng.

## **9\. Khu vực, đường dẫn và phân quyền**

| Khu vực | Tệp | Ai truy cập |
| :---- | :---- | :---- |
| Công khai | index.html, gioi-thieu.html, bang-gia.html, phong-hop.html, quy-tac.html, cong-dong.html, tuyen-dung.html, gop-y.html, lien-he.html, so-do-cho.html, dieu-khoan.html, chinh-sach-hoan-coc.html, chinh-sach-bao-mat.html | Mọi người |
| Xác thực | dang-ky.html, dang-nhap.html, quen-mat-khau.html | Chưa đăng nhập |
| Khách | tai-khoan.html, checkin.html, dat-phong.html, dat-do.html, in-an.html | Khách, nhân viên, quản lý |
| Nhân viên | nhan-vien.html | Nhân viên, quản lý |
| Quản lý | quan-ly.html, quan-ly-canh-bao.html, quan-ly-bao-cao.html, quan-ly-cau-hinh.html | Quản lý |
| Demo và kiểm thử | demo-qr.html, test.html, bảng điều khiển demo (hiện trên mọi trang khi bật chế độ demo) | Mọi người |

Phân quyền làm bằng JavaScript ở phía trình duyệt: mỗi trang kiểm tra vai trò khi tải, không đủ quyền thì chuyển sang dang-nhap.html hoặc hiện trang “Bạn không có quyền truy cập”. Đây chỉ là mô phỏng, không phải bảo mật thật.

## **10\. Yêu cầu phi chức năng**

* **Hiệu năng:** giao diện vẫn mượt khi có 80 khách giả và 12 tháng dữ liệu tổng hợp; danh sách dài có phân trang.  
* **Đồng bộ:** thay đổi ở một tab hiện sang tab khác cùng trình duyệt trong vài giây (BroadcastChannel).  
* **Kiểm thử:** trang test.html chạy mọi quy tắc R01-R31 bằng các ví dụ ở mục 6 và hiện đạt hoặc không đạt. Ba kịch bản đầu cuối do người làm chạy tay theo mục Nghiệm thu: đăng ký, check-in, mua gói, check-out; đặt phòng, cọc, hủy hoàn cọc; bật sự cố và nhập sổ dự phòng.  
* **Chất lượng mã:** JavaScript ES modules, chia file theo chức năng, mỗi trang có file riêng trong js/pages/, không để quy tắc nghiệp vụ trong mã giao diện, chú thích tiếng Việt ở các hàm quy tắc.  
* **Bảo mật mô phỏng:** không lưu thông tin nhạy cảm thật; chuỗi người dùng nhập hiển thị bằng textContent, không chèn trực tiếp vào innerHTML; trang chính sách bảo mật ghi rõ đây là hệ thống mô phỏng.  
* **Thông báo lỗi:** tiếng Việt, nêu rõ cách khắc phục.  
* **Tương thích:** trình duyệt hiện đại bản mới (Chrome, Edge, Safari, Firefox); chỉ chạy qua http hoặc https, không mở trực tiếp file từ ổ đĩa.  
* **Tài liệu:** README.md ghi cách cập nhật qua GitHub (tạo hoặc sửa file, commit), cách bật GitHub Pages, cách đổi logo, ảnh và css/tokens.css; sau này thêm hướng dẫn nối Vercel.  
* **Cấu trúc thư mục gợi ý:** các trang .html ở thư mục gốc (mục 9); css/ (tokens.css, style.css); js/ (clock.js, store.js, api.js, rules.js, config.js, seed.js, ui.js, thư mục pages/); images/; logo.svg, favicon.ico; test.html; docs/lumen24-spec.md; README.md.

## **11\. Thứ tự giao việc cho AI và mẫu prompt**

### **11.1 Thứ tự**

| Bước | Nội dung | Cần có trước |
| :---- | :---- | :---- |
| 0 | Khung: css/tokens.css, css/style.css, js/ui.js (header, footer, dải thông báo mô phỏng), index.html tạm; bật GitHub Pages |  |
| 1 | js/clock.js (hàm now()), js/store.js, js/api.js, js/config.js, js/seed.js, js/rules.js, test.html kèm ví dụ R01-R31 | 0 |
| 2 | M2 Trang công khai (gồm bảng giá và widget mức độ đông) | 1 |
| 3 | M3 Tài khoản, đăng nhập nhanh demo, phân quyền | 1 |
| 4 | M6 Thanh toán QR giả và lịch sử giao dịch | 3 |
| 5 | M4 Check-in, check-out, sơ đồ chỗ | 4 |
| 6 | M5 Đặt phòng họp | 4 |
| 7 | M1 Bảng điều khiển demo (đồng hồ, mùa, kịch bản, sự cố) | 5, 6 |
| 8 | M11 Màn hình nhân viên và chế độ dự phòng | 5, 6 |
| 9 | M13 Quản trị cấu hình | 2 |
| 10 | M12 Dashboard, cảnh báo, báo cáo | 5, 6, 9 |
| 11 | M7 Tích điểm và bảng vinh danh | 5 |
| 12 | M8 Đặt đồ tại bàn và màn hình bar | 4, 8 |
| 13 | M9 In từ web | 4, 8 |
| 14 | M10 Góp ý đầy đủ | 10 |
| 15 | Rà soát: responsive, tiếp cận, chạy tay các kịch bản đầu cuối, README.md | Tất cả |

### **11.2 Mẫu prompt (thay phần trong ngoặc vuông)**

*Bạn là lập trình viên web. Hãy làm tiếp **website tĩnh bằng HTML, CSS và JavaScript thuần** (ES modules, không build, không npm, không framework) cho quán study cafe Lumen 24\. Tôi chỉ dán file vào GitHub bằng trình duyệt và xem qua GitHub Pages, nên:*

* Mỗi file ghi **đường dẫn đầy đủ** ở dòng đầu, rồi **nội dung đầy đủ** (không viết tắt, không để “...”) trong một khối mã riêng.  
* Mọi liên kết và đường dẫn tài nguyên dùng **đường dẫn tương đối**, không bắt đầu bằng dấu gạch chéo.  
* Thư viện bên ngoài chỉ nạp bằng thẻ \<script\> từ CDN, ghi rõ phiên bản cụ thể.  
* Không yêu cầu tôi chạy lệnh nào.

  ***Bối cảnh chung:** \[dán mục 1-4\].*

  ***Quy tắc nghiệp vụ:** \[dán mục 6 hoặc các dòng R liên quan\].*

  ***Các file đã có trong repo:** \[liệt kê tên file; dán nội dung js/store.js, js/api.js, js/config.js, js/ui.js nếu module cần dùng\].*

  ***Nhiệm vụ lần này:** làm \[tên module, ví dụ M5. Đặt phòng họp\], mô tả đầy đủ như sau: \[dán nội dung module\].*

  ***Ràng buộc:** trạng thái qua js/store.js; truy cập dữ liệu qua js/api.js; giờ giấc qua js/clock.js; giá lấy từ js/config.js; quy tắc ở js/rules.js; mọi chỗ đụng tới localStorage bọc try/catch; chuỗi người dùng nhập hiển thị bằng textContent; giao diện tiếng Việt, ưu tiên điện thoại; không sao chép nội dung, tên gói hay hình ảnh của Nerd Society.*

  ***Kết quả mong muốn:** (1) danh sách file tạo hoặc sửa theo đường dẫn; (2) với file sửa, đưa cả file đã sửa đầy đủ; (3) thêm ví dụ vào test.html nếu có quy tắc mới; (4) hướng dẫn tôi tự kiểm tra từng dòng của mục Nghiệm thu; (5) nêu rõ chỗ chưa làm hoặc đã giả định.*

Sau mỗi bước: commit lên nhánh dev, mở link GitHub Pages, đối chiếu mục Nghiệm thu rồi mới giao bước tiếp theo; hài lòng thì gộp dev vào main. Tài khoản Claude khác không nhớ các lần trước, nên mỗi lần luôn dán kèm mục 1-4, các quy tắc liên quan và nội dung các file js/ dùng chung đã có.

## **12\. Giả định mặc định cần bạn xác nhận**

Kế hoạch chưa quy định các điểm dưới đây nên tài liệu đặt giá trị mặc định (ghi \[MĐ\] ở trên). Bạn đổi giá trị nào thì sửa đúng dòng R hoặc module tương ứng trước khi giao AI.

| \# | Điểm cần chốt | Mặc định trong tài liệu | Ảnh hưởng |
| :---- | :---- | :---- | :---- |
| 1 | Giới hạn Combo Trọn Ngày | Tối đa 24 giờ kể từ check-in | R08 |
| 2 | Xử lý vượt giờ | Ân hạn 10 phút, sau đó 12.000đ mỗi giờ hoặc phần của giờ | R09, M4 |
| 3 | Gói 3, 6, 9 giờ có chia nhiều lần không | Không, dùng liên tục; ra khỏi quán giờ vẫn chạy | R06 |
| 4 | Khung combo đêm | Mua và check-in 23h-6h, hết hiệu lực 7h | R07 |
| 5 | Mức giảm thấp điểm và CLB, cách cộng dồn | Mỗi loại 10%, không cộng dồn; thấp điểm là 23h-6h và 6h-11h | R14, R15 |
| 6 | Đặt phòng tối thiểu, bước đặt, chờ không đến | 1 giờ, bước 30 phút, 15 phút | R18, R20 |
| 7 | Thời gian giữ phòng khi thanh toán cọc | 10 phút | R19 |
| 8 | Ngưỡng mở và đóng tầng 3 ngoài giờ cao điểm | Mở khi trên 85%, đóng khi dưới 70% | R02 |
| 9 | Ngưỡng mức độ đông | 30%, 60%, 85% | R04 |
| 10 | Voucher tích điểm | Không trừ giờ khi nhận; hạn 90 ngày | R22 |
| 11 | Cách tính in ấn | Hai mặt 2 trang là 1 tờ; 10 tờ miễn phí; bậc giá theo số tờ còn phải trả | R25-R27 |
| 12 | Thẻ tháng hè | Giới hạn 20 suất; phụ phí vượt giờ như gói lẻ | R29 |
| 13 | Happy hour mùa hè | 9h-15h, giảm 10% đồ uống | R31 |
| 14 | Định nghĩa khiếu nại | 1-2 sao hoặc khách tick khiếu nại; mẫu số là lượt khách trong tháng | M10 |
| 15 | Menu và văn phòng phẩm | Dữ liệu mẫu ở mục 4.4 và 4.5 | M8, M9 |
| 16 | Gói có nhãn PHỔ BIẾN | Combo Trọn Ngày | M2 |
| 17 | Mốc đồng hồ demo mặc định | 10/11/2027 lúc 20h | Mục 8.5 |
| 18 | Ca đêm chỉ một người | Cảnh báo cho quản lý | M11 |
| 19 | Giới hạn file in | 20 MB, không đọc nội dung, khách nhập số trang | M9 |
| 20 | Đơn đồ trên 150.000đ | Hiện cảnh báo xác nhận | M8 |

**Việc còn lại phía bạn (không cần cho AI code, nhưng cần trước khi nộp):** tên thương hiệu cho từng gói nếu muốn (ví dụ theo chủ đề ánh sáng), bảng màu thật, ảnh thật của quán, địa chỉ và mạng xã hội (hiện dùng nội dung giả), menu đã chốt, và kiểm tra lại bảng giá Nerd Society trước khi nộp vì có thể thay đổi.
