from gridfs import GridFS
from bson import ObjectId

class UploadService:
    def __init__(self, db):
        self.fs = GridFS(db)

    def save_product_image(self, file):
        # Lưu file vào GridFS
        file_id = self.fs.put(
            file,
            filename=file.filename,
            content_type=file.content_type
        )
        return str(file_id)

    def get_file(self, file_id):
        return self.fs.get(ObjectId(file_id))
