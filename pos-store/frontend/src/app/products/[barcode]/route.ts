import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const response = await productService.getProductByBarcode(params.barcode)
    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Không tìm thấy sản phẩm' },
      { status: 404 }
    )
  }
}
