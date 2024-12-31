from datetime import datetime
from bson import ObjectId

class Product:
    def __init__(self, 
                 name: str,
                 price: float,
                 barcode: str = None,
                 category: str = None,
                 description: str = None,
                 image: str = None,
                 cost: float = 0,
                 stock: int = 0,
                 active: bool = True,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.name = name
        self.price = price
        self.barcode = barcode
        self.category = category
        self.description = description
        self.image = image
        self.cost = cost
        self.stock = stock
        self.active = active
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            '_id': self._id,
            'name': self.name,
            'price': self.price,
            'barcode': self.barcode,
            'category': self.category,
            'description': self.description,
            'image': self.image,
            'cost': self.cost,
            'stock': self.stock,
            'active': self.active,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @staticmethod
    def from_dict(data: dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        return Product(**data)

    def validate(self):
        if not self.name:
            raise ValueError("Name is required")
        if self.price is None or self.price < 0:
            raise ValueError("Price must be non-negative")
        if self.cost is not None and self.cost < 0:
            raise ValueError("Cost must be non-negative")
        if self.stock is not None and self.stock < 0:
            raise ValueError("Stock must be non-negative")
