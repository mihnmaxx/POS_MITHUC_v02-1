from app.models.setting import Setting, ReceiptTemplate, PaymentConfig, StoreInfo, PrinterConfig
from datetime import datetime

class SettingService:
    def __init__(self, db_service):
        self.db = db_service
        self.settings_id = 'global'

    def get_settings(self):
        return self.db.find_one('settings', {'_id': self.settings_id})

    def get_receipt_settings(self):
        settings = self.db.find_one('settings', {'_id': self.settings_id})
        return settings.get('receipt_template', {})

    def update_receipt_settings(self, data: dict):
        template = ReceiptTemplate(
            header=data.get('header'),
            footer=data.get('footer'),
            logo=data.get('logo'),
            font_size=data.get('font_size', 12),
            paper_size=data.get('paper_size', '80mm'),
            show_logo=data.get('show_logo', True),
            show_barcode=data.get('show_barcode', True),
            custom_fields=data.get('custom_fields', [])
        )
        
        self.db.update_one(
            'settings',
            {'_id': self.settings_id},
            {'$set': {'receipt_template': vars(template)}},
            upsert=True
        )
        return vars(template)

    def get_payment_settings(self):
        settings = self.db.find_one('settings', {'_id': self.settings_id})
        return settings.get('payment_config', {})

    def update_payment_settings(self, data: dict):
        config = PaymentConfig(
            methods=data.get('methods', []),
            momo_api_key=data.get('momo_api_key'),
            bank_accounts=data.get('bank_accounts', []),
            default_method=data.get('default_method', 'cash')
        )
        
        self.db.update_one(
            'settings',
            {'_id': self.settings_id},
            {'$set': {'payment_config': vars(config)}},
            upsert=True
        )
        return vars(config)

    def get_store_settings(self):
        settings = self.db.find_one('settings', {'_id': self.settings_id})
        return settings.get('store_info', {})

    def update_store_settings(self, data: dict):
        info = StoreInfo(
            name=data.get('name'),
            address=data.get('address'),
            phone=data.get('phone'),
            email=data.get('email'),
            tax_code=data.get('tax_code'),
            logo=data.get('logo'),
            working_hours=data.get('working_hours', {})
        )
        
        self.db.update_one(
            'settings',
            {'_id': self.settings_id},
            {'$set': {'store_info': vars(info)}},
            upsert=True
        )
        return vars(info)

    def get_printer_settings(self):
        settings = self.db.find_one('settings', {'_id': self.settings_id})
        return settings.get('printer_config', {})

    def update_printer_settings(self, data: dict):
        config = PrinterConfig(
            type=data.get('type', 'thermal'),
            interface=data.get('interface', 'usb'),
            port=data.get('port'),
            vendor_id=data.get('vendor_id'),
            product_id=data.get('product_id'),
            paper_width=data.get('paper_width', 80),
            dpi=data.get('dpi', 203)
        )
        
        self.db.update_one(
            'settings',
            {'_id': self.settings_id},
            {'$set': {'printer_config': vars(config)}},
            upsert=True
        )
        return vars(config)

    def get_config_settings(self):
        settings = self.db.find_one('settings', {'_id': self.settings_id})
        return settings.get('config', {})

    def update_config_settings(self, data: dict):
        config = {
            'debug': data.get('debug', False),
            'host': data.get('host', '0.0.0.0'),
            'port': data.get('port', 5000),
            'timezone': data.get('timezone', 'Asia/Ho_Chi_Minh'),
            'upload_folder': data.get('upload_folder', 'uploads'),
            'allowed_extensions': data.get('allowed_extensions', ['png','jpg','jpeg','gif']),
            'cache_type': data.get('cache_type', 'simple'),
            'cache_timeout': data.get('cache_timeout', 300),
            'mail_settings': data.get('mail_settings', {})
        }

        self.db.update_one(
            'settings',
            {'_id': self.settings_id},
            {'$set': {'config': config}},
            upsert=True
        )
        return config
