from datetime import datetime
from bson import ObjectId
from typing import Dict

class Payment:
    def __init__(self,
                 order_number: str,
                 amount: float,
                 method: str,
                 reference: str = None,
                 status: str = 'pending',
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.order_number = order_number
        self.amount = amount
        self.method = method
        self.reference = reference
        self.status = status
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.verified_at = None

    def to_dict(self) -> Dict:
        return {
            '_id': self._id,
            'order_number': self.order_number,
            'method': self.method,
            'amount': self.amount,
            'reference': self.reference,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'verified_at': self.verified_at
        }

    @staticmethod
    def from_dict(data: Dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        return Payment(**data)

    def validate(self):
        if not self.order_id:
            raise ValueError("Order ID is required")
        if not self.method:
            raise ValueError("Payment method is required")
        if self.amount <= 0:
            raise ValueError("Amount must be positive")
        if self.method not in ['cash', 'card', 'transfer', 'momo']:
            raise ValueError("Invalid payment method")
        if self.status not in ['pending', 'completed', 'failed', 'refunded']:
            raise ValueError("Invalid payment status")

    def complete(self):
        self.status = 'completed'
        self.verified_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def fail(self):
        self.status = 'failed'
        self.updated_at = datetime.utcnow()

    def refund(self):
        self.status = 'refunded'
        self.updated_at = datetime.utcnow()
