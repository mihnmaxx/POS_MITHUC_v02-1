import { Button } from "@/components/ui/button";
import { BarChart, Package, Receipt, ShoppingCart, Store, Tags } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            MITHUC POS SYSTEM
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Giải pháp quản lý bán hàng toàn diện cho doanh nghiệp của bạn
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="Bán Hàng"
            description="Giao diện POS hiện đại, dễ sử dụng. Xử lý đơn hàng nhanh chóng."
            icon={ShoppingCart}
          />
          <FeatureCard 
            title="Quản Lý Kho"
            description="Theo dõi tồn kho thời gian thực. Tự động cập nhật sau mỗi giao dịch."
            icon={Package}
          />
          <FeatureCard 
            title="Báo Cáo"
            description="Thống kê doanh thu, lợi nhuận chi tiết. Xuất báo cáo đa dạng."
            icon={BarChart}
          />
          <FeatureCard 
            title="Khuyến Mãi"
            description="Tạo và quản lý chương trình khuyến mãi linh hoạt."
            icon={Tags}
          />
          <FeatureCard 
            title="Đa Chi Nhánh"
            description="Quản lý nhiều cửa hàng trên cùng một hệ thống."
            icon={Store}
          />
          <FeatureCard 
            title="Thanh Toán"
            description="Hỗ trợ đa dạng phương thức thanh toán an toàn."
            icon={Receipt}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Bắt đầu sử dụng ngay hôm nay</h2>
          <p className="mt-4 text-muted-foreground">
            Trải nghiệm giải pháp quản lý bán hàng hiện đại
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Dùng thử miễn phí</Button>
            <Button size="lg" variant="outline">Xem demo</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="p-6 bg-background rounded-lg border">
      <Icon className="w-12 h-12 text-primary" />
      <h3 className="mt-4 text-xl font-medium">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

