"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestDashboard() {
  const [lotCode, setLotCode] = useState("");
  const router = useRouter();

  const handleTrace = () => {
    if (!lotCode.trim()) return alert("Vui lòng nhập mã lô hàng!");
    // Chuyển hướng đến trang truy xuất (sẽ làm sau)
    alert(`Đang truy xuất mã: ${lotCode} (Chức năng này sẽ hiển thị nhật ký blockchain)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 font-sans">

      {/* BANNER - Enhanced */}
      <div className="bg-gradient-to-br from-[#7CB342] via-[#388E3C] to-[#00C853] text-white py-20 text-center shadow-2xl relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-sm font-semibold">🌾 Hệ Thống Nông Nghiệp Sạch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl animate-fadeInUp">Chào mừng đến với BICAP</h1>
          <p className="text-green-50 max-w-2xl mx-auto text-lg md:text-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Hệ thống nông nghiệp sạch & minh bạch nguồn gốc hàng đầu Việt Nam. 
            Kết nối trực tiếp từ nông trại đến bàn ăn.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT - 3 CHỨC NĂNG CHÍNH - Enhanced */}
      <div className="container mx-auto px-4 py-16 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* CARD 1: CHỢ NÔNG SẢN */}
          <Link href="/market" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 card-hover h-full flex flex-col">
              <div className="bg-gradient-to-br from-[#7CB342] to-[#388E3C] w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                🛒
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#388E3C] transition-colors">Chợ Nông Sản</h3>
              <p className="text-gray-600 mb-8 flex-1">
                Tìm kiếm nông sản sạch, xem giá và thông tin nhà cung cấp uy tín.
                Hỗ trợ lọc theo tiêu chuẩn VietGAP, GlobalGAP.
              </p>
              <div className="text-[#388E3C] font-bold flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                <span>Truy cập ngay</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* CARD 2: TRUY XUẤT */}
          <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 card-hover flex flex-col">
            <div className="bg-gradient-to-br from-[#FFB300] to-[#F57C00] w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg">
              🔍
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Truy xuất nguồn gốc</h3>
            <p className="text-gray-600 mb-6 flex-1">
              Nhập mã lô hàng để xem nhật ký gieo trồng, bón phân được lưu trên Blockchain.
            </p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Ví dụ: LOHANG-001" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] outline-none transition-all"
                value={lotCode}
                onChange={(e) => setLotCode(e.target.value)}
              />
              <button 
                onClick={handleTrace}
                className="w-full bg-gradient-to-r from-[#388E3C] to-[#7CB342] text-white font-bold py-3.5 rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-200 btn-glow relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kiểm tra Blockchain
                </span>
              </button>
            </div>
          </div>

          {/* CARD 3: KIẾN THỨC */}
          <Link href="/guest/education" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 card-hover h-full flex flex-col">
              <div className="bg-gradient-to-br from-[#00C853] to-[#7CB342] w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                📖
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#388E3C] transition-colors">Kiến thức nhà nông</h3>
              <p className="text-gray-600 mb-8 flex-1">
                Bài viết, video hướng dẫn canh tác và tiêu chuẩn an toàn. 
                Cập nhật tin tức nông nghiệp mới nhất.
              </p>
              <div className="text-[#388E3C] font-bold flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                <span>Xem thư viện</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}