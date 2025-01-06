import { productService } from '@/services/product.service'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barcode = searchParams.get("barcode")

  if (!barcode) {
    return new Response("Barcode is missing", { status: 400 })
  }

  try {
    const { data } = await productService.getProductByBarcode(barcode)
    return Response.json(data)
  } catch {
    return Response.json(
      { error: 'Không tìm thấy sản phẩm' },
      { status: 404 }
    )
  }
}
