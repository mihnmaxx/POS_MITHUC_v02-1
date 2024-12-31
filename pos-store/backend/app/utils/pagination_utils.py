def paginate_results(items, page: int, limit: int):
    total = len(items)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        'items': items[start:end],
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    }
