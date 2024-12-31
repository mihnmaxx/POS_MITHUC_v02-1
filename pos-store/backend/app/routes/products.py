from flask import request
from flask_restx import Resource, Namespace, fields
from app import mongo
from app.services.product_service import ProductService

products_ns = Namespace('products', description='Product operations')
product_service = ProductService(mongo.db)

# Product model parameters
product_model = products_ns.model('Product', {
    'name': fields.String(required=True, description='Product name'),
    'barcode': fields.String(description='Product barcode'),
    'description': fields.String(description='Product description'),
    'category_id': fields.String(description='Category ID'),
    'price': fields.Float(description='Selling price'),
    'cost_price': fields.Float(description='Cost price'),
    'unit': fields.String(description='Product unit'),
    'image_url': fields.String(description='Product image URL'),
    'stock_quantity': fields.Integer(description='Current stock quantity'),
    'min_stock_level': fields.Integer(description='Minimum stock level'),
    'max_stock_level': fields.Integer(description='Maximum stock level'),
    'is_active': fields.Boolean(description='Product status')
})
# Batch update model
batch_product_model = products_ns.model('BatchProduct', {
    'product_id': fields.String(required=True, description='Product ID'),
    'quantity': fields.Integer(description='Quantity to update'),
    'price': fields.Float(description='New price'),
    'cost_price': fields.Float(description='New cost price'),
    'is_active': fields.Boolean(description='Product status')
})

batch_update_model = products_ns.model('BatchUpdate', {
    'products': fields.List(fields.Nested(batch_product_model), required=True, description='List of products to update')
})

@products_ns.route('/')
class ProductList(Resource):
    @products_ns.doc('list_products')
    @products_ns.param('category', 'Filter by category ID')
    @products_ns.param('search', 'Search term in name or description')
    @products_ns.param('page', 'Page number', type=int, default=1)
    @products_ns.param('limit', 'Items per page', type=int, default=20)
    def get(self):
        filters = {
            'category': request.args.get('category'),
            'search': request.args.get('search')
        }
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        result = product_service.get_products(filters, page, limit)
        return result

    @products_ns.doc('create_product')
    @products_ns.expect(product_model)
    def post(self):
        data = request.get_json()
        product = product_service.create_product(data)
        if product:
            return product, 201
        products_ns.abort(400, "Invalid product data or duplicate barcode")

@products_ns.route('/<id>')
@products_ns.param('id', 'Product ID')
class Product(Resource):
    @products_ns.doc('get_product')
    def get(self, id):
        product = product_service.get_product(id)
        if product:
            return product
        products_ns.abort(404, "Product not found")

    @products_ns.doc('update_product')
    @products_ns.expect(product_model)
    def put(self, id):
        data = request.get_json()
        product = product_service.update_product(id, data)
        if product:
            return product
        products_ns.abort(404, "Product not found")

    @products_ns.doc('delete_product')
    def delete(self, id):
        result = product_service.delete_product(id)
        if result:
            return {'message': 'Product deleted successfully'}, 200
        products_ns.abort(404, "Product not found or cannot be deleted")

@products_ns.route('/barcode/<barcode>')
@products_ns.param('barcode', 'Product barcode')
class ProductBarcode(Resource):
    @products_ns.doc('get_product_by_barcode')
    def get(self, barcode):
        product = product_service.get_product_by_barcode(barcode)
        if product:
            return product
        products_ns.abort(404, "Product not found")

@products_ns.route('/batch')
class ProductBatch(Resource):
    @products_ns.doc('batch_update_products')
    @products_ns.expect(batch_product_model)
    def post(self):
        """
        Batch update products
        - Update quantity
        - Update prices
        - Update status
        """
        data = request.get_json()
        result = product_service.batch_update(data)
        return result
