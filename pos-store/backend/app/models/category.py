from datetime import datetime, timezone
from bson import ObjectId

class Category:
    def __init__(self,
                 name: str,
                 description: str = None,
                 icon: str = None,
                 color: str = None,
                 parent_id: ObjectId = None,
                 _id: ObjectId = None):
        self._id = _id or ObjectId()
        self.name = name
        self.description = description
        self.icon = icon
        self.color = color
        self.parent_id = parent_id
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self, for_api=True):
        data = {
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if for_api:
            # Chuyển đổi sang string khi trả về API
            data['_id'] = str(self._id)
            data['parent_id'] = str(self.parent_id) if self.parent_id else None
        else:
            # Giữ nguyên ObjectId và datetime khi lưu DB
            data['_id'] = self._id
            data['parent_id'] = self.parent_id
            data['created_at'] = self.created_at
            data['updated_at'] = self.updated_at
            
        return data

    @staticmethod
    def from_dict(data: dict):
        if '_id' in data:
            data['_id'] = ObjectId(data['_id'])
        if 'parent_id' in data and data['parent_id']:
            data['parent_id'] = ObjectId(data['parent_id'])
        return Category(**data)

    def validate(self):
        if not self.name:
            raise ValueError("Name is required")
