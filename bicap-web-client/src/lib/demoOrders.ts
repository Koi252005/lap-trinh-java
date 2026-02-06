/**
 * Đơn hàng demo lưu localStorage - dùng khi backend chưa kết nối hoặc API lỗi.
 * Giúp người dùng vẫn thấy đơn hàng sau khi "Đặt hàng" để demo luồng blockchain.
 */

const STORAGE_KEY = 'bicap_demo_orders';

export interface DemoOrderItem {
  id: string;
  productId: number;
  productName: string;
  farmName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export function getDemoOrders(): DemoOrderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as DemoOrderItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addDemoOrder(order: Omit<DemoOrderItem, 'id' | 'createdAt'>): void {
  const list = getDemoOrders();
  const newOrder: DemoOrderItem = {
    ...order,
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newOrder);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {
    // quota or disabled
  }
}

export function getDemoOrderById(id: string): DemoOrderItem | undefined {
  return getDemoOrders().find((o) => o.id === id);
}
