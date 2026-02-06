/**
 * Dữ liệu demo cho Chợ Nông Sản - Không phụ thuộc API.
 * Dùng để hiển thị trang trại, nông trại và sản phẩm; tạo đơn hàng demo.
 */

export interface DemoFarm {
  id: number;
  name: string;
  address: string;
  certification: string;
  description?: string;
}

export interface DemoProduct {
  id: number;
  farmId: number;
  name: string;
  price: number;
  quantity: number;
  batchCode: string;
  seasonName?: string | null;
}

/** Trang trại / Nông trại uy tín - Demo */
export const DEMO_FARMS: DemoFarm[] = [
  {
    id: 1,
    name: 'Nông Trại Xanh Tươi',
    address: 'Đà Lạt, Lâm Đồng',
    certification: 'VietGAP',
    description: 'Chuyên rau củ quả vùng cao, canh tác sạch.',
  },
  {
    id: 2,
    name: 'Trang Trại Hữu Cơ Củ Chi',
    address: 'Củ Chi, TP.HCM',
    certification: 'VietGAP',
    description: 'Rau hữu cơ, không hóa chất.',
  },
  {
    id: 3,
    name: 'Vườn Rau Sạch Gia Đình',
    address: 'Ba Vì, Hà Nội',
    certification: 'VietGAP',
    description: 'Rau sạch vụ Xuân, nguồn gốc rõ ràng.',
  },
  {
    id: 4,
    name: 'Vườn Cây Ăn Trái Tiền Giang',
    address: 'Cái Bè, Tiền Giang',
    certification: 'VietGAP',
    description: 'Trái cây miền Tây, tươi ngon.',
  },
  {
    id: 5,
    name: 'Trang Trại Nấm Lâm Đồng',
    address: 'Đơn Dương, Lâm Đồng',
    certification: 'VietGAP',
    description: 'Nấm sạch, nuôi trồng theo quy trình.',
  },
  {
    id: 6,
    name: 'Trang Trại Rau Sạch Đồng Tháp',
    address: 'Cao Lãnh, Đồng Tháp',
    certification: 'VietGAP',
    description: 'Rau sạch Đồng Tháp, chất lượng ổn định.',
  },
  {
    id: 7,
    name: 'Trang Trại Hữu Cơ Cần Thơ',
    address: 'Cần Thơ',
    certification: 'VietGAP',
    description: 'Nông sản hữu cơ ĐBSCL.',
  },
];

/** Sản phẩm demo - mỗi sản phẩm thuộc một farm (farmId) */
export const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 1, farmId: 1, name: 'Dâu Tây Đà Lạt', price: 120000, quantity: 30, batchCode: 'BATCH-STRAWBERRY-001', seasonName: 'Vụ Đông 2024' },
  { id: 2, farmId: 1, name: 'Rau Xà Lách Tươi', price: 25000, quantity: 50, batchCode: 'BATCH-LETTUCE-001', seasonName: 'Vụ Đông 2024' },
  { id: 3, farmId: 1, name: 'Cà Chua Cherry', price: 45000, quantity: 40, batchCode: 'BATCH-TOMATO-CHERRY-001', seasonName: 'Vụ Đông 2024' },
  { id: 4, farmId: 1, name: 'Bắp Cải Tím', price: 22000, quantity: 35, batchCode: 'BATCH-PURPLE-CABBAGE-001', seasonName: 'Vụ Đông 2024' },
  { id: 5, farmId: 2, name: 'Cà Chua Bi Đỏ', price: 35000, quantity: 45, batchCode: 'BATCH-TOMATO-001', seasonName: 'Vụ Đông 2024' },
  { id: 6, farmId: 2, name: 'Cà Rốt Tươi', price: 22000, quantity: 60, batchCode: 'BATCH-CARROT-001', seasonName: 'Vụ Đông 2024' },
  { id: 7, farmId: 2, name: 'Khoai Tây', price: 18000, quantity: 70, batchCode: 'BATCH-POTATO-001', seasonName: 'Vụ Đông 2024' },
  { id: 8, farmId: 2, name: 'Ớt Chuông Đỏ', price: 45000, quantity: 30, batchCode: 'BATCH-BELLPEPPER-001', seasonName: 'Vụ Đông 2024' },
  { id: 9, farmId: 2, name: 'Rau Muống Sạch', price: 15000, quantity: 55, batchCode: 'BATCH-WATERSPINACH-001', seasonName: 'Vụ Đông 2024' },
  { id: 10, farmId: 3, name: 'Dưa Chuột Sạch', price: 20000, quantity: 50, batchCode: 'BATCH-CUCUMBER-001', seasonName: 'Vụ Xuân 2024' },
  { id: 11, farmId: 3, name: 'Bí Đỏ', price: 15000, quantity: 40, batchCode: 'BATCH-PUMPKIN-001', seasonName: 'Vụ Xuân 2024' },
  { id: 12, farmId: 3, name: 'Bắp Cải Xanh', price: 18000, quantity: 45, batchCode: 'BATCH-CABBAGE-001', seasonName: 'Vụ Xuân 2024' },
  { id: 13, farmId: 3, name: 'Cải Thảo', price: 20000, quantity: 40, batchCode: 'BATCH-BOKCHOY-001', seasonName: 'Vụ Xuân 2024' },
  { id: 14, farmId: 3, name: 'Rau Cải Ngọt', price: 18000, quantity: 50, batchCode: 'BATCH-SWEET-CABBAGE-001', seasonName: 'Vụ Xuân 2024' },
  { id: 15, farmId: 4, name: 'Cam Sành', price: 28000, quantity: 60, batchCode: 'BATCH-ORANGE-001', seasonName: 'Vụ Mùa 2024' },
  { id: 16, farmId: 4, name: 'Bưởi Da Xanh', price: 35000, quantity: 40, batchCode: 'BATCH-GRAPEFRUIT-001', seasonName: 'Vụ Mùa 2024' },
  { id: 17, farmId: 4, name: 'Chôm Chôm', price: 45000, quantity: 35, batchCode: 'BATCH-RAMBUTAN-001', seasonName: 'Vụ Mùa 2024' },
  { id: 18, farmId: 4, name: 'Xoài Cát Hòa Lộc', price: 55000, quantity: 30, batchCode: 'BATCH-MANGO-001', seasonName: 'Vụ Mùa 2024' },
  { id: 19, farmId: 5, name: 'Nấm Bào Ngư', price: 85000, quantity: 25, batchCode: 'BATCH-MUSHROOM-001', seasonName: null },
  { id: 20, farmId: 5, name: 'Nấm Kim Châm', price: 95000, quantity: 20, batchCode: 'BATCH-GOLDEN-MUSHROOM-001', seasonName: null },
  { id: 21, farmId: 5, name: 'Nấm Đông Cô', price: 120000, quantity: 18, batchCode: 'BATCH-SHIITAKE-001', seasonName: null },
  { id: 22, farmId: 6, name: 'Rau Đay', price: 16000, quantity: 50, batchCode: 'BATCH-JUTE-001', seasonName: 'Vụ Mùa 2024' },
  { id: 23, farmId: 6, name: 'Rau Mồng Tơi', price: 17000, quantity: 45, batchCode: 'BATCH-MALABAR-001', seasonName: 'Vụ Mùa 2024' },
  { id: 24, farmId: 6, name: 'Rau Dền', price: 15000, quantity: 50, batchCode: 'BATCH-AMARANTH-001', seasonName: 'Vụ Mùa 2024' },
  { id: 25, farmId: 7, name: 'Khoai Lang Tím', price: 20000, quantity: 40, batchCode: 'BATCH-PURPLE-SWEET-POTATO-001', seasonName: 'Vụ Mùa 2024' },
  { id: 26, farmId: 7, name: 'Bắp Nếp', price: 18000, quantity: 50, batchCode: 'BATCH-STICKY-CORN-001', seasonName: 'Vụ Mùa 2024' },
  { id: 27, farmId: 7, name: 'Đậu Bắp', price: 25000, quantity: 35, batchCode: 'BATCH-OKRA-001', seasonName: 'Vụ Mùa 2024' },
];

const farmMap = new Map(DEMO_FARMS.map((f) => [f.id, f]));

export interface ProductWithFarm extends DemoProduct {
  farm: DemoFarm;
}

/** Lấy tất cả sản phẩm kèm thông tin trang trại - dùng để hiển thị, không gọi API */
export function getProductsWithFarms(): ProductWithFarm[] {
  return DEMO_PRODUCTS.map((p) => {
    const farm = farmMap.get(p.farmId);
    return {
      ...p,
      farm: farm || { id: p.farmId, name: '—', address: '—', certification: 'VietGAP' },
    };
  });
}

/** Lấy sản phẩm theo farmId */
export function getProductsByFarmId(farmId: number): ProductWithFarm[] {
  return getProductsWithFarms().filter((p) => p.farmId === farmId);
}

/** Lấy farm theo id */
export function getFarmById(id: number): DemoFarm | undefined {
  return farmMap.get(id);
}

/** Lấy sản phẩm theo id (để xem chi tiết / đặt hàng) */
export function getProductById(id: number): ProductWithFarm | undefined {
  const list = getProductsWithFarms();
  return list.find((p) => p.id === id);
}
