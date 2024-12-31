from datetime import datetime

def generate_order_number():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f'ORD{timestamp}'
