import jwt
from datetime import datetime, timedelta
from typing import Dict

def generate_token(user: Dict, secret_key: str, expiry_hours: int = 24) -> str:
    payload = {
        'user_id': str(user['_id']),
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(hours=expiry_hours)
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')

def verify_token(token: str, secret_key: str) -> Dict:
    return jwt.decode(token, secret_key, algorithms=['HS256'])
