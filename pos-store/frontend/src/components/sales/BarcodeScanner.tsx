'use client'

import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = new BrowserMultiFormatReader()

  const startScanning = async () => {
    try {
      const videoInputDevices = await codeReader.listVideoInputDevices()
      const selectedDeviceId = videoInputDevices[0].deviceId
      
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result) => {
          if (result) {
            console.log('Barcode detected:', result.getText())
            // Thêm sản phẩm vào giỏ hàng
          }
        }
      )
    } catch (err) {
      console.error('Error accessing camera:', err)
    }
  }

  useEffect(() => {
    return () => {
      codeReader.reset()
    }
  }, [])

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <video ref={videoRef} className="w-full max-w-[640px]" />
        <Button onClick={startScanning}>Bắt đầu quét mã</Button>
      </div>
    </Card>
  )
}
