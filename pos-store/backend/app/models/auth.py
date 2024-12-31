from datetime import datetime
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    def __init__(self,
                 name: str,
                 email: str,
                 password: str,
                 role: str = 'user',
                 active: bool = True,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.name = name
        self.email = email
        self.password = generate_password_hash(password)
        self.role = role
        self.active = active
        self.created_at = datetime.utcnow()
        self.last_login = None

    def to_dict(self):
        return {
            '_id': str(self._id),
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'active': self.active,
            'created_at': self.created_at,
            'last_login': self.last_login
        }

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password, password)

    def update_password(self, new_password: str):
        self.password = generate_password_hash(new_password)

    def update_last_login(self):
        self.last_login = datetime.utcnow()

    @staticmethod
    def from_dict(data: dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        return User(**data)

    def validate(self):
        if not self.name:
            raise ValueError("Name is required")
        if not self.email:
            raise ValueError("Email is required")
        if not self.password:
            raise ValueError("Password is required")
        if self.role not in ['admin', 'user', 'staff']:
            raise ValueError("Invalid role")

    @staticmethod
    def clean_user_data(user_data):
        return {
            'id': str(user_data['_id']),
            'name': user_data['name'],
            'email': user_data['email'],
            'role': user_data['role'],
            'active': user_data['active'],
            'created_at': user_data['created_at'],
            'last_login': user_data['last_login']
        }
