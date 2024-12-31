import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Basic Config
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    TIMEZONE = os.getenv('TIMEZONE', 'Asia/Ho_Chi_Minh')

    # MongoDB Config
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/pos')
    
    # Upload Config
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'png,jpg,jpeg,gif').split(','))

    # Cache Config  
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', 300))

    # JWT Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret') 
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 24 * 60 * 60))

    # Mail Config
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'your@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'password')

class ConfigManager:
    def __init__(self, db):
        self.db = db
        self.settings_id = 'global'

    def load_config(self):
        """Load config from database"""
        config = self.db.settings.find_one({'_id': self.settings_id})
        if config and 'config' in config:
            return config['config']
        return {}

    def save_config(self, config):
        """Save config to database"""
        self.db.settings.update_one(
            {'_id': self.settings_id},
            {'$set': {'config': config}},
            upsert=True
        )
