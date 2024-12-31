from flask import request
from flask_restx import Resource, Namespace, fields
from app import mongo
from app.services.order_service import OrderService

orders_ns = Namespace('orders', description='Orders operations')
order_service = OrderService(mongo.db)

# Model cho OrderItem
order_item_model = orders_ns.model('OrderItem', {
    'product_id': fields.String(required=True, description='ID của sản phẩm'),
    'name': fields.String(required=True, description='Tên sản phẩm'),
    'price': fields.Float(required=True, description='Giá bán'),
    'quantity': fields.Integer(required=True, description='Số lượng'),
    'discount': fields.Float(description='Giảm giá cho item')
})

# Model cho Order
order_model = orders_ns.model('Order', {
    'customer_id': fields.String(description='ID khách hàng'),
    'items': fields.List(fields.Nested(order_item_model), required=True),
    'payment_method': fields.String(enum=['cash', 'card', 'transfer'], default='cash'),
    'status': fields.String(enum=['pending', 'completed', 'cancelled'], default='pending'),
    'notes': fields.String(description='Ghi chú đơn hàng'),
    'created_by': fields.String(description='ID người tạo đơn')
})

@orders_ns.route('/')
class OrderList(Resource):
    @orders_ns.doc('list_orders',
        params={
            'status': 'Lọc theo trạng thái đơn hàng',
            'customer_id': 'Lọc theo khách hàng',
            'start_date': 'Ngày bắt đầu (YYYY-MM-DD)',
            'end_date': 'Ngày kết thúc (YYYY-MM-DD)',
            'page': 'Số trang',
            'limit': 'Số lượng item mỗi trang'
        })
    def get(self):
        """Lấy danh sách đơn hàng"""
        filters = {
            'status': request.args.get('status'),
            'customer_id': request.args.get('customer_id'),
            'start_date': request.args.get('start_date'),
            'end_date': request.args.get('end_date')
        }
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        result = order_service.get_orders(filters, page, limit)
        return result

    @orders_ns.doc('create_order')
    @orders_ns.expect(order_model)
    def post(self):
        """Tạo đơn hàng mới"""
        data = request.get_json()
        order = order_service.create_order(data)
        return order, 201

@orders_ns.route('/<id>')
@orders_ns.param('id', 'Order ID')
class Order(Resource):
    @orders_ns.doc('get_order')
    def get(self, id):
        """Lấy thông tin đơn hàng"""
        order = order_service.get_order(id)
        if not order:
            orders_ns.abort(404, "Order not found")
        return order

@orders_ns.route('/number/<order_number>')
@orders_ns.param('order_number', 'Order Number')
class OrderByNumber(Resource):
    @orders_ns.doc('get_order_by_number')
    def get(self, order_number):
        """Lấy thông tin đơn hàng theo order number"""
        order = order_service.get_order_by_number(order_number)
        if not order:
            orders_ns.abort(404, "Order not found")
        return order

@orders_ns.route('/number/<order_number>/update')
@orders_ns.param('order_number', 'Order Number')
class OrderUpdate(Resource):
    @orders_ns.doc('update_order')
    @orders_ns.expect(order_model)
    def put(self, order_number):
        """Cập nhật thông tin đơn hàng theo order number"""
        data = request.get_json()
        order = order_service.update_order_by_number(order_number, data)
        if not order:
            orders_ns.abort(404, "Order not found")
        return order

@orders_ns.route('/<id>/status')
@orders_ns.param('id', 'Order ID')
class OrderStatus(Resource):
    @orders_ns.doc('update_order_status')
    @orders_ns.expect(orders_ns.model('OrderStatus', {
        'status': fields.String(required=True, enum=['pending', 'completed', 'cancelled'])
    }))
    def put(self, id):
        """Cập nhật trạng thái đơn hàng"""
        data = request.get_json()
        order = order_service.update_order_status(id, data['status'])
        return order

@orders_ns.route('/number/<order_number>/status')
@orders_ns.param('order_number', 'Order Number')
class OrderStatus(Resource):
    @orders_ns.doc('update_order_status')
    @orders_ns.expect(orders_ns.model('OrderStatus', {
        'status': fields.String(required=True, enum=['pending', 'completed', 'cancelled'])
    }))
    def put(self, order_number):
        """Cập nhật trạng thái đơn hàng theo order number"""
        data = request.get_json()
        order = order_service.update_order_status_by_number(order_number, data['status'])
        if not order:
            orders_ns.abort(404, "Order not found")
        return order

@orders_ns.route('/<id>/void')
@orders_ns.param('id', 'Order ID')
class OrderVoid(Resource):
    @orders_ns.doc('void_order')
    def post(self, id):
        """Hủy đơn hàng"""
        result = order_service.void_order(id)
        if not result:
            orders_ns.abort(404, "Order not found")
        return {'message': 'Order voided successfully'}
    
@orders_ns.route('/number/<order_number>/void')
@orders_ns.param('order_number', 'Order Number')
class OrderVoid(Resource):
    @orders_ns.doc('void_order')
    def post(self, order_number):
        """Hủy đơn hàng theo order number"""
        result = order_service.void_order_by_number(order_number)
        if not result:
            orders_ns.abort(404, "Order not found")
        return {'message': 'Order voided successfully'}
