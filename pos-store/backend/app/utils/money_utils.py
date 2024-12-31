from decimal import Decimal, ROUND_HALF_UP

def format_currency(amount: float, currency: str = 'VND') -> str:
    """Format số tiền theo định dạng tiền tệ"""
    if currency == 'VND':
        return f"{int(amount):,}đ"
    return f"{amount:,.2f} {currency}"

def calculate_total(items: list, tax_rate: float = 0.1) -> dict:
    """Tính tổng tiền và thuế"""
    subtotal = sum(item['price'] * item['quantity'] for item in items)
    tax = Decimal(str(subtotal * tax_rate)).quantize(Decimal('0.01'), ROUND_HALF_UP)
    total = subtotal + float(tax)
    
    return {
        'subtotal': subtotal,
        'tax': float(tax),
        'total': total
    }
