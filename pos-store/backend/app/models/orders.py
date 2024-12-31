from datetime import datetime
import random
from bson import ObjectId
from typing import List, Dict

class OrderItem:
    def __init__(self,
                 product_id: str,
                 name: str,
                 price: float,
                 quantity: int,
                 discount: float = 0):
        self.product_id = ObjectId(product_id)
        self.name = name
        self.price = price
        self.quantity = quantity
        self.discount = discount
        self.subtotal = (price * quantity) - discount

class Order:
    def __init__(self,
                 items: List[OrderItem],
                 customer_id: str = None,
                 payment_method: str = 'cash',
                 status: str = 'pending',
                 notes: str = None,
                 created_by: str = None,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.order_number = self.generate_order_number()
        self.customer_id = ObjectId(customer_id) if customer_id else None
        self.items = items
        self.payment_method = payment_method
        self.status = status
        self.notes = notes
        self.created_by = ObjectId(created_by) if created_by else None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # Calculate totals
        self.subtotal = sum(item.subtotal for item in items)
        self.tax = 0
        self.total = self.subtotal + self.tax
        
    def to_dict(self) -> Dict:
        return {
            '_id': str(self._id),
            'order_number': self.order_number,
            'customer_id': str(self.customer_id) if self.customer_id else None,
            'items': [vars(item) for item in self.items],
            'subtotal': self.subtotal,
            'tax': self.tax,
            'total': self.total,
            'payment_method': self.payment_method,
            'status': self.status,
            'notes': self.notes,
            'created_by': str(self.created_by) if self.created_by else None,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @staticmethod
    def from_dict(data: Dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        items = [OrderItem(**item) for item in data.pop('items', [])]
        return Order(items=items, **data)

    def validate(self):
        if not self.items:
            raise ValueError("Order must have at least one item")
        if self.status not in ['pending', 'completed', 'cancelled']:
            raise ValueError("Invalid order status")
        if self.payment_method not in ['cash', 'card', 'transfer']:
            raise ValueError("Invalid payment method")

    @staticmethod
    def generate_order_number() -> str:
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_number = ''.join(random.choices('0123456789', k=4))
        return f'ORD{timestamp}{random_number}'

    def complete(self):
        self.status = 'completed'
        self.updated_at = datetime.utcnow()

    def cancel(self):
        self.status = 'cancelled'
        self.updated_at = datetime.utcnow()
