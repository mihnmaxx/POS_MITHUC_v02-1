from datetime import datetime
from typing import Dict, List

class ReceiptTemplate:
    def __init__(self,
                 header: str = None,
                 footer: str = None,
                 logo: str = None,
                 font_size: int = 12,
                 paper_size: str = '80mm',
                 show_logo: bool = True,
                 show_barcode: bool = True,
                 custom_fields: List[Dict] = None):
        self.header = header
        self.footer = footer
        self.logo = logo
        self.font_size = font_size
        self.paper_size = paper_size
        self.show_logo = show_logo
        self.show_barcode = show_barcode
        self.custom_fields = custom_fields or []

class PaymentConfig:
    def __init__(self,
                 methods: List[Dict] = None,
                 momo_api_key: str = None,
                 bank_accounts: List[Dict] = None,
                 default_method: str = 'cash'):
        self.methods = methods or []
        self.momo_api_key = momo_api_key
        self.bank_accounts = bank_accounts or []
        self.default_method = default_method

class StoreInfo:
    def __init__(self,
                 name: str = None,
                 address: str = None,
                 phone: str = None,
                 email: str = None,
                 tax_code: str = None,
                 logo: str = None,
                 working_hours: Dict = None):
        self.name = name
        self.address = address
        self.phone = phone
        self.email = email
        self.tax_code = tax_code
        self.logo = logo
        self.working_hours = working_hours or {}

class PrinterConfig:
    def __init__(self,
                 type: str = 'thermal',
                 interface: str = 'usb',
                 port: str = None,
                 vendor_id: str = None,
                 product_id: str = None,
                 paper_width: int = 80,
                 dpi: int = 203):
        self.type = type
        self.interface = interface
        self.port = port
        self.vendor_id = vendor_id
        self.product_id = product_id
        self.paper_width = paper_width
        self.dpi = dpi

class Setting:
    def __init__(self,
                 receipt_template: ReceiptTemplate = None,
                 payment_config: PaymentConfig = None,
                 store_info: StoreInfo = None,
                 printer_config: PrinterConfig = None):
        self.receipt_template = receipt_template or ReceiptTemplate()
        self.payment_config = payment_config or PaymentConfig()
        self.store_info = store_info or StoreInfo()
        self.printer_config = printer_config or PrinterConfig()
        self.updated_at = datetime.utcnow()

    def to_dict(self) -> Dict:
        return {
            'receipt_template': vars(self.receipt_template),
            'payment_config': vars(self.payment_config),
            'store_info': vars(self.store_info),
            'printer_config': vars(self.printer_config),
            'updated_at': self.updated_at
        }

    @staticmethod
    def from_dict(data: Dict):
        return Setting(
            receipt_template=ReceiptTemplate(**data.get('receipt_template', {})),
            payment_config=PaymentConfig(**data.get('payment_config', {})),
            store_info=StoreInfo(**data.get('store_info', {})),
            printer_config=PrinterConfig(**data.get('printer_config', {}))
        )
