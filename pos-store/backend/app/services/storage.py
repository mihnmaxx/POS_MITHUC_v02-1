import os
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO
import logging
from typing import Optional, Tuple, BinaryIO
from datetime import datetime

class StorageService:
    def __init__(self, config):
        self.upload_folder = config['UPLOAD_FOLDER']
        self.allowed_extensions = config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif'})
        self.max_file_size = config.get('MAX_FILE_SIZE', 5 * 1024 * 1024)  # 5MB default
        
        # Create upload directories
        self.create_directories()

    def create_directories(self):
        directories = [
            self.upload_folder,
            os.path.join(self.upload_folder, 'products'),
            os.path.join(self.upload_folder, 'avatars'),
            os.path.join(self.upload_folder, 'receipts'),
            os.path.join(self.upload_folder, 'temp')
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    def save_file(self, file: BinaryIO, folder: str = None) -> Tuple[bool, str]:
        try:
            if not self.allowed_file(file.filename):
                raise ValueError("File type not allowed")

            filename = secure_filename(file.filename)
            ext = os.path.splitext(filename)[1]
            new_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
            
            if folder:
                new_filename = f"{folder}/{new_filename}"

            file_path = os.path.join(self.upload_folder, new_filename)
            file.save(file_path)
            
            return True, f"/uploads/{new_filename}"

        except Exception as e:
            logging.error(f"File upload failed: {str(e)}")
            return False, str(e)

    def save_image(self, image: BinaryIO, folder: str = None, sizes: dict = None) -> Tuple[bool, dict]:
        try:
            img = Image.open(image)
            format = img.format.lower()
            
            filename_base = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            urls = {}
            
            # Save original
            original_path = os.path.join(self.upload_folder, folder, f"{filename_base}.{format}")
            img.save(original_path)
            urls['original'] = f"/uploads/{folder}/{filename_base}.{format}"
            
            # Generate thumbnails
            if sizes:
                for size_name, dimensions in sizes.items():
                    thumb = img.copy()
                    thumb.thumbnail(dimensions)
                    
                    thumb_filename = f"{filename_base}_{size_name}.{format}"
                    thumb_path = os.path.join(self.upload_folder, folder, thumb_filename)
                    thumb.save(thumb_path)
                    
                    urls[size_name] = f"/uploads/{folder}/{thumb_filename}"

            return True, urls

        except Exception as e:
            logging.error(f"Image processing failed: {str(e)}")
            return False, {}

    def delete_file(self, file_path: str) -> bool:
        try:
            full_path = os.path.join(self.upload_folder, file_path.lstrip('/uploads/'))
            if os.path.exists(full_path):
                os.remove(full_path)
            return True
        except Exception as e:
            logging.error(f"File deletion failed: {str(e)}")
            return False

    def get_file_size(self, file_path: str) -> Optional[int]:
        try:
            full_path = os.path.join(self.upload_folder, file_path.lstrip('/uploads/'))
            return os.path.getsize(full_path)
        except Exception as e:
            logging.error(f"Size check failed: {str(e)}")
            return None

    def allowed_file(self, filename: str) -> bool:
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def clear_temp_files(self, max_age: int = 86400) -> int:
        """Clear temporary files older than max_age seconds"""
        temp_dir = os.path.join(self.upload_folder, 'temp')
        count = 0
        now = datetime.now().timestamp()
        
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            if os.path.getctime(file_path) + max_age < now:
                os.remove(file_path)
                count += 1
                
        return count
