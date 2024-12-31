from app.models.auth import User
from app.utils.jwt_utils import generate_token, verify_token
from app.utils.password_utils import hash_password, verify_password
from flask import current_app
from datetime import datetime
import secrets

class AuthService:
    def __init__(self, db, mail_service):
        self.db = db
        self.mail_service = mail_service

    def login(self, email, password):
        user = self.db.users.find_one({'email': email})
        if user and verify_password(password, user['password']):
            # Lấy JWT secret key từ config
            jwt_secret = current_app.config['JWT_SECRET_KEY']
            token = generate_token(user, jwt_secret)
            user['last_login'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            self.db.users.update_one({'_id': user['_id']}, {'$set': {'last_login': user['last_login']}})
            return {'token': token, 'user': User.clean_user_data(user)}
        return None
    
    def is_token_revoked(self, token):
        revoked_token = self.db.revoked_tokens.find_one({'token': token})
        return revoked_token is not None

    def logout(self, token):
        self.db.revoked_tokens.insert_one({
            'token': token,
            'revoked_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        })

    def register(self, user_data):
        # Kiểm tra email đã tồn tại
        if self.db.users.find_one({'email': user_data['email']}):
            return {'status': 400, 'message': 'Email already exists'}
            
        # Validate required fields
        if not user_data.get('email') or not user_data.get('password'):
            return {'status': 400, 'message': 'Email and password are required'}
            
        # Validate email format
        if '@' not in user_data['email']:
            return {'status': 400, 'message': 'Invalid email format'}
            
        # Validate password length
        if len(user_data['password']) < 6:
            return {'status': 400, 'message': 'Password must be at least 6 characters'}
            
        # Tạo user mới
        user = {
            'email': user_data['email'],
            'password': hash_password(user_data['password']),
            'name': user_data.get('name', ''),
            'role': user_data.get('role', 'user'),
            'active': False,
            'created_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Tạo verification token đơn giản
        verification_token = secrets.token_urlsafe(32)
        
        user['verification_token'] = verification_token
        
        try:
            result = self.db.users.insert_one(user)
            user['_id'] = str(result.inserted_id)
        except Exception as e:
            current_app.logger.error(f"Error creating user: {str(e)}")
            return {'status': 400, 'message': 'Error creating user'}

        # Gửi email xác thực
        try:
            current_app.logger.info(f"Attempting to send verification email to: {user['email']}")
            self.mail_service.send_verification_email(user['email'], verification_token)
            current_app.logger.info(f"Successfully sent verification email to: {user['email']}")
        except Exception as e:
            current_app.logger.error(f"Error sending verification email: {str(e)}")
            current_app.logger.error(f"Error details: {e.__class__.__name__}")
            # Xoá user nếu gửi email thất bại
            self.db.users.delete_one({'_id': result.inserted_id})
            return {'status': 400, 'message': 'Error sending verification email'}
            
        return {'message': 'Please check your email to verify account'}
    
    def verify_email(self, token):
        try:
            payload = verify_token(token, token_type='verification')
            email = payload['email']
            
            self.db.users.update_one(
                {'email': email},
                {
                    '$set': {'active': True},
                    '$unset': {'verification_token': 1}
                }
            )
            return True
        except:
            return False     
  
    def get_user(self, user_id: str):
        user = self.db.users.find_one('users', {'_id': user_id})
        return User.clean_user_data(user) if user else None

    def change_password(self, user_id: str, old_password: str, new_password: str):
        user = self.db.find_one('users', {'_id': user_id})
        if user and verify_password(old_password, user['password']):
            self.db.update_one(
                'users',
                {'_id': user_id},
                {'$set': {'password': hash_password(new_password)}}
            )
            return True
        return False

    def reset_password_request(self, email: str):
        user = self.db.find_one('users', {'email': email})
        if user:
            reset_token = generate_token(
                user, 
                expiry_hours=1, 
                token_type='reset'
            )
            # Gửi email reset password
            self.send_reset_email(email, reset_token)
            return True
        return False

    def reset_password(self, token: str, new_password: str):
        try:
            payload = verify_token(token, token_type='reset')
            user_id = payload['user_id']
            
            self.db.update_one(
                'users',
                {'_id': user_id},
                {'$set': {'password': hash_password(new_password)}}
            )
            return True
        except:
            return False
