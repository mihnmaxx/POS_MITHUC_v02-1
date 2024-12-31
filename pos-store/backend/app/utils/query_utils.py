def build_search_query(field: str, search_term: str = None):
    if not search_term:
        return {}
    return {field: {'$regex': search_term, '$options': 'i'}}
