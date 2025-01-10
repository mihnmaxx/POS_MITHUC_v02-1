from app.models.product import Product
from app.utils.pagination_utils import paginate_results
from datetime import datetime
from bson import ObjectId

class ProductService:
    def __init__(self, db):
        self.db = db
        self.db.products.create_index([('name', 'text'), ('barcode', 1)], unique=True)

    def get_products(self, filters, page=1, limit=20):
        query = {}
        if filters.get('category'):
            query['category_id'] = ObjectId(filters['category'])
        if filters.get('search'):
            query['$or'] = [
                {'name': {'$regex': filters['search'], '$options': 'i'}},
                {'description': {'$regex': filters['search'], '$options': 'i'}}
            ]

        products = list(self.db.products.find(query)
                    .skip((page-1)*limit)
                    .limit(limit))
        
        total = self.db.products.count_documents(query)
        
        # Format response
        product_list = []
        for product in products:
            product['_id'] = str(product['_id'])
            if product.get('category_id'):
                product['category_id'] = str(product['category_id'])
            if product.get('created_at'):
                product['created_at'] = product['created_at'].isoformat()
            if product.get('updated_at'):
                product['updated_at'] = product['updated_at'].isoformat()
            product_list.append(product)
        
        return {
            'products': product_list,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        }

    def get_product(self, product_id):
        try:
            product = self.db.products.find_one({'_id': ObjectId(product_id)})
            if not product:
                return None
                
            # Format response data
            formatted_product = {
                '_id': str(product['_id']),
                'name': product['name'],
                'barcode': product.get('barcode'),
                'description': product.get('description'),
                'category_id': str(product['category_id']) if product.get('category_id') else None,
                'price': product.get('price', 0),
                'cost_price': product.get('cost_price', 0),
                'unit': product.get('unit'),
                'image_url': product.get('image_url'),
                'stock_quantity': product.get('stock_quantity', 0),
                'min_stock_level': product.get('min_stock_level', 0),
                'max_stock_level': product.get('max_stock_level', 0),
                'is_active': product.get('is_active', True),
                'created_at': product['created_at'].isoformat() if product.get('created_at') else None,
                'updated_at': product['updated_at'].isoformat() if product.get('updated_at') else None
            }
            
            return formatted_product
            
        except Exception as e:
            print(f"Error getting product: {str(e)}")
            return None

    def get_product_by_barcode(self, barcode):
        try:
            # Tìm sản phẩm theo barcode
            product = self.db.products.find_one({'barcode': barcode})
            
            if not product:
                return None
                
            # Format response data
            formatted_product = {
                '_id': str(product['_id']),
                'name': product['name'],
                'barcode': product['barcode'],
                'description': product.get('description'),
                'category_id': str(product['category_id']) if product.get('category_id') else None,
                'price': product.get('price', 0),
                'cost_price': product.get('cost_price', 0),
                'unit': product.get('unit'),
                'image_url': product.get('image_url'),
                'stock_quantity': product.get('stock_quantity', 0),
                'min_stock_level': product.get('min_stock_level', 0),
                'max_stock_level': product.get('max_stock_level', 0),
                'is_active': product.get('is_active', True),
                'created_at': product['created_at'].isoformat() if product.get('created_at') else None,
                'updated_at': product['updated_at'].isoformat() if product.get('updated_at') else None
            }
            
            return formatted_product
            
        except Exception as e:
            print(f"Error getting product by barcode: {str(e)}")
            return None

    def create_product(self, data):
        current_time = datetime.utcnow()
        # Validate required fields
        if not data.get('name'):
            return None

        # Thêm validation cho barcode    
        if not data.get('barcode'):
            raise ValueError("Barcode không được để trống")

        # Kiểm tra barcode nếu có
        if data.get('barcode'):
            existing = self.db.products.find_one({'barcode': data['barcode']})
            if existing:
                return None
                
        # Kiểm tra category_id hợp lệ nếu có
        category_id = None
        if data.get('category_id') and data['category_id']:
            try:
                category_id = ObjectId(data['category_id'])
                category = self.db.categories.find_one({'_id': category_id})
                if not category:
                    return None
            except:
                return None

        product = {
            '_id': ObjectId(),
            'name': data['name'],
            'barcode': data.get('barcode'),
            'description': data.get('description'),
            'category_id': ObjectId(data['category_id']) if data.get('category_id') else None,
            'price': float(data.get('price', 0)),
            'cost_price': float(data.get('cost_price', 0)),
            'unit': data.get('unit'),
            'image_url': data.get('image_url'),
            'stock_quantity': int(data.get('stock_quantity', 0)),
            'min_stock_level': int(data.get('min_stock_level', 0)),
            'max_stock_level': int(data.get('max_stock_level', 0)),
            'is_active': data.get('is_active', True),
            'created_at': current_time,
            'updated_at': current_time
        }

        # Thêm sản phẩm vào database
        self.db.products.insert_one(product)

        # Trả về sản phẩm đã tạo
        product['_id'] = str(product['_id'])
        if product.get('category_id'):
            product['category_id'] = str(product['category_id'])
        product['created_at'] = current_time.isoformat()
        product['updated_at'] = current_time.isoformat()
        
        return product

    def update_product(self, product_id, data):
        try:

            # Thêm validation cho barcode    
            if not data.get('barcode'):
                raise ValueError("Barcode không được để trống")

            # Kiểm tra sản phẩm tồn tại
            product = self.db.products.find_one({'_id': ObjectId(product_id)})
            if not product:
                return None

            # Chuẩn bị dữ liệu cập nhật
            current_time = datetime.utcnow()
            updates = {
                'name': data.get('name', product['name']),
                'barcode': data.get('barcode', product.get('barcode')),
                'description': data.get('description', product.get('description')),
                'category_id': ObjectId(data['category_id']) if data.get('category_id') else product.get('category_id'),
                'price': float(data.get('price', product.get('price', 0))),
                'cost_price': float(data.get('cost_price', product.get('cost_price', 0))),
                'unit': data.get('unit', product.get('unit')),
                'image_url': data.get('image_url', product.get('image_url')),
                'stock_quantity': int(data.get('stock_quantity', product.get('stock_quantity', 0))),
                'min_stock_level': int(data.get('min_stock_level', product.get('min_stock_level', 0))),
                'max_stock_level': int(data.get('max_stock_level', product.get('max_stock_level', 0))),
                'is_active': data.get('is_active', product.get('is_active', True)),
                'updated_at': current_time
            }

            # Thực hiện cập nhật
            self.db.products.update_one(
                {'_id': ObjectId(product_id)},
                {'$set': updates}
            )

            # Format response
            updates['_id'] = str(product_id)
            if updates.get('category_id'):
                updates['category_id'] = str(updates['category_id'])
            updates['updated_at'] = current_time.isoformat()

            return updates

        except Exception as e:
            print(f"Error updating product: {str(e)}")
            return None

    def delete_product(self, product_id):
        try:
            # Kiểm tra sản phẩm tồn tại
            product = self.db.products.find_one({'_id': ObjectId(product_id)})
            if not product:
                return None
                
            # Thực hiện xóa sản phẩm
            result = self.db.products.delete_one({'_id': ObjectId(product_id)})
            
            if result.deleted_count:
                return {
                    'product_id': str(product_id),
                    'product_name': product['name'],
                    'message': 'Product deleted successfully'
                }
                
            return None
            
        except Exception as e:
            print(f"Error deleting product: {str(e)}")
            return None

    def batch_update(self, data):
        results = {
            'success': [],
            'failed': [],
            'total_processed': 0,
            'total_success': 0,
            'total_failed': 0
        }
        
        for item in data.get('products', []):
            try:
                product_id = ObjectId(item.get('product_id'))
                product = self.db.products.find_one({'_id': product_id})
                
                if not product:
                    results['failed'].append({
                        'product_id': str(product_id),
                        'reason': 'Product not found',
                        'data': item
                    })
                    results['total_failed'] += 1
                    continue

                updates = {}
                if 'quantity' in item:
                    updates['stock_quantity'] = int(item['quantity'])
                if 'price' in item:
                    updates['price'] = float(item['price'])
                if 'cost_price' in item:
                    updates['cost_price'] = float(item['cost_price'])
                if 'is_active' in item:
                    updates['is_active'] = bool(item['is_active'])
                
                updates['updated_at'] = datetime.utcnow()

                self.db.products.update_one(
                    {'_id': product_id},
                    {'$set': updates}
                )
                
                results['success'].append({
                    'product_id': str(product_id),
                    'product_name': product['name'],
                    'updates': {k: v for k, v in updates.items() if k != 'updated_at'},
                    'timestamp': updates['updated_at'].isoformat()
                })
                results['total_success'] += 1

            except Exception as e:
                results['failed'].append({
                    'product_id': item.get('product_id'),
                    'reason': str(e),
                    'data': item
                })
                results['total_failed'] += 1

        results['total_processed'] = len(data.get('products', []))
        return results
