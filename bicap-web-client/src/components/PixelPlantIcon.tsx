'use client';

/** Icon thực vật kiểu pixel (SVG 16x16) – dùng cho chợ nông sản và trang chủ */
export type PixelPlantType =
    | 'leaf'      // rau xanh, cải, xà lách
    | 'tomato'    // cà chua
    | 'carrot'   // cà rốt, củ
    | 'potato'   // khoai tây
    | 'fruit'    // cam, dâu, trái cây
    | 'pepper'   // ớt, ớt chuông
    | 'corn'     // bắp, ngô
    | 'mushroom' // nấm
    | 'pumpkin'  // bí đỏ
    | 'default'; // lúa, gạo, chung

const PIXEL_ICONS: Record<PixelPlantType, { fill: string; pixels: [number, number][] }> = {
    leaf: {
        fill: '#2d5c1e',
        pixels: [ [4,2],[5,2],[6,2],[3,3],[4,3],[5,3],[6,3],[7,3],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[3,5],[4,5],[5,5],[6,5],[7,5],[4,6],[5,6],[6,6],[5,7] ]
    },
    tomato: {
        fill: '#c83828',
        pixels: [ [5,3],[6,3],[4,4],[5,4],[6,4],[7,4],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[4,6],[5,6],[6,6],[7,6],[5,7],[6,7],[6,4] ]
    },
    carrot: {
        fill: '#e67e22',
        pixels: [ [6,2],[5,3],[6,3],[7,3],[6,4],[5,5],[6,5],[7,5],[6,6],[5,7],[6,7],[7,7],[6,8],[6,9],[6,10],[6,11] ]
    },
    potato: {
        fill: '#8d6e63',
        pixels: [ [4,4],[5,4],[6,4],[7,4],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[4,6],[5,6],[6,6],[7,6],[8,6],[5,7],[6,7],[7,7] ]
    },
    fruit: {
        fill: '#e6a336',
        pixels: [ [4,3],[5,3],[6,3],[3,4],[4,4],[5,4],[6,4],[7,4],[3,5],[4,5],[5,5],[6,5],[7,5],[4,6],[5,6],[6,6],[5,7] ]
    },
    pepper: {
        fill: '#27ae60',
        pixels: [ [5,2],[6,2],[4,3],[5,3],[6,3],[7,3],[5,4],[6,4],[5,5],[6,5],[5,6],[6,6],[5,7],[6,7],[5,8],[6,8] ]
    },
    corn: {
        fill: '#f1c40f',
        pixels: [ [6,1],[5,2],[6,2],[7,2],[5,3],[6,3],[7,3],[5,4],[6,4],[7,4],[5,5],[6,5],[7,5],[5,6],[6,6],[7,6],[6,7] ]
    },
    mushroom: {
        fill: '#95a5a6',
        pixels: [ [4,5],[5,5],[6,5],[7,5],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[4,7],[5,7],[6,7],[7,7],[5,8],[6,8],[5,9],[6,9],[5,10],[6,10] ]
    },
    pumpkin: {
        fill: '#d35400',
        pixels: [ [4,4],[5,4],[6,4],[7,4],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[4,7],[5,7],[6,7],[7,7] ]
    },
    default: {
        fill: '#5a9c3a',
        pixels: [ [5,4],[6,4],[7,4],[4,5],[5,5],[6,5],[7,5],[8,5],[5,6],[6,6],[7,6],[4,7],[5,7],[6,7],[7,7],[5,8],[6,8] ]
    },
};

/** Map tên sản phẩm -> loại icon pixel */
export function getPixelPlantType(name: string): PixelPlantType {
    const n = name.toLowerCase().trim();
    if (n.includes('cà chua') || n.includes('tomato')) return 'tomato';
    if (n.includes('cà rốt') || n.includes('củ cải')) return 'carrot';
    if (n.includes('khoai tây') || n.includes('khoai lang')) return 'potato';
    if (n.includes('dâu') || n.includes('cam') || n.includes('táo') || n.includes('chuối') || n.includes('nho') || n.includes('xoài')) return 'fruit';
    if (n.includes('ớt')) return 'pepper';
    if (n.includes('bắp') || n.includes('ngô')) return 'corn';
    if (n.includes('nấm')) return 'mushroom';
    if (n.includes('bí đỏ') || n.includes('bí ngô')) return 'pumpkin';
    if (n.includes('rau') || n.includes('cải') || n.includes('xà lách') || n.includes('bắp cải') || n.includes('cải thảo')) return 'leaf';
    return 'default';
}

interface PixelPlantIconProps {
    type?: PixelPlantType;
    name?: string;
    className?: string;
    size?: number;
}

export default function PixelPlantIcon({ type, name, className = '', size = 48 }: PixelPlantIconProps) {
    const resolvedType = type ?? (name ? getPixelPlantType(name) : 'default');
    const { fill, pixels } = PIXEL_ICONS[resolvedType];
    const scale = size / 16;

    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 16 16"
            style={{ imageRendering: 'pixelated', imageRendering: 'crisp-edges' }}
        >
            {pixels.map(([x, y], i) => (
                <rect key={i} x={x} y={y} width={1} height={1} fill={fill} />
            ))}
        </svg>
    );
}
