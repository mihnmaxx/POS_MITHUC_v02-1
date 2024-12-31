from app.services.auth_service import AuthService
from app.services.product_service import ProductService
from app.services.order_service import OrderService
from app.services.category_service import CategoryService
from app.services.payment_service import PaymentService

class ServiceContainer:
    def __init__(self, db, mail_service):
        self.db = db
        self.mail_service = mail_service
        self.auth_service = AuthService(db, mail_service)
        self.product_service = ProductService(db)
        self.order_service = OrderService(db)
        self.category_service = CategoryService(db)
        self.payment_service = PaymentService(db)