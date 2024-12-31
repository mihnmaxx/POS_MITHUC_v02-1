from app.models.customers import Customer
from app.utils.query_utils import build_search_query
from app.utils.pagination_utils import paginate_results
from datetime import datetime
from bson import ObjectId

class CustomerService:
    def __init__(self, db_service):
        self.db = db_service

    def get_customers(self, search=None, page=1, limit=20):
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'phone': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}}
            ]
        
        customers = self.db.find_many('customers', query)
        return paginate_results(customers, page, limit)

    def get_customer(self, customer_id: str):
        customer = self.db.find_one('customers', {'_id': ObjectId(customer_id)})
        if customer:
            orders = self.db.find_many(
                'orders',
                {'customer_id': ObjectId(customer_id)},
                limit=10
            )
            customer['recent_orders'] = orders
        return customer

    def create_customer(self, data: dict):
        if self.db.find_one('customers', {'phone': data['phone']}):
            return None

        customer = Customer(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            address=data.get('address'),
            birthday=data.get('birthday'),
            notes=data.get('notes')
        )
        customer.validate()
        customer_id = self.db.insert_one('customers', customer.to_dict())
        return customer.to_dict()

    def update_customer(self, customer_id: str, data: dict):
        customer = self.db.find_one('customers', {'_id': ObjectId(customer_id)})
        if not customer:
            return None

        if data.get('phone') and data['phone'] != customer['phone']:
            if self.db.find_one('customers', {'phone': data['phone']}):
                return None

        updates = {
            'name': data.get('name', customer['name']),
            'phone': data.get('phone', customer['phone']),
            'email': data.get('email', customer.get('email')),
            'address': data.get('address', customer.get('address')),
            'birthday': data.get('birthday', customer.get('birthday')),
            'notes': data.get('notes', customer.get('notes')),
            'membership_level': data.get('membership_level', customer.get('membership_level')),
            'points': data.get('points', customer.get('points')),
            'total_spent': data.get('total_spent', customer.get('total_spent')),
            'active': data.get('active', customer.get('active')),
            'updated_at': datetime.utcnow()
        }

        self.db.update_one(
            'customers',
            {'_id': ObjectId(customer_id)},
            {'$set': updates}
        )
        return updates

    def adjust_points(self, customer_id: str, points: int, reason: str = None):
        customer = self.db.find_one('customers', {'_id': ObjectId(customer_id)})
        if not customer:
            return None

        new_points = customer.get('points', 0) + points
        
        self.db.update_one(
            'customers',
            {'_id': ObjectId(customer_id)},
            {
                '$set': {'points': new_points},
                '$push': {
                    'points_history': {
                        'points': points,
                        'reason': reason,
                        'date': datetime.utcnow()
                    }
                }
            }
        )
        return new_points

    def search_customers(self, term: str, limit: int = 10):
        if len(term) < 2:
            return []
            
        query = {
            '$or': [
                {'name': {'$regex': term, '$options': 'i'}},
                {'phone': {'$regex': term, '$options': 'i'}},
                {'email': {'$regex': term, '$options': 'i'}}
            ]
        }
        
        return self.db.find_many('customers', query, limit=limit)
