from flask_restx import Namespace
from app import mongo, mail_service
from app.services import AuthService

# Khởi tạo services
auth_service = AuthService(mongo.db, mail_service)

# Initialize namespaces
auth_ns = Namespace('auth', description='Authentication operations', path='/api/auth')
category_ns = Namespace('categories', description='Category operations', path='/api/categories')
customers_ns = Namespace('customers', description='Customer operations', path='/api/customers')
orders_ns = Namespace('orders', description='Order operations', path='/api/orders')
payment_ns = Namespace('payments', description='Payment operations', path='/api/payments')
products_ns = Namespace('products', description='Product operations', path='/api/products')
setting_ns = Namespace('settings', description='Settings operations', path='/api/settings')

# Import routes
from . import auth
from . import category
from . import customers
from . import orders
from . import payment
from . import products
from . import setting

__all__ = [
    'auth_ns',
    'category_ns',
    'customers_ns',
    'orders_ns',
    'payment_ns',
    'products_ns',
    'setting_ns'
]