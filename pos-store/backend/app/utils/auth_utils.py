from functools import wraps
from flask import request, current_app
import jwt
from bson import ObjectId
import logging
from app import mongo

logger = logging.getLogger(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        logger.debug(f"Using SECRET_KEY: {current_app.config['JWT_SECRET_KEY'][:5]}...")
        auth_header = request.headers.get('Authorization')
        token = auth_header.replace('Bearer ', '')
        
        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            logger.debug(f"Token decoded successfully: {data}")
            return f(*args, **kwargs)
        except jwt.InvalidSignatureError:
            logger.error("Token signature verification failed")
            return {'message': 'Invalid token signature'}, 401

    return decorated
