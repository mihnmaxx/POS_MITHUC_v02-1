from datetime import datetime
from bson import ObjectId

class Customer:
    def __init__(self,
                 name: str,
                 phone: str,
                 email: str = None,
                 address: str = None,
                 birthday: str = None,
                 notes: str = None,
                 membership_level: str = 'regular',
                 points: int = 0,
                 total_spent: float = 0,
                 active: bool = True,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.name = name
        self.phone = phone
        self.email = email
        self.address = address
        self.birthday = birthday
        self.notes = notes
        self.membership_level = membership_level
        self.points = points
        self.total_spent = total_spent
        self.active = active
        self.points_history = []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            '_id': str(self._id),
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'birthday': self.birthday,
            'notes': self.notes,
            'membership_level': self.membership_level,
            'points': self.points,
            'total_spent': self.total_spent,
            'active': self.active,
            'points_history': self.points_history,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @staticmethod
    def from_dict(data: dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        return Customer(**data)

    def validate(self):
        if not self.name:
            raise ValueError("Name is required")
        if not self.phone:
            raise ValueError("Phone number is required")
        if self.membership_level not in ['regular', 'silver', 'gold', 'platinum']:
            raise ValueError("Invalid membership level")
        if self.points < 0:
            raise ValueError("Points cannot be negative")
        if self.total_spent < 0:
            raise ValueError("Total spent cannot be negative")

    def add_points(self, points: int, reason: str = None):
        self.points += points
        self.points_history.append({
            'points': points,
            'reason': reason,
            'date': datetime.utcnow()
        })

    def update_membership(self):
        if self.total_spent >= 10000000:
            self.membership_level = 'platinum'
        elif self.total_spent >= 5000000:
            self.membership_level = 'gold'
        elif self.total_spent >= 1000000:
            self.membership_level = 'silver'
