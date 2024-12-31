from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash
from datetime import datetime

def init_database(app, mongo):
    # Tạo các collections cần thiết
    collections = [
        'users', 
        'products', 
        'orders', 
        'customers', 
        'categories', 
        'settings',
        'payments',
        'inventory'
    ]
    
    for collection in collections:
        if collection not in mongo.db.list_collection_names():
            mongo.db.create_collection(collection)

    # Khởi tạo user admin mặc định
    if mongo.db.users.count_documents({}) == 0:
        admin_user = {
            'email': 'admin@pos.com',
            'password': generate_password_hash('admin123'),
            'name': 'Admin',
            'role': 'admin',
            'active': True,
            'created_at': datetime.utcnow()
        }
        mongo.db.users.insert_one(admin_user)

    # Khởi tạo settings mặc định
    if mongo.db.settings.count_documents({}) == 0:
        default_settings = {
            '_id': 'global',
            'store_info': {
                'name': 'POS Store',
                'address': 'Your Address',
                'phone': 'Your Phone',
                'email': 'store@email.com',
                'tax_code': '',
                'logo': None
            },
            'receipt_template': {
                'header': 'Welcome to POS Store',
                'footer': 'Thank you for shopping!',
                'font_size': 12,
                'paper_size': '80mm',
                'show_logo': True,
                'show_barcode': True
            },
            'payment_config': {
                'methods': ['cash', 'card', 'transfer'],
                'default_method': 'cash'
            },
            'printer_config': {
                'type': 'thermal',
                'interface': 'usb',
                'paper_width': 80,
                'dpi': 203
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        mongo.db.settings.insert_one(default_settings)

    # Khởi tạo danh mục mặc định
    if mongo.db.categories.count_documents({}) == 0:
        default_categories = [
            {
                'name': 'Đồ uống',
                'description': 'Các loại đồ uống',
                'icon': 'coffee',
                'active': True,
                'created_at': datetime.utcnow()
            },
            {
                'name': 'Thức ăn',
                'description': 'Các món ăn',
                'icon': 'utensils',
                'active': True,
                'created_at': datetime.utcnow()
            }
        ]
        mongo.db.categories.insert_many(default_categories)

    # Tạo indexes
    mongo.db.users.create_index('email', unique=True)
    mongo.db.products.create_index('barcode', unique=True)
    mongo.db.customers.create_index('phone', unique=True)
    mongo.db.orders.create_index('order_number', unique=True)
