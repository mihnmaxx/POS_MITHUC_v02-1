from app.models.category import Category
from datetime import datetime
from bson import ObjectId, errors
import logging

# Initialize logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class CategoryService:
    def __init__(self, db):
        self.db = db

    def get_categories(self, search=None, page=1, limit=20):
        logger.debug(f"Getting categories with search={search}, page={page}, limit={limit}")
        query = {}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        
        logger.debug(f"Query filter: {query}")
        categories = list(self.db.categories.find(query)
                        .skip((page-1)*limit)
                        .limit(limit))
        
        total = self.db.categories.count_documents(query)
        logger.debug(f"Total documents found: {total}")
        
        category_list = []
        for cat in categories:
            cat_dict = {
                '_id': str(cat['_id']),
                'name': cat['name'],
                'description': cat.get('description'),
                'icon': cat.get('icon'),
                'color': cat.get('color'),
                'parent_id': str(cat['parent_id']) if cat.get('parent_id') else None,
                'created_at': cat['created_at'].isoformat() if cat.get('created_at') else None,
                'updated_at': cat['updated_at'].isoformat() if cat.get('updated_at') else None
            }
            category_list.append(cat_dict)
        
        logger.debug(f"Processed {len(category_list)} categories")
        
        result = {
            'categories': category_list,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        }
        logger.debug(f"Returning result with {len(category_list)} categories, page {page} of {(total + limit - 1) // limit}")
        return result
    
    def get_category(self, category_id):
        try:
            # Kiểm tra collection và document trực tiếp
            logger.debug(f"Collections hiện có: {self.db.list_collection_names()}")
            
            # Đếm số lượng documents trong collection categories
            count = self.db.categories.count_documents({})
            logger.debug(f"Tổng số categories: {count}")
            
            # Lấy một vài document mẫu
            sample = list(self.db.categories.find().limit(2))
            logger.debug(f"Mẫu documents: {sample}")
            
            # Thực hiện truy vấn chính
            category = self.db.categories.find_one({'_id': ObjectId(category_id)})
            
            if category:
                category['_id'] = str(category['_id'])
                if category.get('parent_id'):
                    category['parent_id'] = str(category['parent_id'])
                # Chuyển đổi datetime sang string
                if category.get('created_at'):
                    category['created_at'] = category['created_at'].isoformat()
                if category.get('updated_at'):
                    category['updated_at'] = category['updated_at'].isoformat()
                return category
            return None
            
        except Exception as e:
            logger.error(f"Lỗi truy vấn: {str(e)}")
            return None
        
    def create_category(self, data):
        # Kiểm tra xem category name đã tồn tại chưa
        existing_category = self.db.categories.find_one({'name': data['name']})
        if existing_category:
            return None
            
        category = Category(
            name=data['name'],
            description=data.get('description'),
            icon=data.get('icon'),
            color=data.get('color'),
            parent_id=ObjectId(data['parent_id']) if data.get('parent_id') else None
        )
        
        # Đảm bảo _id luôn là ObjectId
        category._id = ObjectId()
        self.db.categories.insert_one(category.to_dict(for_api=False))
        
        return category

    def update_category(self, category_id: str, data: dict):
        category = self.db.categories.find_one({'_id': ObjectId(category_id)})
        if not category:
            return None

        if data.get('name'):
            existing = self.db.categories.find_one({
                'name': data['name'],
                '_id': {'$ne': ObjectId(category_id)}
            })
            if existing:
                return None

        current_time = datetime.utcnow()
        updates = {
            'name': data.get('name', category['name']),
            'description': data.get('description', category.get('description')),
            'icon': data.get('icon', category.get('icon')),
            'color': data.get('color', category.get('color')),
            'parent_id': ObjectId(data['parent_id']) if data.get('parent_id') else category.get('parent_id'),
            'updated_at': current_time
        }

        self.db.categories.update_one(
            {'_id': ObjectId(category_id)},
            {'$set': updates}
        )

        # Chuyển đổi dữ liệu trước khi trả về
        response_data = updates.copy()
        response_data['updated_at'] = current_time.isoformat()
        if response_data.get('parent_id'):
            response_data['parent_id'] = str(response_data['parent_id'])
        
        return response_data

    def delete_category(self, category_id: str):
        # Kiểm tra xem category có đang được sử dụng trong products không
        if self.db.products.find_one({'category_id': ObjectId(category_id)}):
            return False
            
        # Thực hiện xóa category
        result = self.db.categories.delete_one({'_id': ObjectId(category_id)})
        return bool(result.deleted_count)

    def get_category_tree(self):
        categories = self.db.find_many('categories', {'parent_id': None})
        
        def get_children(parent_id):
            children = self.db.find_many('categories', {'parent_id': parent_id})
            for child in children:
                child['children'] = get_children(child['_id'])
            return children
        
        for category in categories:
            category['children'] = get_children(category['_id'])
        
        return categories
    
    def get_all_category_ids(self):
        categories = self.db.categories.find({}, {'_id': 1})
        return [str(category['_id']) for category in categories]
