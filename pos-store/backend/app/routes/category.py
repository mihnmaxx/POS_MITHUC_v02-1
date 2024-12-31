from flask_restx import Namespace, Resource, fields
from flask import request, abort
from app import mongo
from app.services import CategoryService
import logging

# Initialize logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

category_ns = Namespace('categories', description='Category operations')
category_service = CategoryService(mongo.db)

@category_ns.route('/')
class CategoryList(Resource):
    @category_ns.doc(
        params={
            'search': {'description': 'Search by name', 'in': 'query', 'type': 'string'},
            'page': {'description': 'Page number', 'in': 'query', 'type': 'integer', 'default': 1},
            'limit': {'description': 'Items per page', 'in': 'query', 'type': 'integer', 'default': 20}
        }
    )
    def get(self):
        logger.debug('Getting categories list')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        logger.info(f'Fetching categories with search={search}, page={page}, limit={limit}')
        result = category_service.get_categories(search, page, limit)
        logger.debug('Categories retrieved successfully')
        return result
    
    @category_ns.expect(category_ns.model('Category', {
        'name': fields.String(required=True, description='Category name'),
        'description': fields.String(description='Category description'),
        'icon': fields.String(description='Category icon'),
        'color': fields.String(description='Category color'),
        'parent_id': fields.String(description='Parent category ID')
    }))
    @category_ns.doc(responses={201: 'Category created', 400: 'Bad request'})
    def post(self):
        logger.debug('Creating new category')
        data = request.get_json()
        if not data.get('name'):
            logger.warning('Attempt to create category without name')
            return {'message': 'Name is required'}, 400
        
        logger.info(f'Creating category with data: {data}')
        category = category_service.create_category(data)
        logger.debug('Category created successfully')
        if category:
            return category.to_dict(), 201
        return {'message': 'Category name already exists'}, 400
    
@category_ns.route('/<id>')
@category_ns.param('id', 'ID của danh mục')
class Category(Resource):
    @category_ns.doc(
        description='Lấy thông tin chi tiết của một danh mục',
        responses={
            200: 'Thành công',
            404: 'Không tìm thấy danh mục'
        }
    )
    def get(self, id):
        # Thêm log để hiển thị tất cả category IDs
        all_categories = category_service.get_all_category_ids()
        logger.debug(f"Tất cả category IDs: {all_categories}")
        
        category = category_service.get_category(id)
        if not category:
            abort(404, f"Không tìm thấy danh mục với ID: {id}")
        return category

    @category_ns.doc(
        description='Cập nhật thông tin danh mục',
        responses={
            200: 'Cập nhật thành công',
            404: 'Không tìm thấy danh mục'
        }
    )
    @category_ns.expect(category_ns.model('CategoryUpdate', {
        'name': fields.String(description='Tên danh mục'),
        'description': fields.String(description='Mô tả'),
        'icon': fields.String(description='Icon'),
        'color': fields.String(description='Màu sắc'),
        'parent_id': fields.String(description='ID danh mục cha')
    }))
    def put(self, id):
        data = request.get_json()
        category = category_service.update_category(id, data)
        if not category:
            abort(404, 'Không tìm thấy danh mục')
        return category

    @category_ns.doc(
        description='Xóa danh mục',
        responses={
            204: 'Xóa thành công',
            400: 'Không thể xóa danh mục đang có sản phẩm',
            404: 'Không tìm thấy danh mục'
        }
    )
    def delete(self, id):
        result = category_service.delete_category(id)
        if result:
            return {'message': 'Category deleted successfully'}, 200
        return {'message': 'Cannot delete category. It may be in use or not found'}, 400

@category_ns.route('/tree')
class CategoryTree(Resource):
    @category_ns.doc(params={
        'active': {'description': 'Lọc theo trạng thái (true/false)', 'type': 'boolean'},
        'parent_id': {'description': 'ID danh mục cha (để lấy cây con)', 'type': 'string'},
        'depth': {'description': 'Độ sâu tối đa của cây', 'type': 'integer', 'default': 3}
    })
    def get(self):
        active = request.args.get('active', type=bool)
        parent_id = request.args.get('parent_id')
        depth = request.args.get('depth', default=3, type=int)
        
        tree = category_service.get_category_tree(active, parent_id, depth)
        return tree