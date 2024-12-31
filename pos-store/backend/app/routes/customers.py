from flask_restx import Namespace, Resource
from flask import request, abort
from app import mongo
from app.services import CustomerService

customers_ns = Namespace('customers', description='Customer operations')
customer_service = CustomerService(mongo.db)

@customers_ns.route('/')
class CustomerList(Resource):
    def get(self):
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        result = customer_service.get_customers(search, page, limit)
        return result

    def post(self):
        data = request.get_json()
        customer = customer_service.create_customer(data)
        if not customer:
            abort(400, 'Phone number already exists')
        return customer, 201

@customers_ns.route('/<id>')
class Customer(Resource):
    def get(self, id):
        customer = customer_service.get_customer(id)
        if not customer:
            abort(404)
        return customer

    def put(self, id):
        data = request.get_json()
        customer = customer_service.update_customer(id, data)
        if not customer:
            abort(400, 'Phone number already exists')
        return customer

@customers_ns.route('/<id>/points')
class CustomerPoints(Resource):
    def post(self, id):
        data = request.get_json()
        points = data.get('points', 0)
        new_points = customer_service.adjust_points(id, points, data.get('reason'))
        if new_points is None:
            abort(404)
        return {'points': new_points}

@customers_ns.route('/search')
class CustomerSearch(Resource):
    def get(self):
        term = request.args.get('q', '')
        customers = customer_service.search_customers(term)
        return customers