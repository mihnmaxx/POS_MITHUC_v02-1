from flask.json.provider import JSONProvider
import json
from datetime import datetime
from bson import ObjectId

class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        def default(o):
            if isinstance(o, datetime):
                return o.strftime('%Y-%m-%d %H:%M:%S')
            if isinstance(o, ObjectId):
                return str(o)
            return str(o)
            
        return json.dumps(obj, default=default, **kwargs)

    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)