"use client";
import { useEffect, useState } from "react";
import axios from "axios"; 

// Định nghĩa kiểu dữ liệu cho bài viết (để code nhắc lệnh thông minh hơn)
interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

export default function EducationPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Gọi API bằng Axios
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles`);
        setArticles(response.data);
      } catch (err) {
        console.error("Lỗi API:", err);
        setError("Không thể kết nối Server. Hiển thị dữ liệu mẫu.");
        
        // Dữ liệu mẫu (Fallback) khi API lỗi
        setArticles([
          { id: 1, title: "Quy trình trồng rau thủy canh", content: "Hướng dẫn chi tiết cách pha chế dung dịch...", category: "Kỹ thuật" },
          { id: 2, title: "Cách nhận biết thực phẩm VietGAP", content: "Kiểm tra tem truy xuất nguồn gốc...", category: "Mẹo hay" },
          { id: 3, title: "Blockchain trong nông nghiệp 4.0", content: "Công nghệ minh bạch hóa dữ liệu...", category: "Công nghệ" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-2">📚 Kiến Thức Nhà Nông</h1>
        <p className="text-gray-500 mb-8">Tổng hợp bài viết, kỹ thuật canh tác và tiêu chuẩn an toàn.</p>

        {/* Thông báo lỗi nhẹ nếu có */}
        {error && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">
                    {item.category}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">{item.content}</p>
                <button className="text-green-600 font-semibold hover:text-green-800 flex items-center gap-1 text-sm">
                  Đọc chi tiết <span>→</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}