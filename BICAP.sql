-- Tạo Database
CREATE DATABASE BICAP;
GO
USE BICAP;
GO

/* =============================================
   MODULE 1: AUTHENTICATION & USERS
   ============================================= */

-- Bảng người dùng chung (cho Admin, Farm, Retailer, Shipper, Manager)
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100),
    PhoneNumber NVARCHAR(20),
    FullName NVARCHAR(100),
    Role NVARCHAR(20) CHECK (Role IN ('Admin', 'FarmOwner', 'Retailer', 'ShipManager', 'ShipDriver')),
    Status BIT DEFAULT 1, -- 1: Active, 0: Locked
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Thông tin chi tiết của Trang trại (Farm)
CREATE TABLE FarmProfiles (
    FarmId INT PRIMARY KEY, -- Link 1-1 với Users.Id
    BusinessLicenseNumber NVARCHAR(50),
    FarmName NVARCHAR(100),
    Address NVARCHAR(255),
    GPS_Latitude DECIMAL(9,6),
    GPS_Longitude DECIMAL(9,6),
    Description NVARCHAR(MAX),
    IsVerified BIT DEFAULT 0, -- Admin duyệt
    WalletAddress NVARCHAR(100), -- Địa chỉ ví Blockchain
    FOREIGN KEY (FarmId) REFERENCES Users(Id)
);

-- Thông tin chi tiết Nhà bán lẻ (Retailer)
CREATE TABLE RetailerProfiles (
    RetailerId INT PRIMARY KEY,
    BusinessName NVARCHAR(100),
    BusinessLicenseNumber NVARCHAR(50),
    Address NVARCHAR(255),
    WalletAddress NVARCHAR(100),
    FOREIGN KEY (RetailerId) REFERENCES Users(Id)
);

-- Thông tin tài xế
CREATE TABLE DriverProfiles (
    DriverId INT PRIMARY KEY,
    LicenseNumber NVARCHAR(50),
    CurrentVehicleId INT, -- Có thể update khi nhận xe
    FOREIGN KEY (DriverId) REFERENCES Users(Id)
);

/* =============================================
   MODULE 2: SUBSCRIPTION (Gói dịch vụ)
   ============================================= */

CREATE TABLE ServicePackages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PackageName NVARCHAR(50),
    Price DECIMAL(18, 2),
    DurationInMonths INT,
    Description NVARCHAR(255)
);

CREATE TABLE Subscriptions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FarmId INT,
    PackageId INT,
    StartDate DATETIME,
    EndDate DATETIME,
    PaymentStatus NVARCHAR(20) CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed')),
    FOREIGN KEY (FarmId) REFERENCES FarmProfiles(FarmId),
    FOREIGN KEY (PackageId) REFERENCES ServicePackages(Id)
);

/* =============================================
   MODULE 3: PRODUCTION & IOT (Nông sản & Mùa vụ)
   ============================================= */

-- Danh mục nông sản (VD: Cà chua, Dưa lưới)
CREATE TABLE ProductCategories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100)
);

-- Định nghĩa sản phẩm gốc
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FarmId INT,
    CategoryId INT,
    ProductName NVARCHAR(100),
    Description NVARCHAR(MAX),
    ImageURL NVARCHAR(255),
    FOREIGN KEY (FarmId) REFERENCES FarmProfiles(FarmId),
    FOREIGN KEY (CategoryId) REFERENCES ProductCategories(Id)
);

-- Mùa vụ (Farming Season) - Cốt lõi của Traceability
CREATE TABLE FarmingSeasons (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT,
    SeasonName NVARCHAR(100), -- VD: Vụ Xuân 2024
    StartDate DATETIME,
    EstimatedHarvestDate DATETIME,
    Status NVARCHAR(50) CHECK (Status IN ('Planning', 'In-Progress', 'Harvested', 'Closed')),
    BlockchainTxHash NVARCHAR(100), -- Hash transaction tạo mùa vụ trên VeChain
    QRCodeString NVARCHAR(255), -- Chuỗi định danh để tạo QR
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Nhật ký canh tác (Processes)
CREATE TABLE SeasonProcesses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SeasonId INT,
    StageName NVARCHAR(100), -- VD: Gieo hạt, Bón phân, Phun thuốc
    Description NVARCHAR(MAX),
    ProcessDate DATETIME DEFAULT GETDATE(),
    ImageURL NVARCHAR(255), -- Hình ảnh thực tế
    BlockchainTxHash NVARCHAR(100), -- Hash ghi nhận hoạt động này
    FOREIGN KEY (SeasonId) REFERENCES FarmingSeasons(Id)
);

-- Dữ liệu IoT (Nhiệt độ, độ ẩm, pH)
CREATE TABLE SensorData (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    SeasonId INT,
    Temperature FLOAT,
    Humidity FLOAT,
    SoilPH FLOAT,
    RecordedAt DATETIME DEFAULT GETDATE(),
    IsAlert BIT DEFAULT 0, -- Cờ báo động nếu vượt ngưỡng
    FOREIGN KEY (SeasonId) REFERENCES FarmingSeasons(Id)
);

/* =============================================
   MODULE 4: TRADING FLOOR (Sàn giao dịch)
   ============================================= */

-- Đăng bán sản phẩm (Push to trading floor)
CREATE TABLE MarketplaceListings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SeasonId INT,
    AvailableQuantity INT,
    Unit NVARCHAR(20), -- Kg, Tonn, Box
    PricePerUnit DECIMAL(18, 2),
    ListingDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) CHECK (Status IN ('Active', 'SoldOut', 'Cancelled')),
    FOREIGN KEY (SeasonId) REFERENCES FarmingSeasons(Id)
);

-- Đơn hàng từ Retailer
CREATE TABLE Orders (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RetailerId INT,
    FarmId INT,
    TotalAmount DECIMAL(18, 2),
    DepositAmount DECIMAL(18, 2),
    OrderDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50) CHECK (Status IN ('Pending', 'Deposited', 'Confirmed', 'Shipping', 'Completed', 'Cancelled')),
    BlockchainTxHash NVARCHAR(100), -- Hash hợp đồng mua bán
    FOREIGN KEY (RetailerId) REFERENCES RetailerProfiles(RetailerId),
    FOREIGN KEY (FarmId) REFERENCES FarmProfiles(FarmId)
);

CREATE TABLE OrderItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT,
    ListingId INT,
    Quantity INT,
    Price DECIMAL(18, 2),
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    FOREIGN KEY (ListingId) REFERENCES MarketplaceListings(Id)
);

/* =============================================
   MODULE 5: LOGISTICS (Vận chuyển)
   ============================================= */

CREATE TABLE Vehicles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PlateNumber NVARCHAR(20),
    VehicleType NVARCHAR(50),
    Capacity NVARCHAR(50),
    ManagerId INT, -- Người quản lý xe
    FOREIGN KEY (ManagerId) REFERENCES Users(Id)
);

-- Chuyến hàng
CREATE TABLE Shipments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT,
    DriverId INT,
    VehicleId INT,
    CreatedDate DATETIME DEFAULT GETDATE(),
    DeliveryDate DATETIME,
    Status NVARCHAR(50) CHECK (Status IN ('Created', 'PickedUp', 'InTransit', 'Delivered', 'Failed')),
    StartImageURL NVARCHAR(255), -- Ảnh lúc nhận hàng
    FinishImageURL NVARCHAR(255), -- Ảnh lúc giao hàng xong (Proof of Delivery)
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    FOREIGN KEY (DriverId) REFERENCES DriverProfiles(DriverId),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id)
);

-- Nhật ký hành trình (Tracking)
CREATE TABLE ShipmentTracking (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    ShipmentId INT,
    CurrentLocation NVARCHAR(255),
    Timestamp DATETIME DEFAULT GETDATE(),
    StatusNote NVARCHAR(255),
    BlockchainTxHash NVARCHAR(100), -- Lưu hash nếu cần minh bạch quá trình vận chuyển
    FOREIGN KEY (ShipmentId) REFERENCES Shipments(Id)
);

/* =============================================
   MODULE 6: SYSTEM & ADMIN
   ============================================= */

CREATE TABLE Reports (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SenderId INT,
    ReceiverId INT NULL, -- NULL nếu gửi cho Admin hệ thống
    Title NVARCHAR(200),
    Content NVARCHAR(MAX),
    Type NVARCHAR(50), -- Complaint, SystemError, Feedback
    CreatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SenderId) REFERENCES Users(Id)
);

CREATE TABLE Notifications (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    UserId INT,
    Message NVARCHAR(500),
    IsRead BIT DEFAULT 0,
    CreatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Cấu hình Smart Contract (Admin quản lý)
CREATE TABLE SystemConfig (
    ConfigKey NVARCHAR(100) PRIMARY KEY,
    ConfigValue NVARCHAR(MAX), -- Lưu địa chỉ Smart Contract, ABI, v.v.
    Description NVARCHAR(255)
);