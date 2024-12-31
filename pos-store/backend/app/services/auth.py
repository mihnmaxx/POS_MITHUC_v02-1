import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional
from werkzeug.security import generate_password_hash, check_password_hash
import logging

class AuthService:
    def __init__(self, config, db_service):
        self.config = config
        self.db = db_service
        self.secret_key = config['SECRET_KEY']
        self.token_expiry = config.get('TOKEN_EXPIRY', 24) # hours

    def authenticate(self, email: str, password: str) -> Optional[Dict]:
        try:
            user = self.db.find_one('users', {'email': email})
            if user and check_password_hash(user['password'], password):
                token = self.generate_token(user)
                return {
                    'token': token,
                    'user': self.clean_user_data(user)
                }
            return None
        except Exception as e:
            logging.error(f"Authentication failed: {str(e)}")
            raise

    def generate_token(self, user: Dict) -> str:
        try:
            payload = {
                'user_id': str(user['_id']),
                'email': user['email'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=self.token_expiry)
            }
            return jwt.encode(payload, self.secret_key, algorithm='HS256')
        except Exception as e:
            logging.error(f"Token generation failed: {str(e)}")
            raise

    def verify_token(self, token: str) -> Optional[Dict]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            user = self.db.find_one('users', {'_id': payload['user_id']})
            return user if user else None
        except jwt.ExpiredSignatureError:
            logging.warning("Token has expired")
            return None
        except jwt.InvalidTokenError:
            logging.warning("Invalid token")
            return None

    def create_user(self, user_data: Dict) -> Dict:
        try:
            # Validate user data
            if not user_data.get('email') or not user_data.get('password'):
                raise ValueError("Email and password are required")

            # Check if user exists
            if self.db.find_one('users', {'email': user_data['email']}):
                raise ValueError("Email already exists")

            # Hash password
            user = {
                'email': user_data['email'],
                'password': generate_password_hash(user_data['password']),
                'name': user_data.get('name'),
                'role': user_data.get('role', 'user'),
                'active': True,
                'created_at': datetime.utcnow()
            }

            user_id = self.db.insert_one('users', user)
            user['_id'] = user_id
            return self.clean_user_data(user)
        except Exception as e:
            logging.error(f"User creation failed: {str(e)}")
            raise

    def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        try:
            user = self.db.find_one('users', {'_id': user_id})
            if user and check_password_hash(user['password'], old_password):
                self.db.update_one(
                    'users',
                    {'_id': user_id},
                    {'$set': {'password': generate_password_hash(new_password)}}
                )
                return True
            return False
        except Exception as e:
            logging.error(f"Password change failed: {str(e)}")
            raise

    def check_permission(self, user: Dict, required_role: str) -> bool:
        roles_hierarchy = {
            'admin': 3,
            'manager': 2,
            'staff': 1,
            'user': 0
        }
        user_role_level = roles_hierarchy.get(user['role'], 0)
        required_role_level = roles_hierarchy.get(required_role, 0)
        return user_role_level >= required_role_level

    @staticmethod
    def clean_user_data(user: Dict) -> Dict:
        return {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name'),
            'role': user.get('role'),
            'active': user.get('active')
        }

    def reset_password(self, email: str) -> bool:
        try:
            user = self.db.find_one('users', {'email': email})
            if user:
                # Generate reset token
                reset_token = self.generate_reset_token(user)
                # Send reset email
                self.send_reset_email(email, reset_token)
                return True
            return False
        except Exception as e:
            logging.error(f"Password reset failed: {str(e)}")
            raise

    def generate_reset_token(self, user: Dict) -> str:
        payload = {
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        return jwt.encode(payload, self.secret_key + '_reset', algorithm='HS256')
