# POS Store Backend

Backend API cho hệ thống quản lý bán hàng POS Store sử dụng Flask và MongoDB.

## Yêu cầu hệ thống

- Python 3.8+
- MongoDB
- Redis (cho caching)

## Cài đặt

1. Tạo môi trường ảo:


python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows


2. Cài đặt các thư viện phụ thuộc:


pip install -r requirements.txt


3. Cấu hình môi trường:

- Tạo file `.env` từ file mẫu `.env.example`
- Cập nhật các biến môi trường phù hợp

## Khởi chạy

1. Khởi động MongoDB và Redis

2. Chạy server development:


flask run


Server sẽ chạy tại http://localhost:5000

## API Endpoints

### Authentication

- POST /api/auth/register - Đăng ký tài khoản mới
- POST /api/auth/login - Đăng nhập
- POST /api/auth/logout - Đăng xuất

### Users

- GET /api/users - Lấy danh sách users
- GET /api/users/<id> - Lấy thông tin user
- PUT /api/users/<id> - Cập nhật thông tin user
- DELETE /api/users/<id> - Xóa user

### Products

- GET /api/products - Lấy danh sách sản phẩm
- POST /api/products - Tạo sản phẩm mới
- GET /api/products/<id> - Lấy thông tin sản phẩm
- PUT /api/products/<id> - Cập nhật sản phẩm
- DELETE /api/products/<id> - Xóa sản phẩm

### Orders

- GET /api/orders - Lấy danh sách đơn hàng
- POST /api/orders - Tạo đơn hàng mới
- GET /api/orders/<id> - Lấy thông tin đơn hàng
- PUT /api/orders/<id> - Cập nhật đơn hàng
- DELETE /api/orders/<id> - Xóa đơn hàng

## Cấu trúc thư mục


backend/
├── app/
│   ├── __init__.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── .env
├── .env.example
├── requirements.txt
└── README.md


## Testing

Chạy unit test:


pytest


## Deployment

1. Development:


flask run


2. Production với Gunicorn:


gunicorn --workers=4 --bind 0.0.0.0:5000 wsgi:app --timeout 120


## Contributing

1. Fork repository
2. Tạo branch mới
3. Commit changes
4. Tạo pull request

## License

MIT License
