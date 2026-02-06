/**
 * Helper function để map tên sản phẩm/nội dung sang emoji icon phù hợp
 */

export function getProductIcon(name: string): string {
    const n = name.toLowerCase().trim();
    
    // === TRÁI CÂY ===
    if (n.includes('dâu tây')) return '🍓';
    if (n.includes('dưa hấu')) return '🍉';
    if (n.includes('dưa chuột') || n.includes('dưa leo')) return '🥒';
    if (n.includes('dưa lưới') || n.includes('dưa vàng')) return '🍈';
    if (n.includes('cam')) return '🍊';
    if (n.includes('chanh')) return '🍋';
    if (n.includes('táo')) return '🍎';
    if (n.includes('chuối')) return '🍌';
    if (n.includes('nho')) return '🍇';
    if (n.includes('xoài')) return '🥭';
    if (n.includes('đào')) return '🍑';
    if (n.includes('lê')) return '🍐';
    if (n.includes('dứa') || n.includes('thơm')) return '🍍';
    if (n.includes('dừa')) return '🥥';
    if (n.includes('kiwi')) return '🥝';
    if (n.includes('cherry') || n.includes('anh đào')) return '🍒';
    
    // === RAU XANH ===
    if (n.includes('xà lách') || n.includes('rau diếp')) return '🥬';
    if (n.includes('rau muống')) return '🥬';
    if (n.includes('rau cải') || n.includes('cải bẹ')) return '🥬';
    if (n.includes('cải thảo')) return '🥬';
    if (n.includes('cải ngọt')) return '🥬';
    if (n.includes('cải xoong')) return '🥬';
    if (n.includes('cải thìa')) return '🥬';
    if (n.includes('cải bắp') || n.includes('bắp cải')) return '🥬';
    if (n.includes('rau cần')) return '🥬';
    if (n.includes('rau ngót')) return '🥬';
    if (n.includes('rau đay')) return '🥬';
    if (n.includes('rau mồng tơi')) return '🥬';
    if (n.includes('rau dền')) return '🥬';
    if (n.includes('rau lang')) return '🥬';
    if (n.includes('rau má')) return '🌿';
    if (n.includes('rau thơm') || n.includes('rau mùi')) return '🌿';
    if (n.includes('húng') || n.includes('basil')) return '🌿';
    if (n.includes('rau') || n.includes('cải')) return '🥬';
    
    // === CỦ QUẢ ===
    if (n.includes('cà chua')) return '🍅';
    if (n.includes('cà tím') || n.includes('cà pháo')) return '🍆';
    if (n.includes('cà rốt')) return '🥕';
    if (n.includes('khoai tây')) return '🥔';
    if (n.includes('khoai lang')) return '🍠';
    if (n.includes('khoai môn')) return '🍠';
    if (n.includes('khoai sọ')) return '🍠';
    if (n.includes('khoai')) return '🥔';
    if (n.includes('củ cải')) return '🥕';
    if (n.includes('củ dền')) return '🥕';
    if (n.includes('hành tây')) return '🧅';
    if (n.includes('hành lá') || n.includes('hành ta')) return '🧅';
    if (n.includes('tỏi')) return '🧄';
    if (n.includes('gừng')) return '🫚';
    if (n.includes('ớt')) return '🌶️';
    if (n.includes('ớt chuông') || n.includes('pepper')) return '🫑';
    if (n.includes('bí đỏ') || n.includes('bí ngô')) return '🎃';
    if (n.includes('bí xanh')) return '🥒';
    if (n.includes('bí')) return '🎃';
    if (n.includes('bắp') || n.includes('ngô')) return '🌽';
    if (n.includes('đậu')) return '🫘';
    if (n.includes('đậu phụ')) return '🫘';
    if (n.includes('nấm')) return '🍄';
    if (n.includes('củ')) return '🥕';
    
    // === LÚA GẠO ===
    if (n.includes('lúa') || n.includes('gạo') || n.includes('rice')) return '🌾';
    
    // === MẶC ĐỊNH ===
    return '🌱';
}

/**
 * Map feature/title sang icon phù hợp
 */
export function getFeatureIcon(title: string): string {
    const t = title.toLowerCase();
    
    if (t.includes('quản lý') || t.includes('mùa vụ')) return '🌱';
    if (t.includes('blockchain') || t.includes('minh bạch')) return '🔗';
    if (t.includes('iot') || t.includes('thông minh') || t.includes('giám sát')) return '📡';
    if (t.includes('kết nối') || t.includes('trực tiếp')) return '🤝';
    if (t.includes('truy xuất') || t.includes('nguồn gốc')) return '🔍';
    if (t.includes('thanh toán')) return '💳';
    if (t.includes('nông dân')) return '👨‍🌾';
    if (t.includes('sản phẩm')) return '🥬';
    if (t.includes('hỗ trợ')) return '💬';
    
    return '🌱';
}
