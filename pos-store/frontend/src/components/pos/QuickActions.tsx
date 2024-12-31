export function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="grid grid-cols-2 gap-2">
        <button className="p-2 bg-primary/10 hover:bg-primary/20 rounded-md text-primary">
          Tạm tính
        </button>
        <button className="p-2 bg-destructive/10 hover:bg-destructive/20 rounded-md text-destructive">
          Hủy
        </button>
        <button className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-md text-green-500">
          Khách hàng
        </button>
        <button className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-md text-yellow-500">
          Giảm giá
        </button>
      </div>
    </div>
  )
}