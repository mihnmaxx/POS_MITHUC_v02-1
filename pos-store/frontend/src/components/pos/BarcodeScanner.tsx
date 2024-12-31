'use client'

import { useEffect, useState } from 'react'
import { useSound } from 'use-sound'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QrCode, Printer, RefreshCcw } from 'lucide-react'
import { set } from 'react-hook-form'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
}

declare global {
  interface Navigator {
    usb: {
      getDevices: () => Promise<USBDevice[]>
    }
  }
}

interface USBDevice {
  open: () => Promise<void>
  selectConfiguration: (configurationValue: number) => Promise<void>
}

const SUPPORTED_DEVICES = {
  scanner: { vendorId: 0xe851, productId: 0x2100, name: 'Barcode Scanner' },
  printer: { vendorId: 0x0456, productId: 0x0808, name: 'Receipt Printer' }
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('')
  const [scannerConnected, setScannerConnected] = useState(false)
  const [playSuccess] = useSound('/sounds/beep-success.mp3', {
    soundEnabled: scannerConnected
  })
  const [playError] = useSound('/sounds/beep-error.mp3')
  const [isListening, setIsListening] = useState(false)
  const [printerConnected, setPrinterConnected] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const validateBarcode = (code: string) => {
    // Kiểm tra mã vạch hợp lệ (EAN-13, UPC-A, Code128)
    const validFormats = {
      'EAN13': /^[0-9]{13}$/,
      'UPCA': /^[0-9]{12}$/,
      'CODE128': /^[A-Z0-9]{6,20}$/
    }
    
    return Object.values(validFormats).some(regex => regex.test(code))
  }

  const listenToScanner = async (device: USBDevice, endpointNumber: number) => {
    console.log('Bắt đầu lắng nghe từ endpoint:', endpointNumber);
    setIsListening(true);
  
    // Định nghĩa buffer size cho dữ liệu
    const PACKET_SIZE = 64;
    
    while (true) {
      try {
        // Đọc dữ liệu từ endpoint với buffer size cụ thể
        const result = await device.transferIn(endpointNumber, PACKET_SIZE);
        
        if (result.data && result.data.byteLength > 0) {
          // Chuyển đổi dữ liệu nhận được thành text
          const scannedData = new TextDecoder().decode(result.data);
          console.log('Dữ liệu quét được:', scannedData);
          
          // Xử lý dữ liệu quét được
          if (validateBarcode(scannedData.trim())) {
            setBarcode(scannedData.trim());
            playSuccess();
            onScan(scannedData.trim());
            toast.success('Đã quét mã thành công');
          }
        }
      } catch (error) {
        console.log('Lỗi khi đọc dữ liệu:', error);
        setIsListening(false);
        break;
      }
    }
  }  

  const requestUSBAccess = async () => {
    if (!navigator.usb) {
      toast.error('Trình duyệt không hỗ trợ WebUSB')
      return
    }
  
    setIsRequesting(true)
    try {
      const device = await navigator.usb.requestDevice({
        filters: Object.values(SUPPORTED_DEVICES)
      })
      
      if (device) {
        console.log('Thiết bị được chọn:', device)
        await device.open()
        await device.selectConfiguration(1)
        
        // Lấy interface và endpoint
        const usbInterface = device.configuration.interfaces[0]
        console.log('Interface:', usbInterface)

        await device.claimInterface(usbInterface.interfaceNumber)
        await device.selectAlternateInterface(usbInterface.interfaceNumber, 0)

        const endpoint = usbInterface.alternate.endpoints.find(
          e => e.direction === 'in' && e.type === 'interrupt'
        );
        console.log('Endpoint:', endpoint)

        if (endpoint) {
          // Lưu endpoint number để sử dụng trong listenToScanner
          const endpointNumber = endpoint.endpointNumber
          listenToScanner(device, endpointNumber)
          setScannerConnected(true)
        }
        toast.success(`Đã kết nối thiết bị ${device.productName}`)
        await checkUSBDevices()
      }
    } catch (error) {
      console.log('Lỗi kết nối:', error)
      toast.error('Không thể kết nối thiết bị USB')
    } finally {
      setIsRequesting(false)
    }
  }

  const checkUSBDevices = async () => {
    if (!navigator.usb) return

    try {
      const devices = await navigator.usb.getDevices()
      
      setScannerConnected(devices.some(
        d => d.vendorId === SUPPORTED_DEVICES.scanner.vendorId && 
            d.productId === SUPPORTED_DEVICES.scanner.productId
      ))
      
      setPrinterConnected(devices.some(
        d => d.vendorId === SUPPORTED_DEVICES.printer.vendorId && 
            d.productId === SUPPORTED_DEVICES.printer.productId
      ))
    } catch (error) {
      console.error('Lỗi kiểm tra thiết bị USB:', error)
    }
  }

  useEffect(() => {
    let currentBarcode = '';
    let lastKeyTime = Date.now();
    const BARCODE_DELAY = 50;
  
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > BARCODE_DELAY) {
        currentBarcode = '';
      }
      
      if (e.key === 'Enter') {
        if (currentBarcode && validateBarcode(currentBarcode)) {
          playSuccess();
          onScan(currentBarcode);
          toast.success('Đã quét mã thành công');
        }
        currentBarcode = '';
      } else if (/^[0-9A-Z]$/.test(e.key.toUpperCase())) {
        currentBarcode += e.key.toUpperCase();
      }
      
      lastKeyTime = currentTime;
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onScan, playSuccess, validateBarcode]); // Dependency array cố định  
  
  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Badge variant={scannerConnected ? "secondary" : "destructive"}>
            <QrCode className="w-4 h-4 mr-1" />
            {scannerConnected && isListening && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-2 ring-green-300" />
            )}
            {scannerConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </Badge>
          <Badge variant={printerConnected ? "secondary" : "destructive"}>
            <Printer className="w-4 h-4 mr-1" />
            {printerConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={requestUSBAccess}
          disabled={isRequesting}
        >
          <RefreshCcw className={`w-4 h-4 mr-1 ${isRequesting ? 'animate-spin' : ''}`} />
          Kết nối thiết bị
        </Button>
      </div>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold">Quét mã sản phẩm</h2>
        <div className="mt-2 text-muted-foreground">
          {scannerConnected 
            ? (barcode 
                ? <span className="font-mono">{barcode}</span>
                : 'Đang chờ quét...'
              ) 
            : 'Vui lòng kết nối máy quét'
          }
        </div>
      </div>
    </div>
  )
}