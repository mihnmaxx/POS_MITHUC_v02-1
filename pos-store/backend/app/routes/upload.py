from flask import request, send_file
from flask_restx import Namespace, Resource
from app.services.upload_service import UploadService
from app import mongo

upload_ns = Namespace('upload', description='File upload operations')
upload_service = UploadService(mongo.db)

# Define upload parameters
upload_parser = upload_ns.parser()
upload_parser.add_argument('file', 
    type='FileStorage', 
    location='files', 
    required=True, 
    help='Image file'
)


@upload_ns.route('/product-image')
@upload_ns.expect(upload_parser)
class UploadProductImage(Resource):
    def post(self):
        """Upload product image
        Returns:
            file_id: ID of uploaded file in GridFS
        """
        if 'file' not in request.files:
            return {'error': 'No file provided'}, 400
            
        file = request.files['file']
        if file.filename == '':
            return {'error': 'No file selected'}, 400
            
        # Validate file type
        if not file.content_type.startswith('image/'):
            return {'error': 'File must be an image'}, 400
            
        try:
            file_id = upload_service.save_product_image(file)
            return {'file_id': file_id}, 201
        except Exception as e:
            return {'error': str(e)}, 500

@upload_ns.route('/files/<file_id>')
class GetFile(Resource):
    def get(self, file_id):
        """Get file from GridFS by file_id
        Args:
            file_id: ID of file in GridFS
        Returns:
            File content with correct mimetype
        """
        file = upload_service.get_file(file_id)
        return send_file(
            file,
            mimetype=file.content_type
        )
