import re

def validate_email(email: str) -> bool:
    """Kiểm tra email hợp lệ"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Kiểm tra số điện thoại hợp lệ"""
    pattern = r'^(0|\+84)\d{9,10}$'
    return bool(re.match(pattern, phone))

def validate_required_fields(data: dict, required_fields: list) -> tuple:
    """Kiểm tra các trường bắt buộc"""
    missing = [field for field in required_fields if not data.get(field)]
    return len(missing) == 0, missing
