from app.models.orders import Order, OrderItem
from datetime import datetime
from bson import ObjectId

class OrderService:
    def __init__(self, db_service):
        self.db = db_service

    def get_orders(self, filters, page=1, limit=20):
        query = {}
        
        if filters.get('status'):
            query['status'] = filters['status']
        if filters.get('customer_id'):
            query['customer_id'] = ObjectId(filters['customer_id'])
        if filters.get('start_date') and filters.get('end_date'):
            query['created_at'] = {
                '$gte': datetime.strptime(filters['start_date'], '%Y-%m-%d'),
                '$lte': datetime.strptime(filters['end_date'], '%Y-%m-%d')
            }

        # Lấy danh sách orders và sắp xếp theo thời gian tạo mới nhất
        orders = list(self.db.orders.find(query)
                    .sort('created_at', -1)
                    .skip((page-1)*limit)
                    .limit(limit))
        
        total = self.db.orders.count_documents(query)
        
        # Format response
        order_list = []
        for order in orders:
            formatted_order = {
                '_id': str(order['_id']),
                'order_number': order['order_number'],
                'customer_id': str(order['customer_id']) if order.get('customer_id') else None,
                'items': [{
                    'product_id': str(item['product_id']),
                    'name': item['name'],
                    'price': item['price'],
                    'quantity': item['quantity'],
                    'discount': item.get('discount', 0),
                    'subtotal': item['subtotal']
                } for item in order['items']],
                'subtotal': order['subtotal'],
                'tax': order['tax'],
                'total': order['total'],
                'payment_method': order['payment_method'],
                'status': order['status'],
                'notes': order.get('notes'),
                'created_by': str(order['created_by']) if order.get('created_by') else None,
                'created_at': order['created_at'].isoformat(),
                'updated_at': order['updated_at'].isoformat()
            }
            order_list.append(formatted_order)
        
        return {
            'orders': order_list,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        }

    def get_order(self, order_id):
        try:
            # Kiểm tra và chuyển đổi ObjectId
            if not ObjectId.is_valid(order_id):
                return None
                
            order = self.db.orders.find_one({'_id': ObjectId(order_id)})
            if not order:
                return None
                
            # Format response
            formatted_order = {
                '_id': str(order['_id']),
                'order_number': order['order_number'],
                'customer_id': str(order['customer_id']) if order.get('customer_id') else None,
                'items': [{
                    'product_id': str(item['product_id']),
                    'name': item['name'],
                    'price': item['price'],
                    'quantity': item['quantity'],
                    'discount': item.get('discount', 0),
                    'subtotal': item['subtotal']
                } for item in order['items']],
                'subtotal': order['subtotal'],
                'tax': order['tax'],
                'total': order['total'],
                'payment_method': order['payment_method'],
                'status': order['status'],
                'notes': order.get('notes'),
                'created_by': str(order['created_by']) if order.get('created_by') else None,
                'created_at': order['created_at'].isoformat(),
                'updated_at': order['updated_at'].isoformat()
            }
            
            return formatted_order
            
        except Exception as e:
            print(f"Error getting order: {str(e)}")
            return None

    def get_order_by_number(self, order_number):
        try:
            order = self.db.orders.find_one({'order_number': order_number})
            if not order:
                return None
                
            # Format response giống như get_order
            formatted_order = {
                '_id': str(order['_id']),
                'order_number': order['order_number'],
                'customer_id': str(order['customer_id']) if order.get('customer_id') else None,
                'items': [{
                    'product_id': str(item['product_id']),
                    'name': item['name'],
                    'price': item['price'],
                    'quantity': item['quantity'],
                    'discount': item.get('discount', 0),
                    'subtotal': item['subtotal']
                } for item in order['items']],
                'subtotal': order['subtotal'],
                'tax': order['tax'],
                'total': order['total'],
                'payment_method': order['payment_method'],
                'status': order['status'],
                'notes': order.get('notes'),
                'created_by': str(order['created_by']) if order.get('created_by') else None,
                'created_at': order['created_at'].isoformat(),
                'updated_at': order['updated_at'].isoformat()
            }
            
            return formatted_order
            
        except Exception as e:
            print(f"Error getting order by number: {str(e)}")
            return None
        
    def create_order(self, data):
        try:
            # Tạo danh sách items
            order_items = []
            for item_data in data.get('items', []):
                item = OrderItem(
                    product_id=item_data['product_id'],
                    name=item_data['name'],
                    price=float(item_data['price']),
                    quantity=int(item_data['quantity']),
                    discount=float(item_data.get('discount', 0))
                )
                order_items.append(item)

            # Tạo order mới
            order = Order(
                items=order_items,
                customer_id=data.get('customer_id') if ObjectId.is_valid(data.get('customer_id')) else None,
                payment_method=data.get('payment_method', 'cash'),
                status=data.get('status', 'pending'),
                notes=data.get('notes'),
                created_by=data.get('created_by') if ObjectId.is_valid(data.get('created_by')) else None
            )

            # Validate order
            order.validate()

            # Lưu vào database
            order_dict = order.to_dict()
            result = self.db.orders.insert_one(order_dict)
            
            # Format response
            response = order_dict.copy()
            response['_id'] = str(result.inserted_id)
            if response.get('customer_id'):
                response['customer_id'] = str(response['customer_id'])
            if response.get('created_by'):
                response['created_by'] = str(response['created_by'])
            response['created_at'] = response['created_at'].isoformat()
            response['updated_at'] = response['updated_at'].isoformat()
            
            # Format items
            for item in response['items']:
                item['product_id'] = str(item['product_id'])

            return response

        except Exception as e:
            print(f"Error creating order: {str(e)}")
            raise ValueError(str(e))
        
    def update_order_by_number(self, order_number, data):
        try:
            # Tìm đơn hàng
            order = self.db.orders.find_one({'order_number': order_number})
            if not order:
                return None

            # Cập nhật thông tin
            updates = {
                'items': [{
                    'product_id': ObjectId(item['product_id']),
                    'name': item['name'],
                    'price': float(item['price']),
                    'quantity': int(item['quantity']),
                    'discount': float(item.get('discount', 0)),
                    'subtotal': (float(item['price']) * int(item['quantity'])) - float(item.get('discount', 0))
                } for item in data.get('items', [])],
                'payment_method': data.get('payment_method', order['payment_method']),
                'status': data.get('status', order['status']),
                'notes': data.get('notes', order.get('notes')),
                'updated_at': datetime.utcnow()
            }

            # Tính toán lại tổng tiền
            subtotal = sum(item['subtotal'] for item in updates['items'])
            updates['subtotal'] = subtotal
            updates['tax'] = 0
            updates['total'] = subtotal + updates['tax']

            # Thực hiện cập nhật
            self.db.orders.update_one(
                {'order_number': order_number},
                {'$set': updates}
            )

            # Lấy và format đơn hàng sau khi cập nhật
            updated_order = self.get_order_by_number(order_number)
            return updated_order

        except Exception as e:
            print(f"Error updating order: {str(e)}")
            return None

    def update_order_status(self, order_id: str, status: str):
        if status not in ['pending', 'completed', 'cancelled']:
            raise ValueError('Invalid status')

        self.db.update_one(
            'orders',
            {'_id': ObjectId(order_id)},
            {
                '$set': {
                    'status': status,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return True
    
    def update_order_status_by_number(self, order_number, status):
        try:
            if status not in ['pending', 'completed', 'cancelled']:
                raise ValueError('Invalid status')

            result = self.db.orders.update_one(
                {'order_number': order_number},
                {
                    '$set': {
                        'status': status,
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            if result.modified_count:
                return self.get_order_by_number(order_number)
            return None

        except Exception as e:
            print(f"Error updating order status: {str(e)}")
            return None

    def void_order(self, order_id: str):
        order = self.db.find_one('orders', {'_id': ObjectId(order_id)})
        if not order:
            return False
        if order['status'] == 'cancelled':
            raise ValueError('Order is already cancelled')

        # Restore inventory
        self._update_inventory(order['items'], decrease=False)

        # Reverse customer points
        if order.get('customer_id'):
            self._reverse_customer_points(order['customer_id'], order['total'])

        # Update order status
        self.db.update_one(
            'orders',
            {'_id': ObjectId(order_id)},
            {
                '$set': {
                    'status': 'cancelled',
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return True
    
    def void_order_by_number(self, order_number):
        try:
            result = self.db.orders.update_one(
                {
                    'order_number': order_number,
                    'status': {'$ne': 'cancelled'}  # Chỉ hủy đơn chưa bị hủy
                },
                {
                    '$set': {
                        'status': 'cancelled',
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0

        except Exception as e:
            print(f"Error voiding order: {str(e)}")
            return False

    def update_order_status_by_number(self, order_number, status):
        try:
            order = self.db.orders.find_one({'order_number': order_number})
            if not order:
                return None

            if status == 'completed':
                # Cập nhật inventory khi hoàn thành đơn
                for item in order['items']:
                    self.db.products.update_one(
                        {'_id': item['product_id']},
                        {'$inc': {'stock_quantity': -item['quantity']}}
                    )

            result = self.db.orders.update_one(
                {'order_number': order_number},
                {
                    '$set': {
                        'status': status,
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            if result.modified_count:
                return self.get_order_by_number(order_number)
            return None

        except Exception as e:
            print(f"Error updating order status: {str(e)}")
            return None
        
    def void_order_by_number(self, order_number):
        try:
            order = self.db.orders.find_one({'order_number': order_number})
            if not order or order['status'] == 'cancelled':
                return False

            # Hoàn lại inventory nếu đơn đã completed
            if order['status'] == 'completed':
                for item in order['items']:
                    self.db.products.update_one(
                        {'_id': item['product_id']},
                        {'$inc': {'stock_quantity': item['quantity']}}
                    )

            result = self.db.orders.update_one(
                {'order_number': order_number},
                {
                    '$set': {
                        'status': 'cancelled',
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0

        except Exception as e:
            print(f"Error voiding order: {str(e)}")
            return False

    def _update_customer_points(self, customer_id: ObjectId, total: float):
        points_earned = int(total / 10000)  # 1 point per 10,000
        self.db.update_one(
            'customers',
            {'_id': customer_id},
            {
                '$inc': {
                    'points': points_earned,
                    'total_spent': total
                }
            }
        )

    def _reverse_customer_points(self, customer_id: ObjectId, total: float):
        points_reversed = int(total / 10000)
        self.db.update_one(
            'customers',
            {'_id': customer_id},
            {
                '$inc': {
                    'points': -points_reversed,
                    'total_spent': -total
                }
            }
        )
