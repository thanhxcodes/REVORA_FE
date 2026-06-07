# Hướng Dẫn Tích Hợp API - REVORA Match & Trade (Dành cho Front-End)

Tài liệu này cung cấp toàn bộ danh sách các API, định dạng JSON Request/Response, và các lưu ý kỹ thuật cần thiết để Front-End (FE) phát triển giao diện Match & Trade.

---

## Cấu Hình Chung

* **Base URL:** `/api/v1`
* **Authentication:** Tất cả các API yêu cầu Authorization Header ngoại trừ API lấy thống kê cộng đồng (`/stats`).
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
* **Real-time Chat:** Kết nối thời gian thực qua SignalR Hub tại địa chỉ `/chatHub` (yêu cầu đính kèm Token trong chuỗi kết nối).

---

## 1. Thống Kê Cộng Đồng (Community Stats)

Hiển thị ở màn hình giới thiệu tính năng hoặc trang chủ của Match & Trade. Số liệu đã được hệ thống Backend tự động cộng số ảo (boost data).

* **Endpoint:** `GET /api/v1/match-trade/stats`
* **Mức độ bảo mật:** Cho phép truy cập không cần Token (Anonymous).
* **Response DTO:** `MatchCommunityStatsDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Lấy thống kê thành công",
    "data": {
      "activeParticipants": 1248,
      "productsWaitingTrade": 5763
    }
  }
  ```

---

## 2. Bước 1: Chọn Sản Phẩm Đem Đi Trao Đổi

FE cần hiển thị danh sách các sản phẩm đang đăng bán của người dùng để họ chọn một hoặc nhiều sản phẩm đại diện cho phiên Match này.

* **Endpoint:** `GET /api/v1/match-trade/my-products`
* **Response DTO:** `List<MatchOfferingProductDto>`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách sản phẩm thành công",
    "data": [
      {
        "productId": 101,
        "title": "Áo khoác Blazer dáng rộng màu đen",
        "price": 250000.0,
        "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/blazer.jpg",
        "productStatus": "Public"
      },
      {
        "productId": 102,
        "title": "Quần jean ống suông nam xanh nhạt",
        "price": 300000.0,
        "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/jeans.jpg",
        "productStatus": "Public"
      }
    ]
  }
  ```

---

## 3. Bước 2: Thiết Lập Điều Kiện Lọc & Xem Trước

### A. Lấy Danh Sách Tùy Chọn Lọc (Price Ranges & Cities)
Lấy danh sách các khoảng giá và danh sách thành phố có sản phẩm kèm số liệu ước tính để hiển thị trên giao diện bộ lọc.

* **Endpoint:** `GET /api/v1/match-trade/filter-options`
* **Response DTO:** `MatchFilterOptionsDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Lấy tùy chọn lọc thành công",
    "data": {
      "priceBuckets": [
        {
          "label": "100.000đ – 300.000đ",
          "minPrice": 100000.0,
          "maxPrice": 300000.0,
          "productCount": 1532,
          "participantCount": 412
        },
        {
          "label": "300.000đ – 500.000đ",
          "minPrice": 300000.0,
          "maxPrice": 500000.0,
          "productCount": 986,
          "participantCount": 231
        },
        {
          "label": "Trên 1.000.000đ",
          "minPrice": 1000000.0,
          "maxPrice": null,
          "productCount": 254,
          "participantCount": 84
        }
      ],
      "cities": [
        {
          "city": "Hà Nội",
          "productCount": 1843,
          "participantCount": 538
        },
        {
          "city": "Hồ Chí Minh",
          "productCount": 1256,
          "participantCount": 421
        }
      ]
    }
  }
  ```

### B. Xem Trước Kết Quả Phù Hợp (Preview Match Count)
Khi người dùng thay đổi giá trị bộ lọc, FE gọi API này để hiển thị nhanh số lượng sản phẩm/người tham gia ước tính trước khi nhấn bắt đầu Match.

* **Endpoint:** `POST /api/v1/match-trade/preview`
* **Request DTO:** `PreviewMatchFiltersRequestDto`
  ```json
  {
    "minPrice": 150000.0,
    "maxPrice": 400000.0,
    "city": "Hà Nội"
  }
  ```
* **Response DTO:** `MatchFilterPreviewDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Xem trước bộ lọc thành công",
    "data": {
      "estimatedProducts": 750,
      "estimatedParticipants": 195
    }
  }
  ```

---

## 4. Bước 3 & 4: Phiên Match & Nhận Thẻ Vuốt

### A. Bắt Đầu Phiên Match
Tạo một phiên Match hoạt động. Khi gọi API này, nếu trước đó người dùng có phiên Match cũ đang chạy, hệ thống sẽ tự động dọn dẹp và đóng phiên cũ để bắt đầu phiên mới.

* **Endpoint:** `POST /api/v1/match-trade/sessions`
* **Request DTO:** `StartMatchSessionRequestDto`
  ```json
  {
    "productIds": [101],
    "minPrice": 100000.0,
    "maxPrice": 300000.0,
    "city": "Hà Nội"
  }
  ```
* **Response DTO:** `MatchSessionResponseDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Bắt đầu phiên Match thành công",
    "data": {
      "matchSessionId": 12,
      "status": "Active",
      "minPrice": 100000.0,
      "maxPrice": 300000.0,
      "city": "Hà Nội",
      "offeringProducts": [
        {
          "productId": 101,
          "title": "Áo khoác Blazer dáng rộng màu đen",
          "price": 250000.0,
          "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/blazer.jpg",
          "productStatus": "Public"
        }
      ],
      "estimatedProducts": 750,
      "estimatedParticipants": 195,
      "startedAt": "2026-06-07T01:30:00Z"
    }
  }
  ```

### B. Kiểm Tra Phiên Match Đang Hoạt Động (Nếu Có)
Khi người dùng vào màn hình Match & Trade, FE cần kiểm tra xem họ có phiên Match nào chưa đóng hay không để khôi phục trạng thái.

* **Endpoint:** `GET /api/v1/match-trade/sessions/active`
* **JSON Phản Hồi (Nếu có):** Trả về `MatchSessionResponseDto` tương tự như trên.
* **JSON Phản Hồi (Nếu không):** Trả về mã lỗi HTTP `404 Not Found`.
  ```json
  {
    "success": false,
    "message": "Không có phiên Match đang hoạt động."
  }
  ```

### C. Lấy Thẻ Sản Phẩm Tiếp Theo Để Vuốt
Lấy từng thẻ sản phẩm để hiển thị lên deck vuốt. Backend sẽ tự động loại trừ các thẻ đã vuốt và trả về thẻ tiếp theo.

* **Endpoint:** `GET /api/v1/match-trade/sessions/{sessionId}/next`
* **Response DTO:** `MatchSwipeResultDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "data": {
      "hasMore": true,
      "nextProduct": {
        "productId": 204,
        "title": "Váy thun dáng ôm Zara",
        "price": 180000.0,
        "condition": "Độ mới 95%",
        "brand": "Zara",
        "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/zara-dress.jpg",
        "sellerName": "Nguyễn Thị B",
        "sellerCity": "Hà Nội",
        "isMatchSeed": false
      }
    }
  }
  ```
  > [!NOTE]
  > Nếu `isMatchSeed = true`, đây là sản phẩm dữ liệu mẫu được hệ thống bổ sung khi thiếu nội dung. FE vẫn hiển thị bình thường nhưng cần hiểu đây là card giả lập.

---

## 5. Bước 4 & 5: Vuốt Trái/Phải & Nhận Kết Quả Match

Khi người dùng thực hiện thao tác vuốt trên thiết bị.

* **Endpoint:** `POST /api/v1/match-trade/sessions/{sessionId}/swipe`
* **Request DTO:** `MatchSwipeRequestDto`
  ```json
  {
    "productId": 204,
    "direction": "like"
  }
  ```
  * `direction` nhận giá trị: `"pass"` (vuốt trái - bỏ qua) hoặc `"like"` (vuốt phải - thích).
* **Response DTO:** `MatchSwipeResultDto`
* **JSON Phản Hồi (Khi Vuốt Thường - Không có Match):**
  ```json
  {
    "success": true,
    "message": "Đã thêm vào danh sách muốn trao đổi.",
    "data": {
      "hasMore": true,
      "nextProduct": {
        "productId": 205,
        "title": "Áo thun polo đen nam",
        "price": 150000.0,
        "condition": "Độ mới 90%",
        "brand": "Uniqlo",
        "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/uniqlo.jpg",
        "sellerName": "Trần Văn C",
        "sellerCity": "Hà Nội",
        "isMatchSeed": false
      },
      "isMutualMatch": false,
      "newMatch": null,
      "message": "Đã thêm vào danh sách muốn trao đổi."
    }
  }
  ```
* **JSON Phản Hồi (Khi Xảy Ra MATCH THÀNH CÔNG):**
  ```json
  {
    "success": true,
    "message": "Chúc mừng! Bạn đã Match thành công!",
    "data": {
      "hasMore": true,
      "nextProduct": {
        "productId": 205,
        "title": "Áo thun polo đen nam",
        "price": 150000.0,
        "imageUrl": "...",
        "sellerName": "Trần Văn C",
        "isMatchSeed": false
      },
      "isMutualMatch": true,
      "newMatch": {
        "tradeMatchId": 45,
        "conversationId": 88,
        "partnerUserId": 202,
        "partnerName": "Nguyễn Thị B",
        "partnerAvatar": "https://res.cloudinary.com/revora/image/upload/v1/avatarB.jpg",
        "myProduct": {
          "productId": 101,
          "title": "Áo khoác Blazer dáng rộng màu đen",
          "price": 250000.0,
          "imageUrl": "https://res.cloudinary.com/revora/image/upload/v1/blazer.jpg",
          "productStatus": "Public"
        },
        "partnerProduct": {
          "productId": 204,
          "title": "Váy thun dáng ôm Zara",
          "price": 180000.0,
          "imageUrl": "https://res.cloudinary.com/resora/image/upload/v1/zara-dress.jpg",
          "productStatus": "Public"
        },
        "status": "Active",
        "myConfirmed": false,
        "partnerConfirmed": false,
        "createdAt": "2026-06-07T01:31:00Z"
      },
      "message": "Chúc mừng! Bạn đã Match thành công!"
    }
  }
  ```
  > [!IMPORTANT]
  > Khi `isMutualMatch = true`, FE cần hiển thị ngay popup **Match thành công (Match Screen)** hiển thị ảnh 2 sản phẩm và nút "Chat Ngay" dẫn thẳng đến cuộc trò chuyện bằng `conversationId`. Ngoài ra, hệ thống tự động trả về `nextProduct` ở cấp độ root để FE cập nhật deck vuốt ngầm phía sau.

---

## 6. Bước 6: Trò Chuyện & Thỏa Thuận

### A. Lịch Sử Chat & Danh Sách Cuộc Trò Chuyện
* **Danh sách cuộc hội thoại:** `GET /api/v1/chat/conversations`
* **Lịch sử tin nhắn giữa 2 người:** `GET /api/v1/chat/{partnerUserId}/messages`
* **Gửi tin nhắn (REST API):** `POST /api/v1/chat/send`
  * **Request Body:**
    ```json
    {
      "receiverId": 202,
      "content": "Mình trao đổi sản phẩm này nhé!",
      "productRefId": 204
    }
    ```

---

## 7. Bước 7: Xác Nhận Đồng Ý Hoặc Hủy Trao Đổi

### A. Lấy Chi Tiết Trạng Thái Match Hiện Tại
Dùng để cập nhật trạng thái các nút đồng ý của đôi bên trên màn hình chat/thương lượng.

* **Endpoint:** `GET /api/v1/match-trade/matches/{tradeMatchId}`
* **Response DTO:** `TradeMatchSummaryDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "data": {
      "tradeMatchId": 45,
      "conversationId": 88,
      "partnerUserId": 202,
      "partnerName": "Nguyễn Thị B",
      "myProduct": { ... },
      "partnerProduct": { ... },
      "status": "Active",
      "myConfirmed": true,
      "partnerConfirmed": false,
      "createdAt": "2026-06-07T01:31:00Z"
    }
  }
  ```

### B. Đồng Ý Trao Đổi (Confirm Trade)
Khi người dùng click nút "Đồng ý trao đổi".

* **Endpoint:** `POST /api/v1/match-trade/matches/{tradeMatchId}/confirm`
* **Response DTO:** `TradeConfirmResultDto`
* **JSON Phản Hồi (Khi Bạn Đồng Ý Trước - Đối phương chưa đồng ý):**
  ```json
  {
    "success": true,
    "message": "Bạn đã đồng ý trao đổi.",
    "data": {
      "tradeMatchId": 45,
      "status": "Active",
      "myConfirmed": true,
      "partnerConfirmed": false,
      "isCompleted": false,
      "message": "Bạn đã đồng ý trao đổi."
    }
  }
  ```
  > [!TIP]
  > Lúc này giao diện phía đối phương (khi họ pull API hoặc qua SignalR) sẽ đọc `partnerConfirmed = true` và hiển thị dòng trạng thái: **"Đối phương đã đồng ý trao đổi."**

* **JSON Phản Hồi (Khi Cả Hai Cùng Đồng Ý - Giao dịch hoàn tất):**
  ```json
  {
    "success": true,
    "message": "Trao đổi thành công! Đã ghi nhận Trade Success.",
    "data": {
      "tradeMatchId": 45,
      "status": "Completed",
      "myConfirmed": true,
      "partnerConfirmed": true,
      "isCompleted": true,
      "message": "Trao đổi thành công! Đã ghi nhận Trade Success."
    }
  }
  ```
  > [!NOTE]
  > Khi `isCompleted = true`, hệ thống tự động đổi trạng thái 2 sản phẩm sang `"Sold"`, dọn dẹp toàn bộ dữ liệu tạm của phiên Match và ghi nhận lượt thành công vào bảng xếp hạng. FE hiển thị thông báo chúc mừng hoàn thành trao đổi.

### C. Hủy/Rời Khỏi Trao Đổi (Leave Trade)
Hủy bỏ Match hiện tại nếu không thương lượng được.

* **Endpoint:** `POST /api/v1/match-trade/matches/{tradeMatchId}/leave`
* **Response DTO:** `TradeConfirmResultDto`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Đã rời khỏi trao đổi. Đối phương đã được thông báo.",
    "data": {
      "tradeMatchId": 45,
      "status": "Cancelled",
      "myConfirmed": false,
      "partnerConfirmed": false,
      "isCompleted": false,
      "message": "Đã rời khỏi trao đổi. Đối phương đã được thông báo."
    }
  }
  ```

---

## 8. Thoát Phiên Match (End Session)

Khi người dùng chủ động nhấn đóng/thoát khỏi màn hình vuốt Match, FE cần gọi API này để hệ thống dọn dẹp các dữ liệu vuốt và thông báo tạm thời để giữ hệ thống sạch sẽ.

* **Endpoint:** `DELETE /api/v1/match-trade/sessions/{sessionId}`
* **JSON Phản Hồi:**
  ```json
  {
    "success": true,
    "message": "Đã kết thúc phiên Match."
  }
  ```
