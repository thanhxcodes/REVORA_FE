/* =====================================================================
   REVORA – Marketplace thời trang second-hand
   SQL Server schema (T-SQL) – tương thích ASP.NET (EF Core / Dapper)
   ---------------------------------------------------------------------
   Cách dùng:
     1. Mở SSMS / Azure Data Studio, kết nối SQL Server instance.
     2. Chạy toàn bộ file. Script tự tạo DB "RevoraDB" nếu chưa tồn tại.
     3. Có sẵn dữ liệu seed (lookup tables) ở phần cuối.
   ===================================================================== */

IF DB_ID(N'RevoraDB') IS NULL
    CREATE DATABASE RevoraDB;
GO
USE RevoraDB;
GO

/* =====================================================================
   1. NGƯỜI DÙNG & XÁC THỰC
   ===================================================================== */

-- Vai trò (User, Admin, Moderator…)
CREATE TABLE Roles (
    RoleId        INT IDENTITY(1,1) PRIMARY KEY,
    Code          NVARCHAR(20)  NOT NULL UNIQUE,    -- USER / ADMIN
    Name          NVARCHAR(50)  NOT NULL
);

-- Tài khoản người dùng (gồm cả admin)
CREATE TABLE Users (
    UserId          BIGINT IDENTITY(1,1) PRIMARY KEY,
    Username        NVARCHAR(50)  NOT NULL UNIQUE,
    Email           NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    FullName        NVARCHAR(100) NOT NULL,
    Phone           VARCHAR(20)   NULL,             -- dùng để map Zalo
    ZaloPhone       VARCHAR(20)   NULL,
    AvatarUrl       NVARCHAR(500) NULL,
    AvatarColor     VARCHAR(20)   NULL,             -- ví dụ #2D5A3D
    Bio             NVARCHAR(1000) NULL,
    Birthday        DATE          NULL,
    Gender          VARCHAR(10)   NULL,             -- male/female/other
    Address         NVARCHAR(255) NULL,
    City            NVARCHAR(80)  NULL,
    RoleId          INT NOT NULL FOREIGN KEY REFERENCES Roles(RoleId),
    IsActive        BIT NOT NULL DEFAULT 1,
    IsOnline        BIT NOT NULL DEFAULT 0,
    LastSeenAt      DATETIME2 NULL,
    SelectedBadge   VARCHAR(40)   NULL,
    Rating          DECIMAL(3,2)  NOT NULL DEFAULT 0,   -- trung bình đánh giá
    ReviewCount     INT NOT NULL DEFAULT 0,
    FollowerCount   INT NOT NULL DEFAULT 0,
    FollowingCount  INT NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Users_Phone   ON Users(Phone);
CREATE INDEX IX_Users_Zalo    ON Users(ZaloPhone);

-- Theo dõi giữa các user (Following)
CREATE TABLE UserFollows (
    FollowerId  BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    FolloweeId  BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (FollowerId, FolloweeId)
);

-- Cài đặt thông báo riêng từng user
CREATE TABLE UserNotificationSettings (
    UserId         BIGINT PRIMARY KEY FOREIGN KEY REFERENCES Users(UserId),
    NewMessage     BIT NOT NULL DEFAULT 1,
    NewBuyer       BIT NOT NULL DEFAULT 1,
    CreditExpiry   BIT NOT NULL DEFAULT 1,
    NewFollower    BIT NOT NULL DEFAULT 1,
    ProductViews   BIT NOT NULL DEFAULT 0,
    Promotions     BIT NOT NULL DEFAULT 0,
    UpdatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

/* =====================================================================
   2. DANH MỤC & SẢN PHẨM
   ===================================================================== */

CREATE TABLE Categories (
    CategoryId  INT IDENTITY(1,1) PRIMARY KEY,
    Slug        NVARCHAR(80)  NOT NULL UNIQUE,    -- ao-khoac, giay-dep…
    Name        NVARCHAR(100) NOT NULL,
    IconUrl     NVARCHAR(300) NULL,
    SortOrder   INT NOT NULL DEFAULT 0,
    IsActive    BIT NOT NULL DEFAULT 1
);

-- Trạng thái sản phẩm: Active, Hidden, Sold, RemovedByAdmin
CREATE TABLE Products (
    ProductId     BIGINT IDENTITY(1,1) PRIMARY KEY,
    SellerId      BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    CategoryId    INT NOT NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    Title         NVARCHAR(200) NOT NULL,
    Description   NVARCHAR(MAX) NULL,
    Price         DECIMAL(18,2) NOT NULL,
    Brand         NVARCHAR(100) NULL,
    SizeLabel     NVARCHAR(30)  NULL,
    Condition     NVARCHAR(40)  NULL,              -- LikeNew/Good/...
    IsPublic      BIT NOT NULL DEFAULT 1,          -- ẩn / hiện
    IsFeatured    BIT NOT NULL DEFAULT 0,          -- bật bằng credit nổi bật
    FeaturedUntil DATETIME2 NULL,
    Status        NVARCHAR(20) NOT NULL DEFAULT 'Active',
    ViewCount     INT NOT NULL DEFAULT 0,
    LikeCount     INT NOT NULL DEFAULT 0,
    CommentCount  INT NOT NULL DEFAULT 0,
    CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Products_Seller   ON Products(SellerId);
CREATE INDEX IX_Products_Category ON Products(CategoryId);
CREATE INDEX IX_Products_Feature  ON Products(IsFeatured, FeaturedUntil);

CREATE TABLE ProductImages (
    ProductImageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId      BIGINT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
    ImageUrl       NVARCHAR(500) NOT NULL,
    SortOrder      INT NOT NULL DEFAULT 0,
    IsCover        BIT NOT NULL DEFAULT 0
);

CREATE TABLE ProductTags (
    ProductId  BIGINT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
    Tag        NVARCHAR(50) NOT NULL,
    PRIMARY KEY (ProductId, Tag)
);

-- Yêu thích (wishlist)
CREATE TABLE Wishlists (
    UserId     BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ProductId  BIGINT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
    CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (UserId, ProductId)
);

-- Bình luận trên sản phẩm
CREATE TABLE ProductComments (
    CommentId  BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId  BIGINT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
    UserId     BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ParentId   BIGINT NULL FOREIGN KEY REFERENCES ProductComments(CommentId),
    Content    NVARCHAR(1000) NOT NULL,
    LikeCount  INT NOT NULL DEFAULT 0,
    CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE ProductCommentLikes (
    CommentId  BIGINT NOT NULL FOREIGN KEY REFERENCES ProductComments(CommentId) ON DELETE CASCADE,
    UserId     BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CommentId, UserId)
);

-- Đánh giá người bán (sau giao dịch)
CREATE TABLE SellerReviews (
    ReviewId   BIGINT IDENTITY(1,1) PRIMARY KEY,
    SellerId   BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ReviewerId BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ProductId  BIGINT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Rating     TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment    NVARCHAR(1000) NULL,
    CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

/* =====================================================================
   3. SHORTS – VIDEO NGẮN
   ===================================================================== */

CREATE TABLE Shorts (
    ShortId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    SellerId      BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ProductId     BIGINT NULL FOREIGN KEY REFERENCES Products(ProductId), -- link để bấm "Xem sản phẩm"
    VideoUrl      NVARCHAR(500) NOT NULL,
    ThumbnailUrl  NVARCHAR(500) NULL,
    Caption       NVARCHAR(500) NULL,
    SongTitle     NVARCHAR(200) NULL,
    LikeCount     INT NOT NULL DEFAULT 0,
    CommentCount  INT NOT NULL DEFAULT 0,
    ViewCount     INT NOT NULL DEFAULT 0,
    IsActive      BIT NOT NULL DEFAULT 1,
    CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Shorts_Seller ON Shorts(SellerId);

CREATE TABLE ShortLikes (
    ShortId  BIGINT NOT NULL FOREIGN KEY REFERENCES Shorts(ShortId) ON DELETE CASCADE,
    UserId   BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (ShortId, UserId)
);

CREATE TABLE ShortComments (
    CommentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ShortId   BIGINT NOT NULL FOREIGN KEY REFERENCES Shorts(ShortId) ON DELETE CASCADE,
    UserId    BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Content   NVARCHAR(1000) NOT NULL,
    LikeCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

/* =====================================================================
   4. CREDITS, GÓI & GIAO DỊCH (VNPay)
   ===================================================================== */

-- 2 loại credit: POSTING (đăng tin) – màu xanh dương, FEATURED (nổi bật) – màu cam
CREATE TABLE CreditTypes (
    CreditTypeId  INT PRIMARY KEY,                  -- 1=POSTING, 2=FEATURED
    Code          NVARCHAR(20) NOT NULL UNIQUE,
    Name          NVARCHAR(50) NOT NULL,
    ColorHex      VARCHAR(10) NOT NULL              -- #2563EB / #C4603A
);

-- Gói credit (5 credits/1 ngày, 30 credits/7 ngày…)
CREATE TABLE CreditPackages (
    PackageId       INT IDENTITY(1,1) PRIMARY KEY,
    CreditTypeId    INT NOT NULL FOREIGN KEY REFERENCES CreditTypes(CreditTypeId),
    Name            NVARCHAR(100) NOT NULL,         -- "Posting Day"
    CreditAmount    INT NOT NULL,
    DurationDays    INT NOT NULL,                   -- hết hạn sau bao nhiêu ngày
    Price           DECIMAL(18,2) NOT NULL,         -- VND
    IsActive        BIT NOT NULL DEFAULT 1,
    SortOrder       INT NOT NULL DEFAULT 0,
    Description     NVARCHAR(300) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Lô credit của user (mua theo gói → tạo 1 batch có hạn sử dụng)
CREATE TABLE UserCreditBatches (
    BatchId        BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId         BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    PackageId      INT    NOT NULL FOREIGN KEY REFERENCES CreditPackages(PackageId),
    CreditTypeId   INT    NOT NULL FOREIGN KEY REFERENCES CreditTypes(CreditTypeId),
    InitialCredits INT NOT NULL,
    RemainingCredits INT NOT NULL,
    PurchasedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt      DATETIME2 NOT NULL,
    IsActive       AS CAST(CASE WHEN RemainingCredits > 0 AND ExpiresAt > SYSUTCDATETIME() THEN 1 ELSE 0 END AS BIT) PERSISTED
);
CREATE INDEX IX_UCB_User_Active ON UserCreditBatches(UserId, CreditTypeId, ExpiresAt);

-- Đơn mua gói credit (qua VNPay)
CREATE TABLE Orders (
    OrderId        BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderCode      VARCHAR(40) NOT NULL UNIQUE,     -- ví dụ REVORA20260528-0001
    UserId         BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    PackageId      INT    NOT NULL FOREIGN KEY REFERENCES CreditPackages(PackageId),
    Amount         DECIMAL(18,2) NOT NULL,
    PaymentMethod  NVARCHAR(20) NOT NULL DEFAULT 'VNPAY',
    PaymentStatus  NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending/Paid/Failed/Refunded
    VnpTxnRef      VARCHAR(50) NULL,
    VnpResponseCode VARCHAR(10) NULL,
    PaidAt         DATETIME2 NULL,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Orders_User ON Orders(UserId);

-- Sổ giao dịch credit (lịch sử nạp & sử dụng)
CREATE TABLE CreditTransactions (
    TransactionId  BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId         BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    CreditTypeId   INT    NOT NULL FOREIGN KEY REFERENCES CreditTypes(CreditTypeId),
    BatchId        BIGINT NULL FOREIGN KEY REFERENCES UserCreditBatches(BatchId),
    OrderId        BIGINT NULL FOREIGN KEY REFERENCES Orders(OrderId),
    Type           NVARCHAR(10) NOT NULL,           -- BUY / USE / EXPIRE / REFUND
    Amount         INT NOT NULL,                    -- + nạp, - dùng
    Description    NVARCHAR(300) NOT NULL,
    RelatedProductId BIGINT NULL FOREIGN KEY REFERENCES Products(ProductId),
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_CT_User_Date ON CreditTransactions(UserId, CreatedAt DESC);

/* =====================================================================
   5. CHAT REAL-TIME (TIN NHẮN GIỮA USERS)
   ===================================================================== */

CREATE TABLE Conversations (
    ConversationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    User1Id        BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    User2Id        BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    LastMessageAt  DATETIME2 NULL,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Conv_Pair UNIQUE (User1Id, User2Id),
    CONSTRAINT CK_Conv_Order CHECK (User1Id < User2Id)   -- chuẩn hóa: id nhỏ trước
);

CREATE TABLE Messages (
    MessageId        BIGINT IDENTITY(1,1) PRIMARY KEY,
    ConversationId   BIGINT NOT NULL FOREIGN KEY REFERENCES Conversations(ConversationId) ON DELETE CASCADE,
    SenderId         BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Content          NVARCHAR(2000) NULL,
    AttachmentUrl    NVARCHAR(500) NULL,            -- ảnh đính kèm
    -- Khi user bấm "Liên hệ qua Zalo" / "Chat với người bán" từ ProductDetailPage
    -- → tin nhắn đầu tiên sẽ gắn ProductRefId để hiển thị card sản phẩm trong chat
    ProductRefId     BIGINT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Source           NVARCHAR(20) NOT NULL DEFAULT 'CHAT', -- CHAT / ZALO
    IsRead           BIT NOT NULL DEFAULT 0,
    ReadAt           DATETIME2 NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Msg_Conv_Date ON Messages(ConversationId, CreatedAt DESC);

/* =====================================================================
   6. THÔNG BÁO TRONG ỨNG DỤNG
   ===================================================================== */

CREATE TABLE Notifications (
    NotificationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId         BIGINT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Type           NVARCHAR(30) NOT NULL,           -- comment/buy/credit/follow/view/like
    Message        NVARCHAR(500) NOT NULL,
    LinkUrl        NVARCHAR(500) NULL,
    IsRead         BIT NOT NULL DEFAULT 0,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Notif_User_Read ON Notifications(UserId, IsRead, CreatedAt DESC);

/* =====================================================================
   7. ADMIN – DOANH THU & BÁO CÁO
   ===================================================================== */

-- View tổng doanh thu theo ngày (dashboard admin)
GO
CREATE OR ALTER VIEW vw_DailyRevenue AS
SELECT
    CAST(PaidAt AS DATE) AS RevenueDate,
    COUNT(*)              AS OrderCount,
    SUM(Amount)           AS TotalRevenue
FROM Orders
WHERE PaymentStatus = 'Paid'
GROUP BY CAST(PaidAt AS DATE);
GO

-- View bảng xếp hạng tuần (Weekly Ranking)
CREATE OR ALTER VIEW vw_WeeklyTopSellers AS
SELECT TOP 100
    u.UserId, u.Username, u.FullName, u.AvatarUrl,
    COUNT(o.OrderId)        AS Orders7d,
    ISNULL(SUM(o.Amount),0) AS Revenue7d
FROM Users u
LEFT JOIN Products p ON p.SellerId = u.UserId
LEFT JOIN Orders   o ON o.UserId   = u.UserId
                     AND o.PaymentStatus = 'Paid'
                     AND o.PaidAt >= DATEADD(DAY,-7,SYSUTCDATETIME())
GROUP BY u.UserId, u.Username, u.FullName, u.AvatarUrl
ORDER BY Revenue7d DESC, Orders7d DESC;
GO

/* =====================================================================
   8. DỮ LIỆU SEED (LOOKUP)
   ===================================================================== */

INSERT INTO Roles (Code, Name) VALUES
 (N'USER', N'Người dùng'),
 (N'ADMIN', N'Quản trị viên');

INSERT INTO CreditTypes (CreditTypeId, Code, Name, ColorHex) VALUES
 (1, N'POSTING',  N'Credit Đăng Tin', N'#2563EB'),
 (2, N'FEATURED', N'Credit Nổi Bật',  N'#C4603A');

INSERT INTO Categories (Slug, Name, SortOrder) VALUES
 (N'ao-khoac',   N'Áo Khoác',     1),
 (N'quan-ao',    N'Quần Áo',      2),
 (N'giay-dep',   N'Giày Dép',     3),
 (N'tui-xach',   N'Túi Xách',     4),
 (N'phu-kien',   N'Phụ Kiện',     5),
 (N'vintage',    N'Vintage',      6);

INSERT INTO CreditPackages (CreditTypeId, Name, CreditAmount, DurationDays, Price, SortOrder, Description) VALUES
 (1, N'Posting Day',  5,  1,   29000,  1, N'5 lượt đăng tin – sử dụng trong 1 ngày'),
 (1, N'Posting Week', 30, 7,   149000, 2, N'30 lượt đăng tin – sử dụng trong 7 ngày'),
 (1, N'Posting Month',120, 30, 499000, 3, N'120 lượt đăng tin – sử dụng trong 30 ngày'),
 (2, N'Featured Day',  3,  1,  39000,  1, N'3 lượt nổi bật – sử dụng trong 1 ngày'),
 (2, N'Featured Week', 15, 7,  199000, 2, N'15 lượt nổi bật – sử dụng trong 7 ngày'),
 (2, N'Featured Month',60, 30, 699000, 3, N'60 lượt nổi bật – sử dụng trong 30 ngày');

GO
PRINT N'>>> Schema RevoraDB đã được tạo thành công.';
