from flask import request
from flask_restx import Namespace, Resource
from app import mongo
from app.services import SettingService

setting_ns = Namespace('settings', description='Settings operations')
setting_service = SettingService(mongo.db)

@setting_ns.route('/')
class Settings(Resource):
    def get(self):
        settings = setting_service.get_settings()
        return settings

@setting_ns.route('/receipt')
class ReceiptSettings(Resource):
    def get(self):
        settings = setting_service.get_receipt_settings()
        return settings
    
    def put(self):
        data = request.get_json()
        settings = setting_service.update_receipt_settings(data)
        return settings

@setting_ns.route('/payment')
class PaymentSettings(Resource):
    def get(self):
        settings = setting_service.get_payment_settings()
        return settings
    
    def put(self):
        data = request.get_json()
        settings = setting_service.update_payment_settings(data)
        return settings

@setting_ns.route('/store')
class StoreSettings(Resource):
    def get(self):
        settings = setting_service.get_store_settings()
        return settings
    
    def put(self):
        data = request.get_json()
        settings = setting_service.update_store_settings(data)
        return settings

@setting_ns.route('/printer')
class PrinterSettings(Resource):
    def get(self):
        settings = setting_service.get_printer_settings()
        return settings
    
    def put(self):
        data = request.get_json()
        settings = setting_service.update_printer_settings(data)
        return settings

@setting_ns.route('/config')
class ConfigSettings(Resource):
    def get(self):
        settings = setting_service.get_config_settings()
        return settings
    
    def put(self):
        data = request.get_json()
        settings = setting_service.update_config_settings(data)
        return settings