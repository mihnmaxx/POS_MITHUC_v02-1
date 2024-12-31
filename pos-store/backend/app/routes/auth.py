from flask_restx import Namespace, Resource, fields
from flask import request
from app import services, mongo
from app.utils.auth_utils import token_required
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_ns = Namespace('auth', description='Authentication operations')

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(auth_ns.model('Login', {
        'email': fields.String(required=True),
        'password': fields.String(required=True)
    }))
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {'message': 'No input data provided'}, 400
            
            if 'email' not in data:
                return {'message': 'Email is required'}, 400
                
            if 'password' not in data:
                return {'message': 'Password is required'}, 400
                
            result = services.auth_service.login(data['email'], data['password'])
            if result:
                return result
            return {'message': 'Invalid credentials'}, 401
        except Exception as e:
            return {'message': f'Login failed: {str(e)}'}, 500
        
@auth_ns.route('/logout')
class Logout(Resource):
    @auth_ns.doc(
        security='Bearer Auth',
        params={
            'Authorization': {
                'in': 'header',
                'description': 'Access token',
                'required': True,
                'example': 'Bearer your-token-here'
            }
        },
        responses={
            200: 'Logged out successfully',
            401: 'Unauthorized - Invalid or missing token'
        }
    )

    @token_required
    def post(self):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]  # Lấy phần token sau 'Bearer '

            mongo.db.revoked_tokens.insert_one({
                'token': token,
                'revoked_at': datetime.now(timezone.utc)
            })
            return {'message': 'Logged out successfully'}, 200
        else:
            return {'message': 'Unauthorized - Invalid or missing token'}, 401
        
@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(auth_ns.model('Register', {
        'email': fields.String(required=True),
        'password': fields.String(required=True)
    }))
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {'message': 'No input data provided'}, 400
            
            if 'email' not in data:
                return {'message': 'Email is required'}, 400
                
            if 'password' not in data:
                return {'message': 'Password is required'}, 400
                
            if len(data['password']) < 6:
                return {'message': 'Password must be at least 6 characters'}, 400
                
            if not '@' in data['email']:
                return {'message': 'Invalid email format'}, 400
                
            user = services.auth_service.register(data)
            if not user:
                return {'message': 'Email already registered'}, 409
                
            return {'message': 'User registered successfully', 'user': user}, 201
            
        except Exception as e:
            return {'message': f'Registration failed: {str(e)}'}, 500
        
@auth_ns.route('/verify-email/<token>')
class EmailVerification(Resource):
    def get(self, token):
        logger.debug(f"Searching for token in DB: {token}")
        user = mongo.db.users.find_one({'verification_token': token})
        
        if not user:
            logger.warning(f"Token not found: {token}")
            return {'message': 'Invalid verification token'}, 400

        # Update user status
        mongo.db.users.update_one(
            {'_id': user['_id']},
            {
                '$set': {'active': True},
                '$unset': {'verification_token': ''}
            }
        )
        logger.info(f"User {user['email']} verified successfully")
        return {'message': 'Email verified successfully'}, 200
        

@auth_ns.route('/reset-password')
class ResetPasswordRequest(Resource):
    @auth_ns.expect(auth_ns.model('ResetPasswordRequest', {
        'email': fields.String(required=True)
    }))
    def post(self):
        data = request.get_json()
        if services.auth_service.reset_password_request(data['email']):
            return {'message': 'Reset password email sent'}
        return {'message': 'Email not found'}, 404

@auth_ns.route('/reset-password/<string:token>')
class ResetPassword(Resource):
    @auth_ns.expect(auth_ns.model('ResetPassword', {
        'new_password': fields.String(required=True)
    }))
    def post(self, token):
        data = request.get_json()
        if services.auth_service.reset_password(token, data['new_password']):
            return {'message': 'Password reset successfully'}
        return {'message': 'Invalid or expired token'}, 400