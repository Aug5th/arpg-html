# 📜 KỊCH BẢN GAME: TU TIÊN LỘ 2D - NGHỊCH THIÊN KIẾP

## 1. Vòng Lặp Trò Chơi (Core Gameplay Loop)
Thay vì đi cảnh tuyến tính, trò chơi sẽ vận hành theo vòng lặp **"Chuẩn Bị -> Khám Phá -> Thu Thập -> Đột Phá"**:
1. **Ở Làng (An Toàn):** Trồng linh thảo, luyện đan, rèn pháp khí, nâng cấp công pháp.
2. **Xuất Hành (Nguy Hiểm):** Đi qua Trận Pháp Dịch Chuyển đến các Bí Cảnh (Maps). Đánh yêu thú, khai thác khoáng sản, hái thuốc.
3. **Trở Về (Hoặc Chết):** Mang tài nguyên về làng. Nếu chết, mất 50% tài nguyên thu thập được trong chuyến đi đó (Tạo cảm giác trân quý sinh mạng).
4. **Đột Phá (Sự Kiện):** Khi đủ "Tu vi" (EXP) và có "Trúc Cơ Đan", người chơi tiến hành đột phá. Sẽ phải sống sót qua **Thiên Kiếp** (Mưa sét đánh xuống trong 1 phút) để lên cảnh giới mới.

---

## 2. Hệ Thống Cảnh Giới & Tu Vi (Thay thế hệ thống Level)
Nhân vật không có Level 1, 2, 3... mà chia thành các **Cảnh Giới**. Tu vi (EXP) có thể kiếm được qua việc đánh quái hoặc... ngồi Thiền ở làng.
* **Phàm Nhân:** Chưa có kỹ năng. Chỉ cầm gậy gõ heo rừng.
* **Luyện Khí Kỳ (Tầng 1 - 9):** Bắt đầu chọn Pháp Khí (Kiếm/Cung). Mở khóa 3 kỹ năng cơ bản.
* **Trúc Cơ Kỳ (Sơ - Trung - Hậu):** Pháp lực dồi dào. Vũ khí phát sáng. Đánh quái ra tia sét/lửa.
* **Kết Đan Kỳ:** Có thể Ngự kiếm phi hành (Lướt qua địa hình). Mở khóa Kỹ năng Tối thượng (Chiêu thứ 4).
* **Nguyên Anh Kỳ:** Boss cuối của game.

---

## 3. Hệ Thống Tài Nguyên (Looting System)
Yêu thú **TUYỆT ĐỐI KHÔNG RỚT TRANG BỊ**. Chúng chỉ rớt các vật liệu thô:
* **Từ Yêu Thú:**
    * *Huyết Nhục (Thịt/Máu):* Dùng để luyện Tích Cốc Đan (Hồi máu).
    * *Tài Liệu Yêu Thú (Răng sói, Lông cáo, Vảy rắn...):* Dùng để rèn Pháp Khí.
    * *Yêu Đan (Tỷ lệ rớt thấp từ Boss):* Nguyên liệu cốt lõi để luyện các loại Đan Dược Đột Phá.
* **Từ Bản Đồ (Tương tác E để đào/hái):**
    * *Khoáng Thạch (Huyền Thiết, Xích Đồng...):* Rèn vũ khí, áo giáp.
    * *Linh Thảo (Huyết Sâm, Tinh Thảo...):* Luyện đan dược.

---

## 4. Tân Thủ Thôn (Hub World - Nơi phát triển cốt truyện)
Làng Tân Thủ không chỉ là nơi đứng cho vui, mà là một căn cứ địa (Base) với các NPC chức năng rõ ràng:

### 👴 Lão Nhân Không Tên (Trưởng Thôn / Dẫn truyện)
* **Chức năng:** Giao nhiệm vụ chính tuyến (Quest).
* **Kịch bản đầu game:** Yêu cầu bạn đánh 10 con heo rừng lấy thịt. Sau khi hoàn thành, lão thấy bạn có căn cốt, liền tặng "Dẫn Khí Quyết" và cho bạn chọn Pháp Khí (Kiếm/Cung) -> Chính thức bước vào Luyện Khí Kỳ.

### ⚒️ Thiết Trùy Đại Sư (Thợ Rèn - Hệ thống Luyện Khí)
* **Chức năng:** Chế tạo và Cường hóa Trang Bị.
* **Cơ chế:** Để có cây "Xích Diệm Kiếm", bạn phải mang cho ông ta: *10 Huyền Thiết + 5 Nanh Hỏa Sói + 1000 Linh Thạch*.
* **Nâng cấp:** Tốn tài nguyên để đập đồ (+1, +2). Có tỷ lệ xịt (Rớt cấp), đúng chất cay cú của tu tiên!

### 🌿 Dược Tiên Tử (Luyện Đan Sư - Hệ thống Luyện Đan)
* **Chức năng:** Bán công thức (Đan phương) và cho thuê Lò Luyện Đan.
* **Cơ chế:** Bạn bỏ Linh Thảo + Yêu Đan vào lò. Chờ thời gian thực (ví dụ 30 giây cho đan bậc thấp, 5 phút cho đan bậc cao).
* **Phân loại Đan:**
    * *Hồi Phục:* Hồi máu/Mana liên tục.
    * *Tăng Ích (Buff):* Tăng Tốc đánh, Tốc chạy trong 10 phút.
    * *Đột Phá:* Bắt buộc phải cắn thuốc này mới được độ kiếp lên Cảnh Giới mới.

### 📜 Tàng Kinh Các (Thư viện Pháp Thuật)
* **Chức năng:** Nâng cấp Kỹ năng (Skill).
* **Cơ chế:** Skill không tự mạnh lên khi lên cấp. Bạn phải farm "Hồn Niệm" (rớt từ quái) để đổi lấy sách kỹ năng nâng cấp chiêu LMB, RMB, 1, 2, 3 để giảm Thời gian hồi chiêu (CD) hoặc tăng Sát thương.

---

## 5. Thiết Kế Các Bí Cảnh (Map Progression)

Thay vì các màn chơi nhàm chán, các Map được thiết kế theo khái niệm "Bí Cảnh" với độ khắc nghiệt tăng dần:

**Map 1: Hắc Thử Lâm (Rừng Chuột Đen) - Dành cho Luyện Khí Tầng 1-5**
* **Quái vật:** Hắc Thử (Chuột), Cuồng Trư (Heo rừng). Chạy chậm, cắn cận chiến.
* **Môi trường:** Rừng rậm, có nhiều điểm hái *Huyết Sâm* (Hồi máu cơ bản).
* **Boss khu vực:** Hắc Thử Vương (To gấp 3, biết lướt tới).

**Map 2: Độc Chướng Trạch (Đầm lầy sương độc) - Luyện Khí Tầng 6-9**
* **Cơ chế đặc biệt:** Có sương mù độc. Đứng lâu mất máu dần. Bắt buộc phải nhờ Dược Tiên Tử chế "Tị Độc Đan" cắn trước khi vào map.
* **Quái vật:** Xà Tinh (Bắn nọc độc từ xa), Nham Thạch Cự Nhân (Rất trâu, kháng chém vật lý).
* **Tài nguyên:** Nơi duy nhất đào được *Băng Cực Thạch* (Khoáng sản hiếm).

**Map 3: Huyết Ma Vực (Dungeon Ma Tôn hiện tại) - Trúc Cơ Kỳ**
* **Boss:** Ma Tôn Hắc Ám.
* **Cơ chế:** Map dạng Arena (Sàn đấu). Sống sót qua các đợt sóng quái (Wave) liên tục trong 5 phút trước khi Boss xuất hiện.

---

## 6. Điểm nhấn: Cơ chế "Độ Kiếp" (Thiên Kiếp)
Đây sẽ là khoảnh khắc hồi hộp nhất game. Khi thanh Tu Vi của bạn đầy 100/100, bạn không tự nhiên lên cấp.
1. Bạn phải về Làng, chạy ra một bãi đất trống bọc bằng trận pháp.
2. Bấm nút **"ĐỘT PHÁ"**.
3. Màn hình tối sầm, UI chuyển sang màu đỏ.
4. Trong vòng 30 giây, những luồng sét (AoE hình tròn đỏ) sẽ liên tục giáng xuống đầu bạn với tốc độ ngày càng nhanh.
5. Bạn phải dùng kỹ năng Dash (Space) để né lôi kiếp. Né thành công -> Lên Cảnh giới, bùng nổ hào quang, chỉ số tăng vọt. Trúng sét -> Mất máu cực nhiều, nếu chết thì đột phá thất bại, tu vi tụt xuống 50% phải cày lại.
