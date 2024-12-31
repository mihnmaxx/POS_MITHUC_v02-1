from datetime import datetime
import pytz

def format_date(date: datetime, format: str = '%d/%m/%Y %H:%M') -> str:
    """Format datetime theo định dạng cụ thể"""
    if not date:
        return ''
    return date.strftime(format)

def parse_date(date_string: str, format: str = '%d/%m/%Y %H:%M') -> datetime:
    """Parse chuỗi ngày tháng thành datetime"""
    return datetime.strptime(date_string, format)

def to_local_time(utc_dt: datetime, timezone: str = 'Asia/Ho_Chi_Minh') -> datetime:
    """Chuyển đổi UTC datetime sang múi giờ địa phương"""
    local_tz = pytz.timezone(timezone)
    return utc_dt.replace(tzinfo=pytz.UTC).astimezone(local_tz)
