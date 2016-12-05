def jsonEncoder(obj):
    if hasattr(obj, '__table__'):
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    return json.JSONEncoder.default(self, obj)

