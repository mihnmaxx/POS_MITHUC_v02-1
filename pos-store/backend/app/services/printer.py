from escpos.printer import Usb, Serial, Network
from PIL import Image
from io import BytesIO
import qrcode
from datetime import datetime

class PrinterService:
    def __init__(self, config):
        self.config = config
        self.printer = self._init_printer()

    def _init_printer(self):
        if self.config['interface'] == 'usb':
            return Usb(
                self.config['vendor_id'],
                self.config['product_id']
            )
        elif self.config['interface'] == 'serial':
            return Serial(self.config['port'])
        elif self.config['interface'] == 'network':
            return Network(self.config['host'])
        
    def print_receipt(self, order, settings):
        try:
            # Print header
            if settings.store_info.logo and settings.receipt_template.show_logo:
                self._print_logo(settings.store_info.logo)
            
            self.printer.text(f"\n{settings.store_info.name}\n")
            self.printer.text(f"{settings.store_info.address}\n")
            self.printer.text(f"Tel: {settings.store_info.phone}\n")
            self.printer.text(f"VAT: {settings.store_info.tax_code}\n\n")
            
            # Order info
            self.printer.text(f"Hóa đơn: #{order.order_number}\n")
            self.printer.text(f"Ngày: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
            if order.customer:
                self.printer.text(f"Khách hàng: {order.customer.name}\n")
            
            # Items
            self.printer.text("-" * 32 + "\n")
            self.printer.text("Sản phẩm".ljust(20) + "SL".rjust(4) + "T.Tiền".rjust(8) + "\n")
            self.printer.text("-" * 32 + "\n")
            
            for item in order.items:
                name = item.name[:18] + ".." if len(item.name) > 20 else item.name
                qty = str(item.quantity)
                total = f"{item.subtotal:,.0f}"
                self.printer.text(f"{name.ljust(20)}{qty.rjust(4)}{total.rjust(8)}\n")
            
            # Totals
            self.printer.text("-" * 32 + "\n")
            self.printer.text(f"{'Tạm tính:'.ljust(24)}{order.subtotal:,.0f}\n")
            if order.discount:
                self.printer.text(f"{'Giảm giá:'.ljust(24)}{order.discount:,.0f}\n")
            self.printer.text(f"{'Thuế:'.ljust(24)}{order.tax:,.0f}\n")
            self.printer.text(f"{'Tổng cộng:'.ljust(24)}{order.total:,.0f}\n")
            
            # Payment
            self.printer.text("-" * 32 + "\n")
            self.printer.text(f"Thanh toán: {order.payment_method}\n")
            
            # Footer
            if settings.receipt_template.footer:
                self.printer.text("\n" + settings.receipt_template.footer + "\n")
            
            # QR code if enabled
            if settings.receipt_template.show_barcode:
                self._print_qr(order.order_number)
            
            self.printer.cut()
            
        except Exception as e:
            raise Exception(f"Print error: {str(e)}")

    def _print_logo(self, logo_path):
        try:
            logo = Image.open(logo_path)
            self.printer.image(logo)
        except:
            pass

    def _print_qr(self, data):
        qr = qrcode.QRCode(version=1, box_size=4)
        qr.add_data(data)
        qr.make()
        qr_image = qr.make_image()
        
        # Convert QR to printer format
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        self.printer.image(Image.open(buffer))

    def test_print(self):
        try:
            self.printer.text("Test print\n")
            self.printer.text("Printer is working!\n")
            self.printer.cut()
            return True
        except:
            return False
