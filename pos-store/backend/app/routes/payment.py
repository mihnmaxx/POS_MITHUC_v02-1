from flask import request
from flask_restx import Namespace, Resource, fields
from app import mongo
from app.services import PaymentService

payment_ns = Namespace('payment', description='Payment operations')
payment_service = PaymentService(mongo.db)

@payment_ns.route('/methods')
class PaymentMethods(Resource):
    @payment_ns.doc('get_payment_methods',
        params={
            'active_only': 'Chỉ lấy phương thức đang hoạt động (true/false)',
            'type': 'Lọc theo loại (cash/card/transfer/momo)'
        })
    def get(self):
        """Lấy danh sách phương thức thanh toán"""
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        payment_type = request.args.get('type')
        methods = payment_service.get_payment_methods(active_only, payment_type)
        return {'methods': methods}

@payment_ns.route('/order/<order_number>/process')
class ProcessPayment(Resource):
    @payment_ns.doc('process_payment')
    @payment_ns.expect(payment_ns.model('PaymentModel', {
        'amount': fields.Float(required=True, description='Payment amount'),
        'method': fields.String(required=True, description='Payment method')
    }))
    def post(self, order_number):
        """Xử lý thanh toán cho đơn hàng"""
        data = request.get_json()
        payment = payment_service.process_payment(order_number, data)
        if not payment:
            payment_ns.abort(404, "Order not found")
        return payment
    
@payment_ns.route('/order/<order_number>/verify')
class VerifyPayment(Resource):
    @payment_ns.doc('verify_payment')
    def post(self, order_number):
        """Xác nhận thanh toán"""
        data = request.get_json()
        result = payment_service.verify_payment(order_number, data)
        if not result:
            payment_ns.abort(404, "Payment not found")
        return result
    
@payment_ns.route('/refund/<order_number>')
class RefundPayment(Resource):
    @payment_ns.doc('refund_payment')
    def post(self, order_number):
        """Hoàn tiền"""
        data = request.get_json()
        refund = payment_service.refund_payment(order_number, data)
        if not refund:
            payment_ns.abort(400, 'Only completed payments can be refunded')
        return refund