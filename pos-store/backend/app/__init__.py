from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from flask_pymongo import PyMongo
from config import Config
from flask_mail import Mail
from app.utils.init_db import init_database
from app.services.service_container import ServiceContainer
import certifi
from app.utils.json_encoder import CustomJSONProvider
from app.services.mail_service import MailService

# Khai báo biến global
mongo = None
mail = None
mail_service = None

def create_app():
    global mongo, mail, mail_service
    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['MAIL_DEBUG'] = 0
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://192.168.2.4:3000",
                "http://localhost:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    app.json = CustomJSONProvider(app)

    # Initialize Flask-Mail
    mail = Mail()
    mail.init_app(app)
    mail_service = MailService(mail)

    # Kết nối MongoDB Atlas với SSL certificate
    mongo = PyMongo(app, tlsCAFile=certifi.where())

    # Kiểm tra kết nối
    try:
        mongo.db.command('ping')
    except:
        raise ConnectionError("Cannot connect to MongoDB")

    # Khởi tạo database và dữ liệu mặc định
    init_database(app, mongo)

    # Khởi tạo services
    services = ServiceContainer(mongo.db, mail_service)

    from app.services import (
        CategoryService, 
        CustomerService,
        OrderService,
        PaymentService,
        ProductService,
        SettingService,
        CacheService,
        StorageService
    )

    # Create service instances
    category_service = CategoryService(mongo.db)
    customer_service = CustomerService(mongo.db)
    order_service = OrderService(mongo.db)
    payment_service = PaymentService(mongo.db)
    product_service = ProductService(mongo.db)
    setting_service = SettingService(mongo.db)
    cache_service = CacheService(app.config)
    storage_service = StorageService(app.config)

    # Khởi tạo API với Swagger UI
    api = Api(app, 
        title='POS Store API',
        version='1.0',
        description='API Documentation for POS Store',
        doc='/api/docs'
    )

    # Import và đăng ký các namespaces
    from app.routes import products, orders, customers, category, payment, setting, auth, upload

    # Thêm các namespaces vào API
    api.add_namespace(auth.auth_ns, path='/api/auth')
    api.add_namespace(products.products_ns, path='/api/products')
    api.add_namespace(orders.orders_ns, path='/api/orders')
    api.add_namespace(customers.customers_ns, path='/api/customers')
    api.add_namespace(category.category_ns, path='/api/category')
    api.add_namespace(payment.payment_ns, path='/api/payment')
    api.add_namespace(setting.setting_ns, path='/api/setting')
    api.add_namespace(upload.upload_ns, path='/api/upload')

    # Health check endpoint
    @app.route('/ping')
    def ping():
        return {'message': 'API is running'}
    
    return app

# Export create_app function
__all__ = ['create_app', 'mongo', 'mail_service']